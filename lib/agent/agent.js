const { chatWithAI, createChatMessage } = require('../llm/chat');
const llmUtils = require('../llm/llmUtils');
const LogCycleHandler = require('../log/logCycleHandler');
const jsonUtils = require('../utils/jsonUtils');
const tokenCounter = require('../llm/tokenCounter');
const process = require('node:process');
const app = require('../app');
const Workspace = require('../workspace');

class Agent {
    constructor(options) {
      this.aiName = options.aiName;
      this.memory = options.memory;
      this.summaryMemory = "I was created.";
      this.lastMemoryIndex = 0;
      this.fullMessageHistory = options.fullMessageHistory;
      this.nextActionCount = options.nextActionCount;
      this.commandRegistry = options.commandRegistry;
      this.config = options.config;
      this.systemPrompt = options.systemPrompt;
      this.triggeringPrompt = options.triggeringPrompt;
      this.workspace = new Workspace(options.workspaceDirectory, options.config.restrictToWorkspace);
      this.createdAt = new Date().toISOString();
      this.cycleCount = 0;
      this.logCycleHandler = new LogCycleHandler();
    }
  
    startInteractionLoop() {
      // Interaction Loop
      this.cycleCount = 0;
      let commandName = null;
      let args = null;
      let userInput = "";
        
      process.on('SIGINT', () => {
        if (this.nextActionCount === 0) {
            return;
          }
          console.log(
            `Interrupt signal received. Stopping continuous command execution.`
          );
          this.nextActionCount = 0;
      });

      while (true) {
        // Discontinue if continuous limit is reached
        this.cycleCount++;
        this.logCycleHandler.logCountWithinCycle = 0;
        //TODO log full message history
        // this.logCycleHandler.logCycle(
        //   this.config.aiName,
        //   this.createdAt,
        //   this.cycleCount,
        //   this.fullMessageHistory,
        //   LogCycleHandler.FULL_MESSAGE_HISTORY_FILE_NAME,
        // );
        if (
          this.config.continuousMode &&
          this.config.continuousLimit > 0 &&
          this.cycleCount > this.config.continuousLimit
        ) {
          console.log(`Continuous Limit Reached: ${this.config.continuousLimit}`);
          break;
        }
        //TODO Add spinner
        // withSpinner("Thinking... ");
        console.log("Thinking... ");
        // Send message to AI, get response
        let assistantReply = chatWithAI(
          this,
          this.systemPrompt,
          this.triggeringPrompt,
          this.fullMessageHistory,
          this.memory,
          this.config.fastTokenLimit,
        );
  
        //TODO Fix json
        // assistantReply = fixJsonUsingMultipleTechniques(assistantReply);

        //TODO add plugin support
        // for (let plugin of this.config.plugins) {
        //   if (!plugin.canHandlePostPlanning()) {
        //     continue;
        //   }
        //   assistantReply = plugin.postPlanning(assistantReply);
        // }
  
        // Print Assistant thoughts
        if (assistantReply && (Object.keys(assistantReply).length !== 0)) {
          console.log(JSON.stringify(assistantReply));
          jsonUtils.validateJSON(assistantReply, jsonUtils.LLM_DEFAULT_RESPONSE_FORMAT);
          // Get command name and arguments
          try {
            //TODO print assistant thoughts
            // printAssistantThoughts(
            //   this.aiName,
            //   assistantReply,
            //   this.config.speakMode,
            // );
            commandName = assistantReply.command.name;
            // var arguments = assistantReply.command.args || {};
            //TODO add speak mode support
            // if (this.config.speakMode) {
            //   sayText("I want to execute {commandName}");
            // }
            
            //TODO Resolve path 
            // arguments = this._resolvePathlikeCommandArgs(arguments);
  
          } catch (e) {
            console.error("Error: \n", e);
          }
        }
        //TODO Log assistant reply
        // this.logCycleHandler.logCycle(
        //   this.config.aiName,
        //   this.createdAt,
        //   this.cycleCount,
        //   assistantReply,
        //   LogCycleHandler.NEXT_ACTION_FILE_NAME,
        // );
        
        console.log(`NEXT ACTION: COMMAND = ${commandName}  ARGUMENTS = ${args}`);
        if(!commandName){
          console.log("Exiting because no command was suggested. Something is wrong with ChatWithAI");
          break;  
        }

        //TODO Add support for non-continuous mode
        // if (!this.config.continuousMode && this.nextActionCount === 0) {
        //     // ### GET USER AUTHORIZATION TO EXECUTE COMMAND ###
        //     // Get key press: Prompt the user to press enter to continue or escape
        //     // to exit
        //     this.userInput = "";
        //     console.log("Enter 'y' to authorise command, 'y -N' to run N continuous commands, 's' to run this-feedback commands, ")
        //     console.log(`'n' to exit program, or enter feedback for ${this.aiName}...`);
        //     while (true) {
        //       if (this.config.chatMessagesEnabled) {
        //         consoleInput = cleanInput("Waiting for your response...");
        //       } else {
        //         consoleInput = cleanInput(
        //           Fore.MAGENTA + "Input:" + Style.RESET_ALL
        //         );
        //       }
        //       if (consoleInput.toLowerCase().strip() == this.config.authoriseKey) {
        //         userInput = "GENERATE NEXT COMMAND JSON";
        //         break;
        //       } else if (consoleInput.toLowerCase().strip() == "s") {
        //         console.log("-=-=-=-=-=-=-= THOUGHTS, REASONING, PLAN AND CRITICISM WILL NOW BE VERIFIED BY AGENT -=-=-=-=-=-=-=");
        //         thoughts = assistantReply.thoughts || {};
        //         thisFeedbackResp = this.getSelfFeedback(thoughts, this.config.fast_llm_model);
        //         console.log(`this FEEDBACK: ${thisFeedbackResp}`);
        //         userInput = thisFeedbackResp;
        //         commandName = "thisFeedback";
        //         break;
        //       } else if (consoleInput.toLowerCase().strip() == "") {
        //         console.warn("Invalid input format.");
        //         continue;
        //       } else if (consoleInput.toLowerCase().startswith(`${this.config.authoriseKey} -`)) {
        //         try {
        //           this.nextActionCount = abs(
        //             int(consoleInput.split(" ")[1])
        //           );
        //           userInput = "GENERATE NEXT COMMAND JSON";
        //         } catch (ValueError) {
        //           console.warn("Invalid input format. Please enter 'y -n' where n is the number of continuous tasks.");
        //           continue;
        //         }
        //         break;
        //       } else if (consoleInput.toLowerCase() == this.config.exitKey) {
        //         userInput = "EXIT";
        //         break;
        //       } else {
        //         userInput = consoleInput;
        //         commandName = "humanFeedback";
        //         //TODO Log human feedback
        //         // this.logCycleHandler.logCycle(
        //         //   this.config.aiName,
        //         //   this.createdAt,
        //         //   this.cycleCount,
        //         //   userInput,
        //         //   "human_feedback.json",
        //         // );
        //         break;
        //       }
        //     }
    
        //     // If the user does not authorize the command, break out of the loop
        //     if (userInput !== "y") {
        //       break;
        //     }
        // }
        
        // Execute command
        let result;
        if (commandName !== null && commandName.toLowerCase().startsWith("error")) {
            result = `Command ${commandName} threw the following error: ${args}`;
        } else if (commandName === "human_feedback") {
            result = `Human feedback: ${userInput}`;
        } else if (commandName === "this_feedback") {
            result = `this feedback: ${userInput}`;
        } else {
            //TODO Add support for plugins
            // for (const plugin of config.plugins) {
            //     if (!plugin.canHandlePreCommand()) {
            //         continue;
            //     }
            //     commandName, arguments = plugin.preCommand(commandName, arguments);
            // }
            const commandResult = app.executeCommand(
                this.commandRegistry,
                commandName,
                args,
                this.config.promptGenerator,
            );
            result = `Command ${commandName} returned: ${commandResult}`;
        
            const resultTLength = tokenCounter.countStringTokens(
                commandResult.toString(),
                this.config.fastLlmModel,
            );
            const memoryTLength = tokenCounter.countStringTokens(
                this.summaryMemory.toString(),
                this.config.fastLlmModel,
            );
            if (resultTLength + memoryTLength + 600 > this.config.fastTokenLimit) {
                result = `Failure: command ${commandName} returned too much output. \
                    Do not execute this command again with the same arguments.`;
            }
            
            //TODO Add plugin support
            // for (const plugin of config.plugins) {
            //     if (!plugin.canHandlePostCommand()) {
            //         continue;
            //     }
            //     result = plugin.postCommand(commandName, result);
            // }
            if (this.nextActionCount > 0) {
                this.nextActionCount -= 1;
            }
        
            // Check if there's a result from the command append it to the message
            // history
            if (result !== null) {
                this.fullMessageHistory.push(createChatMessage("system", result));
                    console.log("SYSTEM: "+ result);
                } else {
                    this.fullMessageHistory.push(createChatMessage("system", "Unable to execute command")
                );
                console.log("SYSTEM: "+ "Unable to execute command");
            }
        }
  
      }
    }
    
