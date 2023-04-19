// cli.js

const OpenAI = require('./openai');
const Scraper = require('./browser');
const { executeCommand } = require('./commands');
const { readFromFile, writeToFile } = require('./storage');

class Autogpt {
  constructor(options) {
    this.openai = new OpenAI(options.openaiKey);
    this.scraper = new Scraper();
    this.explain = options.explain || false;
    this.continuous = options.continuous || false;
    this.role = '';
    this.goals = [];
    this.actions = [];
    this.thoughts = [];
    this.criticisms = [];
  }

  setRole(role) {
    this.role = role;
  }

  addGoal(goal) {
    this.goals.push(goal);
  }

  async start() {
    const previousData = readFromFile('data.json');
    if (previousData) {
      this.role = previousData.role;
      this.goals = previousData.goals;
      this.actions = previousData.actions;
      this.thoughts = previousData.thoughts;
      this.criticisms = previousData.criticisms;
      console.log('Previous data loaded successfully');
    } else {
      console.log('Starting a new session');
    }

    for (let i = 0; i < this.goals.length; i++) {
      const goal = this.goals[i];
      const thought = await this.openai.generateThought(goal);
      this.thoughts.push(thought);
      console.log(`Thought generated: ${thought}`);

      const reasoning = this.explain ? await this.openai.explainThought(thought) : '';
      console.log(`Reasoning: ${reasoning}`);

      const plan = await this.openai.generatePlan(thought);
      console.log(`Plan generated: ${plan}`);

      const criticism = await this.openai.criticizePlan(plan);
      this.criticisms.push(criticism);
      console.log(`Criticism: ${criticism}`);

      const action = await this.openai.generateAction(plan);
      this.actions.push(action);
      console.log(`Action: ${action}`);

      const output = await executeCommand(action);
      console.log(`Output: ${output}`);

      await this.scraper.scrapPage();
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
}

module.exports = Autogpt;
