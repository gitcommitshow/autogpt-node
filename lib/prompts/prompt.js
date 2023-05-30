const Config = require('../config');
const AIConfig = require('../aiConfig')
const ApiManager = require('../llm/apiManager');
const PromptGenerator = require('./promptGenerator');
const PromptConfig = require('../promptConfig');

var config = new Config();

exports.DEFAULT_TRIGGERING_PROMPT = "Determine which next command to use, and respond using the format specified above:";
exports.constructMainAiConfig = constructMainAiConfig;
exports.buildDefaultPromptGenerator = buildDefaultPromptGenerator;

function constructMainAiConfig() {
    const aiConfig = AIConfig.load(config.aiSettingsFile);
  
    //TODO prompt user for inputs
    // if (config.skipReprompt && config.aiName) {
    //   console.log(
    //     "Name : " + config.aiName,
    //     "Role : " + config.aiRole,
    //     "Goals: " + config.aiGoals,
    //     "API Budget: " + (config.apiBudget <= 0 ? "infinite" : "$" + config.apiBudget),
    //   );
    // } else if (config.aiName) {
    //   console.log("Welcome back! Would you like me to return to being " + config.aiName);
    //   const shouldContinue = cleanInput(
    //     "Continue with the last settings?\n" +
    //       "Name:  " + config.aiName + "\n" +
    //       "Role:  " + config.aiRole + "\n" +
    //       "Goals: " + config.aiGoals + "\n" +
    //       "API Budget: " + (config.apiBudget <= 0 ? "infinite" : "$" + config.apiBudget) +
    //       `\nContinue (${config.authoriseKey}/${config.exitKey}): `,
    //   );
    //   if (shouldContinue.toLowerCase() === config.exitKey) {
    //     config = AIConfig();
    //   }
    // }
  
    // if (!config.aiName) {
    //   config = promptUser();
    //   config.save(config.ai_settings_file);
    // }
  
    if (aiConfig.restrictToWorkspace) {
      console.log(
        "NOTE:All files/directories created by this agent can be found inside its workspace at:\n" +
          `${aiConfig.workspacePath}`,
      );
    }
  
    // set the total api budget
    const apiManager = new ApiManager();
    apiManager.setTotalBudget(aiConfig.apiBudget);
  
    // Agent Created, print message
    console.log(aiConfig.aiName + " has been created with the following details:");
  
    // Print the ai config details
    // Name
    console.log("Name: " + aiConfig.aiName);
    // Role
    console.log("Role: " + aiConfig.aiRole);
    // Goals
    console.log("Goals: ");
    for (const goal of aiConfig.aiGoals) {
      console.log("- " + goal);
    }
  
    return aiConfig;
  }
  

  function buildDefaultPromptGenerator() {
    // Initialize the PromptGenerator object
    const promptGenerator = new PromptGenerator();
  
    // Initialize the PromptConfig object and load the file set in the main config (default: prompts_settings.json)
    const promptConfig = new PromptConfig(config.promptSettingsFile);
  
    // Add constraints to the PromptGenerator object
    for (const constraint of promptConfig.constraints) {
      promptGenerator.addConstraint(constraint);
    }
  
    // Add resources to the PromptGenerator object
    for (const resource of promptConfig.resources) {
      promptGenerator.addResource(resource);
    }
  
    // Add performance evaluations to the PromptGenerator object
    for (const performanceEvaluation of promptConfig.performance_evaluations) {
      promptGenerator.addPerformanceEvaluation(performanceEvaluation);
    }
  
    return promptGenerator;
  }
  