    getSelfFeedback(thoughts, llmModel) {
        // Get the AI's role
        const aiRole = this.config.aiRole;
      
        // Create a feedback prompt that introduces the AI and asks the supervisor to evaluate its thought process, reasoning, and plan.
        const feedbackPrompt = `Below is a message from me, an AI Agent, assuming the role of ${aiRole}. Whilst keeping knowledge of my slight limitations as an AI Agent Please evaluate my thought process, reasoning, and plan, and provide a concise paragraph outlining potential improvements. Consider adding or removing ideas that do not align with my role and explaining why, prioritizing thoughts based on their significance, or simply refining my overall thought process.`;
      
        // Get the thoughts from the dictionary.
        const reasoning = thoughts.reasoning || "";
        const plan = thoughts.plan || "";
        const thought = thoughts.thoughts || "";
        const feedbackThoughts = thought + reasoning + plan;
      
        // Create a list of messages, with the first message being the feedback prompt and the second message being the thoughts.
        const messages = [
          {
            "role": "user",
            "content": feedbackPrompt + feedbackThoughts,
          },
        ];
      
        //TODO Log the messages to a file.
        // this.logCycleHandler.logCycle(
        //   this.config.aiName,
        //   this.createdAt,
        //   this.cycleCount,
        //   messages,
        //   LogCycleHandler.PROMPT_SUPERVISOR_FEEDBACK_FILE_NAME,
        // );
      
        // Generate a feedback response using the LLM model.
        const feedback = llmUtils.createChatCompletion({ messages: messages, model:llmModel });
      
        //TODO Log the feedback response to a file.
        // this.logCycleHandler.logCycle(
        //   this.config.aiName,
        //   this.createdAt,
        //   this.cycleCount,
        //   feedback,
        //   LogCycleHandler.SUPERVISOR_FEEDBACK_FILE_NAME,
        // );
      
        // Return the feedback response.
        return feedback;
    }

    _resolvePathlikeCommandArgs(commandArgs) {
        if (commandArgs.directory === "" || commandArgs.directory === "/") {
            commandArgs["directory"] = this.workspace.root;
        } else {
          for (const pathlike of ["filename", "directory", "clone_path"]) {
            if (pathlike in commandArgs) {
              commandArgs[pathlike] = this.workspace.getPath(commandArgs[pathlike]);
            }
          }
        }
        return commandArgs;
      }
      
      
}
  
module.exports = Agent
  