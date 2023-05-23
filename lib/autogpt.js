// cli.js

const OpenAI = require('./openai');
// const Scraper = require('./browser'); 
const { executeCommand } = require('./commands');
const { readFromFile, writeToFile } = require('./storage');
const EventEmitter = require('node:events');
const prompt = require('./prompts/prompt');
const CommandRegistry = require('./commands/commandRegistry');


class AutoGPT extends EventEmitter{
  constructor(options) {
    super();
    console.debug("Creating new AutoGPT instance...");
    this.openai = new OpenAI(options.openaiKey);
    // this.scraper = new Scraper();
    this.explain = options.explain || false;
    this.continuous = options.continuous || false;
    this.name = '';
    this.role = '';
    this.goals = [];
    this.actions = [];
    this.thoughts = [];
    this.criticisms = [];
    console.debug("New AutoGPT instance is ready!");
  }

  setName(name) {
    this.name = name;
  }

  setRole(role) {
    this.role = role;
  }

  addGoal(goal) {
    this.goals.push(goal);
  }

  async start() {
    // const previousData = readFromFile('data.json');
    // if (previousData) {
    //   this.role = previousData.role;
    //   this.goals = previousData.goals;
    //   this.actions = previousData.actions;
    //   this.thoughts = previousData.thoughts;
    //   this.criticisms = previousData.criticisms;
    //   console.log('Previous data loaded successfully');
    // } else {
    //   console.log('Starting a new session');
    // }

    for (let i = 0; i < this.goals.length; i++) {
      const goal = this.goals[i];
      const thought = await this.openai.generateThought(goal);

      this.thoughts.push(thought);
      console.log(`Thought generated: ${thought}`);

      const reasoning = this.explain ? await this.openai.generateReasoning(thought) : '';
      console.log(`Reasoning: ${reasoning}`);

      const plan = await this.openai.generatePlan(thought);
      console.log(`Plan generated: ${plan}`);

      const criticism = await this.openai.generateCriticism(plan);
      this.criticisms.push(criticism);
      console.log(`Criticism: ${criticism}`);

      this.emit("thought", thought, reasoning, plan, criticism);

      const action = await this.openai.generateAction(plan);
      this.actions.push(action);
      console.log(`Action: ${action}`);

      this.emit("action", action);
      
      const output = await executeCommand(action);
      console.log(`Output: ${output}`);

      this.emit("end", output);

      // await this.scraper.scrapPage();
      const data = {
        role: this.role,
        goals: this.goals,
        actions: this.actions,
        thoughts: this.thoughts,
        criticisms: this.criticisms
      };
      writeToFile(data, 'data.json');
    }

    console.log('All goals completed successfully');
  }

  async interact(){
    
    //TODO add support for workspace directory and file logger
    // workspaceDirectory = path.join(
    //   __dirname,
    //   "auto_gpt_workspace"
    // );
    // // later TODO: pass in the ai_settings file and the env file and have them cloned into
    // //   the workspace directory so we can bind them to the agent.
    // workspaceDirectory = Workspace.makeWorkspace(workspaceDirectory);
    // config.workspacePath = workspaceDirectory.toString();
    
    // // HACK: doing this here to collect some globals that depend on the workspace.
    // fileLoggerPath = path.join(workspaceDirectory, "file_logger.txt");
    // if (!fileLoggerPath.exists()) {
    //   with (new File(fileLoggerPath, "w", { encoding: "utf-8" })) {
    //     f.write("File Operation Logger ");
    //   }
    // }
    // config.fileLoggerPath = fileLoggerPath.toString();
    
    let ai_config = prompt.constructMainAiConfig();
    const commandRegistry = new CommandRegistry();
    const commandCategories = [
      "./analyzeCode",
      "./audioText",
      "./executeCode",
      "./fileOperations",
      "./gitOperations",
      "./googleSearch",
      "./imageGen",
      "./improveCode",
      "./twitter",
      "./webSelenium",
      "./writeTests",
      "../app",
      "./taskStatuses",
    ];
    commandCategories.forEach(commandCategory => {
      commandRegistry.importCommands(commandCategory);
    });
    ai_config.command_registry = commandRegistry;

    system_prompt = ai_config.constructFullPrompt()

    agent = Agent(
      ai_name=this.name,
      memory=null,
      full_message_history=[],
      next_action_count=0,
      command_registry=command_registry,
      config=ai_config,
      system_prompt=system_prompt,
      triggering_prompt=prompt.DEFAULT_TRIGGERING_PROMPT,
      workspace_directory=workspace_directory,
    )
    agent.start_interaction_loop()
  }
}

module.exports = AutoGPT;
