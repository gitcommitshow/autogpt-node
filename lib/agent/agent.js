const { chatWithAI } = require('../llm/chat');

class Agent {
    constructor(
      aiName,
      memory,
      fullMessageHistory,
      nextActionCount,
      commandRegistry,
      config,
      systemPrompt,
      triggeringPrompt,
      workspaceDirectory,
    ) {
      this.aiName = aiName;
      this.memory = memory;
      this.summaryMemory = "I was created.";
      this.lastMemoryIndex = 0;
      this.fullMessageHistory = fullMessageHistory;
      this.nextActionCount = nextActionCount;
      this.commandRegistry = commandRegistry;
      this.config = config;
      this.systemPrompt = systemPrompt;
      this.triggeringPrompt = triggeringPrompt;
      this.workspace = new Workspace(workspaceDirectory, config.restrictToWorkspace);
      this.createdAt = new Date().toISOString();
      this.cycleCount = 0;
      this.logCycleHandler = new LogCycleHandler();
    }
  
    startInteractionLoop() {
      // Interaction Loop
      this.cycleCount = 0;
      let commandName = null;
      let arguments = null;
      let userInput = "";
  
      // Signal handler for interrupting y -N
      function signalHandler(signum, frame) {
        if (this.nextActionCount === 0) {
          return;
        }
        console.log(
          `Interrupt signal received. Stopping continuous command execution.`
        );
        this.nextActionCount = 0;
      }
  
      signal.signal(signal.SIGINT, signalHandler);
  
      while (true) {
        // Discontinue if continuous limit is reached
        this.cycleCount++;
        this.logCycleHandler.logCountWithinCycle = 0;
        this.logCycleHandler.logCycle(
          this.config.aiName,
          this.createdAt,
          this.cycleCount,
          this.fullMessageHistory,
          "full_message_history.json",
        );
        if (
          this.config.continuousMode &&
          this.config.continuousLimit > 0 &&
          this.cycleCount > this.config.continuousLimit
        ) {
          console.log(
            "Continuous Limit Reached: ",
            this.config.continuousLimit,
          );
          break;
        }
        // Send message to AI, get response
        withSpinner("Thinking... ");
        let assistantReply = chatWithAI(
          this,
          this.systemPrompt,
          this.triggeringPrompt,
          this.fullMessageHistory,
          this.memory,
          this.config.fastTokenLimit,
        );
  
        assistantReply = fixJsonUsingMultipleTechniques(assistantReply);
        for (let plugin of this.config.plugins) {
          if (!plugin.canHandlePostPlanning()) {
            continue;
          }
          assistantReply = plugin.postPlanning(assistantReply);
        }
  
        // Print Assistant thoughts
        if (assistantReply !== {}) {
          validateJson(assistantReply, LLM_DEFAULT_RESPONSE_FORMAT);
          // Get command name and arguments
          try {
            printAssistantThoughts(
              this.aiName,
              assistantReply,
              this.config.speakMode,
            );
            commandName, arguments = getCommand(assistantReply);
            if (this.config.speakMode) {
              sayText("I want to execute {commandName}");
            }
  
            arguments = this._resolvePathlikeCommandArgs(arguments);
  
          } catch (e) {
            console.error("Error: \n", e);
          }
        }
        this.logCycleHandler.logCycle(
          this.config.aiName,
          this.createdAt,
          this.cycleCount,
          assistantReply,
          "next_action.json",
        );
  
        console.log(
          "NEXT ACTION: ",
          `COMMAND = ${commandName}  ARGUMENTS = ${arguments}`,
        );
  
        if (!this.config.continuousMode && this.nextActionCount === 0) {
            // ### GET USER AUTHORIZATION TO EXECUTE COMMAND ###
            // Get key press: Prompt the user to press enter to continue or escape
            // to exit
            this.userInput = "";
            console.log(
              "Enter 'y' to authorise command, 'y -N' to run N continuous commands, 's' to run self-feedback commands, "
              "'n' to exit program, or enter feedback for "
              f"{this.aiName}..."
            );
            while (true) {
              if (this.config.chatMessagesEnabled) {
                consoleInput = cleanInput("Waiting for your response...");
              } else {
                consoleInput = cleanInput(
                  Fore.MAGENTA + "Input:" + Style.RESET_ALL
                );
              }
              if (consoleInput.toLowerCase().strip() == this.config.authoriseKey) {
                userInput = "GENERATE NEXT COMMAND JSON";
                break;
              } else if (consoleInput.toLowerCase().strip() == "s") {
                console.log(
                  "-=-=-=-=-=-=-= THOUGHTS, REASONING, PLAN AND CRITICISM WILL NOW BE VERIFIED BY AGENT -=-=-=-=-=-=-=",
                  Fore.GREEN,
                  "",
                );
                thoughts = assistantReply.get("thoughts", {});
                selfFeedbackResp = this.getSelfFeedback(thoughts, this.config.fastLllmModel);
                console.log(
                  f"SELF FEEDBACK: {selfFeedbackResp}",
                  Fore.YELLOW,
                  "",
                );
                userInput = selfFeedbackResp;
                commandName = "selfFeedback";
                break;
              } else if (consoleInput.toLowerCase().strip() == "") {
                console.warn("Invalid input format.");
                continue;
              } else if (consoleInput.toLowerCase().startswith(f"{this.config.authoriseKey} -")) {
                try {
                  this.nextActionCount = abs(
                    int(consoleInput.split(" ")[1])
                  );
                  userInput = "GENERATE NEXT COMMAND JSON";
                } catch (ValueError) {
                  console.warn(
                    "Invalid input format. Please enter 'y -n' where n is"
                    " the number of continuous tasks."
                  );
                  continue;
                }
                break;
              } else if (consoleInput.toLowerCase() == this.config.exitKey) {
                userInput = "EXIT";
                break;
              } else {
                userInput = consoleInput;
                commandName = "humanFeedback";
                this.logCycleHandler.logCycle(
                  this.config.aiName,
                  this.createdAt,
                  this.cycleCount,
                  userInput,
                  "human_feedback.json",
                );
                break;
              }
            }
    
            // If the user does not authorize the command, break out of the loop
            if (userInput !== "y") {
              break;
            }
    
            // Execute the command
            if (commandName === "GENERATE NEXT COMMAND JSON") {
              nextCommandJson = this.generateNextCommandJson(
                assistantReply,
                this.config.fastLllmModel,
              );
              this.logCycleHandler.logCycle(
                this.config.aiName,
                this.createdAt,
                this.cycleCount,
                nextCommandJson,
                "next_command_json.json",
              );
              console.log(nextCommandJson);
            } else if (commandName === "selfFeedback") {
              this.executeSelfFeedback(thoughts, this.config.fastLllmModel);
            } else {
              this.executeCommand(commandName, arguments);
            }
          }
        }
      }
    
      // ...
    }
      // ...

  executeCommand(commandName, arguments) {
    // Execute the command
    console.log(
      `Executing command: ${commandName} with arguments: ${arguments}`,
    );
  }

  generateNextCommandJson(assistantReply, fastLllmModel) {
    // Generate the next command JSON
    return fastLllmModel.generateNextCommandJson(assistantReply);
  }

  executeSelfFeedback(thoughts, fastLllmModel) {
    // Execute the self-feedback command
    console.log(
      `Executing self-feedback command with thoughts: ${thoughts}`,
    );
    fastLllmModel.executeSelfFeedback(thoughts);
  }

  // ...
}
// ...

class Config {
    constructor() {
      this.aiName = "Bard";
      this.memory = new Map();
      this.fullMessageHistory = [];
      this.nextActionCount = 0;
      this.commandRegistry = new Map();
      this.config = {
        continuousMode: false,
        continuousLimit: 0,
        authoriseKey: "y",
        exitKey: "n",
        chatMessagesEnabled: true,
      };
      this.fastTokenLimit = 100;
      this.plugins = [];
      this.speakMode = false;
      this.workspaceDirectory = "./workspace";
    }
  
    // ...
  }
  
  // ...
  
  module.exports = {
    Agent,
    Config,
  };
  