#!/usr/bin/env node

const { Command } = require('commander');
const { inquirer } = require('inquirer');
const chalk = require('chalk');
const AutoGPT = require('../lib/autogpt.js');

const program = new Command();

program
  .option('-c, --continuous <n>', 'set the continuous mode', parseInt)
  .option('-h, --headless [headless]', 'set the headless mode')
  .option('-s, --speak [speak]', 'set the speak mode')
  .parse(process.argv);

// Create a new AutoGPT instance
const seoGPT = new AutoGPT({
  openAIKey: process.env.OPENAI_API_KEY,
  explain: true,
  continuous: program.continuous || false,
  headless: program.headless === undefined ? true : program.headless,
  speak: program.speak || false
});

async function askRoleAndGoals() {
  const questions = [
    {
      type: 'input',
      name: 'name',
      message: 'What should we name it?',
      default: 'SEO-GPT'
    },
    {
      type: 'input',
      name: 'role',
      message: 'What is the role of the AutoGPT?',
      default: 'an AI to increase search traffic of a website using SEO'
    }
  ];

  const goals = [];
  let goalIndex = 1;

  while (goalIndex <= 5) {
    const question = {
      type: 'input',
      name: `goal${goalIndex}`,
      message: `Define goal ${goalIndex}`,
      default: ''
    };

    const { [`goal${goalIndex}`]: goal } = await inquirer.prompt(question);

    if (goal) {
      goals.push(goal);
      goalIndex++;
    } else {
      break;
    }
  }

  return { name: questions[0].default, role: questions[1].default, goals };
}

async function run() {
  try {
    console.log(chalk.blue('Welcome to AutoGPT CLI!'));

    const { name, role, goals } = await askRoleAndGoals();

    seoGPT.setName(name);
    seoGPT.setRole(role);

    for (let i = 0; i < goals.length; i++) {
      seoGPT.addGoal(goals[i]);
    }

    seoGPT.on('thought', (thought, reasoning, plan, criticism) => {
      console.log(chalk.green(`AutoGPT thinks: ${thought}`));
      if (reasoning) {
        console.log(chalk.green(`Reasoning: ${reasoning}`));
      }
      if (plan) {
        console.log(chalk.green(`Plan: ${plan}`));
      }
      if (criticism) {
        console.log(chalk.green(`Criticism: ${criticism}`));
      }
    });

    seoGPT.on('action', (command, arguments) => {
      console.log(chalk.blue(`Executing action: ${command} ${arguments}`));
    });

    seoGPT.on('end', (results) => {
      console.log(chalk.blue('AutoGPT has finished!'));
      console.log(chalk.blue('Results:'));
      console.log(results);
    });

    seoGPT.start();
  } catch (error) {
    console.error(chalk.red(`An error occurred: ${error.message}`));
  }
}

run();
