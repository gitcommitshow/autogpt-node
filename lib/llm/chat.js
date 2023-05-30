const TokenCounter = require('../llm/tokenCounter');
const time = require('../utils/time');
const llmUtils = require('./llmUtils');
const ApiManager = require('./apiManager');
const Config = require('../config')

const config = new Config();

exports.chatWithAI = chatWithAI;
exports.createChatMessage = createChatMessage;

function createChatMessage(role, content) {
    return {
      role,
      content,
    };
}
  
function generateContext(prompt, relevantMemory, fullMessageHistory, model) {
    const currentContext = [
        createChatMessage("system", prompt),
        createChatMessage(
        "system",
        `The current time and date is ${time.getCurrentTime("America/Los_Angeles")}`,
        ),
        relevantMemory && createChatMessage(
        "system",
        `This reminds you of these events from your past:\n${relevantMemory}\n\n`,
        ),
    ];

    // Add messages from the full message history until we reach the token limit
    const nextMessageToAddIndex = fullMessageHistory.length - 1;
    const insertionIndex = currentContext.length;
    // Count the currently used tokens
    const currentTokensUsed = TokenCounter.countMessageTokens(currentContext, model);
    return {
        currentTokensUsed: currentTokensUsed,
        currentContext: currentContext,
        nextMessageToAddIndex: nextMessageToAddIndex,
        insertionIndex: insertionIndex
    };
}


/**
 * @function chatWithAI
 * @description Interact with the OpenAI API, sending the prompt, user input, message history,
 * and permanent memory.
 *
 * @param {object} agent The agent object.
 * @param {string} prompt The prompt for the AI.
 * @param {string} userInput The user input.
 * @param {array} fullMessageHistory The full message history.
 * @param {object} permanentMemory The permanent memory.
 * @param {number} tokenLimit The maximum number of tokens allowed in the API call.
 *
 * @returns {string} The AI's response.
 */
async function chatWithAI(agent, prompt, userInput, fullMessageHistory, permanentMemory, tokenLimit) {
    while (true) {
      try {
        model = config.fastLlmModel  // TODO: Change model from hardcode to argument
  
        // Generate context
        const currentContext = generateContext(
            prompt, relevantMemory, fullMessageHistory, model
        );

        if(tokenLimit && tokenLimit>0){
            // Deal with token limits
            addMessagesToContextUntilTokenLimit(fullMessageHistory, currentContext, tokenLimit, model, permanentMemory)
        }

        // Add user input to context
        currentContext.push(createChatMessage("user", userInput));

        // Get assistant response
        const assistantReply = llmUtils.createChatCompletion(
            model=model, messages=currentContext, maxTokens=tokensRemaining
        );
  
        // Update full message history
        fullMessageHistory.push(createChatMessage("user", userInput));
        fullMessageHistory.push(
            createChatMessage("assistant", assistantReply)
        );
  
        return assistantReply;
      } catch (RateLimitError) {
        await time.sleep(10);
      }
    }
  }
  

function addMessagesToContextUntilTokenLimit(
    fullMessageHistory,
    currentContext,
    tokenLimit,
    model,
    permanentMemory,
  ) {
    // Reserve 1000 tokens for the response
    const sendTokenLimit = tokenLimit - 1000;
  
    // Account for user input
    let currentTokensUsed = currentContext.currentTokensUsed;
    currentTokensUsed += TokenCounter.countMessageTokens(
      [createChatMessage("user", userInput)],
      model,
    );
  
    // Account for memory
    currentTokensUsed += 500;
  
    // Add Messages until the token limit is reached or there are no more messages to add.
    let nextMessageToAddIndex = currentContext.nextMessageToAddIndex;
    while (nextMessageToAddIndex >= 0) {
      // Get the next message to add
      const messageToAdd = fullMessageHistory[nextMessageToAddIndex];
  
      // Count the number of tokens in the message
      const tokensToAdd = TokenCounter.countMessageTokens([messageToAdd], model);
  
      // If adding the message would exceed the token limit, break
      if (currentTokensUsed + tokensToAdd > sendTokenLimit) {
        break;
      }
  
      // Add the message to the context
      currentContext.push(messageToAdd);
  
      // Count the number of tokens used
      currentTokensUsed += tokensToAdd;
  
      // Move to the next message
      nextMessageToAddIndex -= 1;
    }
  
    // Inform the AI about its remaining budget
    const apiManager = new ApiManager();
    if (apiManager.getTotalBudget() > 0.0) {
      const remainingBudget = apiManager.getTotalBudget() - apiManager.getTotalCost();
      if (remainingBudget < 0) {
        remainingBudget = 0;
      }
      // Create a system message to inform the AI about its remaining budget
      const systemMessage = `Your remaining API budget is ${remainingBudget}`;
  
      // If the AI's budget is zero, add a message to shut down
      if (remainingBudget === 0) {
        systemMessage += " BUDGET EXCEEDED! SHUT DOWN!\n\n";
      } else if (remainingBudget < 0.005) {
        // If the AI's budget is very nearly exceeded, add a message to shut down gracefully
        systemMessage += " Budget very nearly exceeded! Shut down gracefully!\n\n";
      } else if (remainingBudget < 0.01) {
        // If the AI's budget is nearly exceeded, add a message to finish up
        systemMessage += " Budget nearly exceeded. Finish up.\n\n";
      } else {
        // Otherwise, add an empty line
        systemMessage += "\n\n";
      }
  
      // Log the system message
      console.debug(systemMessage);
  
      // Add the system message to the context
      currentContext.push(createChatMessage("system", systemMessage));
    }
  }
  