# autogpt-node

AutoGPT for `Node.js`

[![npm version](https://img.shields.io/npm/v/autogpt-node.svg?style=flat)](https://www.npmjs.com/package/autogpt-node)
<!-- [![npm downloads](https://img.shields.io/npm/dm/autogpt-node.svg?style=flat)](https://www.npmjs.com/package/autogpt-node) -->

## Description

**Autonomous GPT as a Node.js library and CLI**

What is AutoGPT?

> AutoGPT attempts to make GPT-4 fully autonomous.
> AutoGPT is an experimental open-source project showcasing the capabilities of the GPT-4 language model. This program, driven by GPT-4, chains together LLM "thoughts", to autonomously achieve whatever goal you set. As one of the first examples of GPT-4 running fully autonomously, Auto-GPT pushes the boundaries of what is possible with AI.

This is not a finished product, just the beginning of the project. Join [Discord community](https://dsc.gg/invide) to get the latest updates.

## Installation

To try, directly use without installation

```bash
npx autogpt-node
```

OR to use as a library in your Node.js project, install as a dependency

```bash
npm install --save autogpt-node
```

OR to use as a command-line interface (CLI) in your terminal, install it globally

```bash
npm install -g autogpt-node
```

## Usage

### Without installation

```bash
npx autogpt-node --continuous=true --speak=true --headless=true
```

**Options**
* `continuous` - Should AutoGPT continue performing the next action without asking?
    * `true` - Fully autonoumous. No user permission needed before performing an action.
    * `false` (default) - Always ask for permission before performing an action.
    * `{n}` e.g. 3 - Don't ask for permission for each n actions.
* `headless` - Should the browser be loaded (for web analysis, scraping and search) in headless mode?
    * `true` (default) - Browser will load in headless mode.
    * `false` - You will see when AutoGPT visits the browser and how it interacts with it.
* `speak` - Should the response be converted from text to speech?
    * `true` - Will read out loud the responses.
    * `false` (default) - Will not speak.

After this, it will ask for some inputs such as - role your AutoGPT instance should play, list of goals to achieve, prompts to stop or continue, etc. 

```bash
# Name
What should we name it?
> SEO-GPT

# Role
What is the role of SEO-GPT?
> an AI to increase search traffic of a website using SEO

# Goal 1
Define the goal 1
> Fix technical SEO issues

# Goal 2
Define the goal 2
> Find the backlink opportunities

# ...3 more goals. enter to skip
```

Make sure to add one goal to stop the agent otherwise it might keep running for a very long time.

### As a CLI with global installation

```bash
autogpt-node --speak=true --headless=true
```

Make sure that you define [configurations](#configurations)

### As a Node.js library

```javascript
const autogpt = require('autogpt-node');

var seoGPT = new autogpt({ 
    openaiKey: process.env.OPENAI_API_KEY, 
    explain: true, 
    continuous: true 
});

seoGPT.setRole("an AI to help with SEO for website")

seoGPT.addGoal("Make a list of 10 technical SEO issues on the website")
seoGPT.addGoal("For each technical issue, write the possible fix alongwith code")
seoGPT.addGoal("Write the findings in a file")

seoGPT.on("thought", (thought, reasoning, plan, criticism) => {})

seoGPT.on("action", (command, arguments) => {})

seoGPT.on("end", (results) => {})

seoGPT.start()
```

## 🚀 Features

* 🌐 Can access internet and search to gather information
* 💾 Can manage memory for short-term and long-term
* 🗃️ Can store file and summarize with GPT-3.5
* 🧠 GPT-4 instances for text generation

## API
Document the API of your package here. ToDo.

## Configurations

| Variable | Description |
|----------|----------|
| OPENAI_API_KEY | Your OpenAI platform API key |
| ELEVELLABS_API_KEY| Your ElevenLabs API key for TTS |
| IMAGE_PROVIDER| How do you want to create images e.g. DALLE, STABLE_DIFFUSION |
| HUGGINGFACE_API_TOKEN | Your Hugging Face API token |

Make sure that `.env.sample` variables, whichever are relevant to you, are available in your environment

* When used as a Node.js library, the ideal way to configure various `.env.sample` variables is by copying `.env.sample` to a new file e.g. `.env`, then changing the values and then useing packages such as `dotenv` to add them to path. These variables can be access as `process.env.MY_ENV_VARIABLE_NAME` in your Node.js code.
* When used as a CLI, the ideal way to configure is by adding `.env.sample` variables in your `.bashrc` or equivalent bash configuration file of your operating system

### OpenAI API key configuration

Obtain your OpenAI API key from: https://platform.openai.com/account/api-keys.

To use OpenAI API key for Auto-GPT, you NEED to have billing set up (AKA paid account).

You can set up paid account at https://platform.openai.com/account/billing/overview.

### ElevenLabs API key configuration for Text-To-Speech (TTS)
Obtain your ElevenLabs API key from: https://elevenlabs.io. You can view your `xi-api-key` using the "Profile" tab on the website.

## Contributing
No contribution is small. Together, we can make this project that we all can be proud of. You can help with discovering bugs, new features, docs suggestions, code contribution, getting the word out, etc.

## Credits
All credit to inspire this project goes to the original AutoGPT project which was written in Python. After experimenting with it for a while, I realized that a **Node.js alternative to AutoGPT Python brings certain advantages** such as

* Performance: AutoGPT mostly performs I/O operations such as network requests, scraping, file writing/reading, etc. In general, Node.js performs better than Python for I/O intensive tasks. This is because Node.js is built on top of the V8 JavaScript engine, which uses non-blocking I/O, making it more efficient in handling requests. Python, on the other hand, uses blocking I/O, which can lead to slower performance for I/O intensive tasks.
* Ease of use: `npm` and other Node.js package managers are more user-friendly and efficient in terms of package installation and management. This is subjective but it is a fact that I wouldn't have started this project if I had not struggled setting up AutoGPT in the first place. 
* Ecosystem: Python has a great ecosystem, specially for AI/ML and data science related packages. On the other hand Node.js has a huge ecosystem of web/server/media/automation related libraries. This  gap in Node.js ecosystem for AI/ML related tasks and richness of the Node.js ecosystem for a web developer is appealing.

## Support
Join [Discord community](https://dsc.gg/invide) for discussions and announcement. To report a bug or submit a feature request, [create an issue on GitHub](https://github.com/gitcommitshow/autogpt-node/issues/new).

## License
MIT License