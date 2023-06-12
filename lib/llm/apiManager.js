const { Configuration, OpenAIApi } = require("openai");
const { COSTS } = require('./modelsInfo')
const Config = require("../config");

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
  
    // Creates a chat completion
    // @param {Object} options The options for the chat completion.
    // @param {string[]} options.messages The messages to be completed.
    // @param {string} options.model The name of the model to be used for completion.
    // @param {number} options.temperature The temperature of the completion. A higher temperature will result in more creative and expressive completions, while a lower temperature will result in more literal completions.
    // @param {number} options.maxTokens The maximum number of tokens to generate.
    // @param {string} options.deploymentId The deployment ID of the completion model. This is required if the model is deployed to a remote server.
    // @returns {Promise<ChatCompletion>} A promise that resolves with the chat completion. */ createChatCompletion(options: { messages: string[], model: string, temperature: number, maxTokens: number, deploymentId: string, }): Promise<ChatCompletion>;
    async createChatCompletion(options) {
      const cfg = new Config();
      if (options.model === undefined) {
        options.model = cfg.fastLlmModel;
      }
      if (options.temperature === undefined) {
        options.temperature = cfg.temperature;
      }
      let openaiOptions = {
        model: options.model,
        messages: options.messages,
        stop: ['\n', 'Human:', 'AI:'],
        temperature: options.temperature,
        max_tokens: options.maxTokens,
        n: 1
      }
      if (options.deploymentId){
        openaiOptions["deployment_id"] = options.deploymentId;
      }
      try {
        let response = await openai.createChatCompletion(openaiOptions);
        let data = response.data;
        if (data && !data.error) {
          console.log("Response:", data);
          const promptTokens = data.usage.prompt_tokens;
          const completionTokens = data.usage.completion_tokens;
          const totalTokens = data.usage.total_tokens;
          console.debug("Total cost of this openai.createChatCompletion req: "+ totalTokens);
          this.updateCost(promptTokens, completionTokens, options.model);
        }
        return data.choices[0].message["content"];
      } catch(error){
        console.debug("Error in openai api request");
        if (error.response) {
          // The server responded with a status code that falls out of the range of 2xx
          console.error('Server responded with error code:', error.response.status);
          console.error('Error response data:', error.response.data);
          if (error.response.status === 401) {
            if(!configuration.apiKey){
              console.log("OPENAI_API_KEY is missing. Set it with `export OPENAI_API_KEY='your_api_key'`")
            } else { 
              console.debug("The OPENAI_API_KEY is not correct for chat completion request: "+configuration.apiKey);
            }
          }
        } else {
          if (error.request) {
            console.error('No response received:', error.request);
          }
          // Something happened in setting up the request that triggered an error
          console.error('Error setting up request:', error.message);
        }
        console.error('Error config:', error.config);
        throw error;
      }
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