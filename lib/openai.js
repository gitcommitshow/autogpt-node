const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

class OpenAIClient {
  async generateThought(prompt) {
    console.debug("Creating thought using prompt: "+prompt)
    try {
      const gptResponse = await openai.createChatCompletion({
        prompt: prompt,
        max_tokens: 1024,
        n: 1,
        stop: ['\n', 'Human:', 'AI:'],
        temperature: 0.5
      });

      return gptResponse.data.choices[0].text.trim();
    } catch (error) {
      console.error(`OpenAI API error: ${error}`);
    }
  }

  async generateReasoning(prompt) {
    try {
      const gptResponse = await openai.createChatCompletion({
        prompt: prompt,
        max_tokens: 1024,
        n: 1,
        stop: ['\n', 'Human:', 'AI:'],
        temperature: 0.5
      });

      return gptResponse.data.choices[0].text.trim();
    } catch (error) {
      console.error(`OpenAI API error: ${error}`);
    }
  }

  async generatePlan(prompt) {
    try {
      const gptResponse = await openai.createChatCompletion({
        prompt: prompt,
        max_tokens: 1024,
        n: 1,
        stop: ['\n', 'Human:', 'AI:'],
        temperature: 0.5
      });

      return gptResponse.data.choices[0].text.trim();
    } catch (error) {
      console.error(`OpenAI API error: ${error}`);
    }
  }

  async generateCriticism(prompt) {
    try {
      const gptResponse = await openai.createChatCompletion({
        prompt: prompt,
        max_tokens: 1024,
        n: 1,
        stop: ['\n', 'Human:', 'AI:'],
        temperature: 0.5
      });

      return gptResponse.data.choices[0].text.trim();
    } catch (error) {
      console.error(`OpenAI API error: ${error}`);
    }
  }

  async generateAction(prompt) {
    try {
      const gptResponse = await openai.createChatCompletion({
        prompt: prompt,
        max_tokens: 1024,
        n: 1,
        stop: ['\n', 'Human:', 'AI:'],
        temperature: 0.5
      });

      return gptResponse.data.choices[0].text.trim();
    } catch (error) {
      console.error(`OpenAI API error: ${error}`);
    }
  }
}

module.exports = OpenAIClient;
