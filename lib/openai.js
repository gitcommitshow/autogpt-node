const OpenAI = require('openai-api');
const openai = new OpenAI(process.env.OPENAI_API_KEY);

class OpenAIClient {
  async generateThought(prompt) {
    try {
      const gptResponse = await openai.complete({
        prompt: prompt,
        max_tokens: 1024,
        n: 1,
        stop: ['\n', 'Human:', 'AI:'],
        temperature: 0.5
      });

      return gptResponse.choices[0].text.trim();
    } catch (error) {
      console.error(`OpenAI API error: ${error}`);
    }
  }

  async generateReasoning(prompt) {
    try {
      const gptResponse = await openai.complete({
        prompt: prompt,
        max_tokens: 1024,
        n: 1,
        stop: ['\n', 'Human:', 'AI:'],
        temperature: 0.5
      });

      return gptResponse.choices[0].text.trim();
    } catch (error) {
      console.error(`OpenAI API error: ${error}`);
    }
  }

  async generatePlan(prompt) {
    try {
      const gptResponse = await openai.complete({
        prompt: prompt,
        max_tokens: 1024,
        n: 1,
        stop: ['\n', 'Human:', 'AI:'],
        temperature: 0.5
      });

      return gptResponse.choices[0].text.trim();
    } catch (error) {
      console.error(`OpenAI API error: ${error}`);
    }
  }

  async generateCriticism(prompt) {
    try {
      const gptResponse = await openai.complete({
        prompt: prompt,
        max_tokens: 1024,
        n: 1,
        stop: ['\n', 'Human:', 'AI:'],
        temperature: 0.5
      });

      return gptResponse.choices[0].text.trim();
    } catch (error) {
      console.error(`OpenAI API error: ${error}`);
    }
  }
}

module.exports = OpenAIClient;
