const { Configuration, OpenAIApi } = require("openai");
const { COSTS } = require('./modelsInfo')

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

class ApiManager {
    constructor() {
      this.totalPromptTokens = 0;
      this.totalCompletionTokens = 0;
      this.totalCost = 0;
      this.totalBudget = 0;
      this.models = null;
    }
  
    reset() {
      this.totalPromptTokens = 0;
      this.totalCompletionTokens = 0;
      this.totalCost = 0;
      this.totalBudget = 0;
      this.models = null;
    }
  
    async createChatCompletion(
      messages,
      model,
      temperature,
      maxTokens,
      deploymentId,
    ) {
      const cfg = new Config();
      if (temperature === undefined) {
        temperature = cfg.temperature;
      }
      let response;
      if (deploymentId === undefined) {
        response = await openai.createChatCompletion.create({
          model: model,
          messages: messages,
          stop: ['\n', 'Human:', 'AI:'],
          temperature: temperature,
          max_tokens: maxTokens,
          n: 1
        });
      } else {
        response = await openai.createChatCompletion.create({
          deployment_id: deploymentId,
          model: model,
          messages: messages,
          stop: ['\n', 'Human:', 'AI:'],
          temperature: temperature,
          max_tokens: maxTokens,
          n: 1
        });
      }
      if (!response.error) {
        console.log("Response:", response);
        const promptTokens = response.usage.prompt_tokens;
        const completionTokens = response.usage.completion_tokens;
        const totalTokens = response.usage.total_tokens;
        console.debug("Total cost of this openai.createChatCompletion req: "+ totalTokens);
        this.updateCost(promptTokens, completionTokens, model);
      }
      return response;
    }
  
    updateCost(promptTokens, completionTokens, model) {
      this.totalPromptTokens += promptTokens;
      this.totalCompletionTokens += completionTokens;
      this.totalCost += (
        promptTokens * COSTS[model]["prompt"]
        + completionTokens * COSTS[model]["completion"]
      ) / 1000;
      console.log("Total running cost: $", this.totalCost.toFixed(3));
    }
  
    setTotalBudget(totalBudget) {
      this.totalBudget = totalBudget;
    }
  
    getTotalPromptTokens() {
      return this.totalPromptTokens;
    }
  
    getTotalCompletionTokens() {
      return this.totalCompletionTokens;
    }
  
    getTotalCost() {
      return this.totalCost;
    }
  
    getTotalBudget() {
      return this.totalBudget;
    }
  
    async getModels() {
      if (this.models === null) {
        const allModels = await openai.listModels();
        this.models = allModels.data.filter((model) => model.id.includes("gpt"));
      }
      return this.models;
    }
  }  


module.exports = ApiManager;