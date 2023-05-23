const fs = require("fs");
const prompt = require("./prompts/prompt");
const Config = require("./config");
const os = require("node:os");

/**
 * A class for generating custom prompt strings based on constraints, commands, resources, and performance evaluations.
 */
class AIConfig {
  constructor(
    aiName = "",
    aiRole = "",
    aiGoals = [],
    apiBudget = 0.0,
  ) {
    if (!aiGoals) {
      aiGoals = [];
    }
    this.aiName = aiName;
    this.aiRole = aiRole;
    this.aiGoals = aiGoals;
    this.apiBudget = apiBudget;
    this.promptGenerator = null;
    this.commandRegistry = null;
  }

  static load(configFilePath = "./ai_settings.json") {
    let configParams = {};
    try {
        fs.readFile(configFilePath, "utf8", (err, data) => {
            if (err) {
              throw(err);
            } else {
              configParams = JSON.parse(data);
              console.log(configParams);
            }
        });
    } catch (err) {
      throw new Error(err)
    }
    const aiName = configParams["ai_name"] || "";
    const aiRole = configParams["ai_role"] || "";
    const aiGoals = (configParams["ai_goals"] || []).map(
      goal =>
        goal.toString().replace("{}", "").replace("'", "").replace('"', "")
    );
    const apiBudget = configParams["api_budget"] || 0.0;

    return new AIConfig(aiName, aiRole, aiGoals, apiBudget);
  }

  static constructFullPrompt(
    promptGenerator = null
  ) {
    const promptStart = [
      "Your decisions must always be made independently without",
      "seeking user assistance. Play to your strengths as an LLM and pursue",
      "simple strategies with no legal complications.",
    ].join(" ");

    const config = new Config();
    if (promptGenerator === null) {
      promptGenerator = prompt.buildDefaultPromptGenerator();
    }

    promptGenerator.goals = this.aiGoals;
    promptGenerator.name = this.aiName;
    promptGenerator.role = this.aiRole;
    promptGenerator.commandRegistry = this.commandRegistry;
    //TODO add plugin support
    // for (const plugin of config.plugins) {
    //   if (!plugin.canHandlePostPrompt()) {
    //     continue;
    //   }
    //   promptGenerator = plugin.postPrompt(promptGenerator);
    // }

    if (config.executeLocalCommands) {
      // add OS info to prompt
      const osInfo = os.platform+" "+os.release()+" "+os.arch();

      promptStart += `\nThe OS you are running on is: ${osInfo}`;
    }

    // Construct full prompt
    const fullPrompt = `You are ${promptGenerator.name}, ${promptGenerator.role}\n${promptStart}\n\nGOALS:\n\n`;
    for (let i = 0; i < this.aiGoals.length; i++) {
      fullPrompt += `${i + 1}. ${this.aiGoals[i]}\n`;
    }
    if (this.apiBudget > 0.0) {
      fullPrompt += `\nIt takes money to let you run. Your API budget is ${this.apiBudget}`;
    }
    this.promptGenerator = promptGenerator;
    fullPrompt += `\n\n${promptGenerator.generatePromptString()}`;
    console.debug("======**** Full Prompt ******======")
    console.debug("      **********      ")
    console.debug(fullPrompt);
    console.debug("      **********      ")
    console.debug("======**********======")
    return fullPrompt;
  }
}


module.exports = AIConfig;