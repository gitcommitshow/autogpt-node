const tiktoken = require("tiktoken-node");

/**
 * Returns the number of tokens used by a list of messages.
 *
 * @param {Object[]} messages - An array of messages, each of which is an object
 *                          containing the role and content of the message.
 * @param {string} model - The name of the model to use for tokenization.
 *                          Defaults to "gpt-3.5-turbo-0301".
 * @returns {number} The number of tokens used by the list of messages.
 */
function countMessageTokens(messages, model = "gpt-3.5-turbo-0301") {
  try {
    var encoding = tiktoken.encodingForModel(model);
  } catch (err) {
    console.warn("Warning: model not found. Using cl100k_base encoding.");
    encoding = tiktoken.getEncoding("cl100k_base");
  }

  if (model === "gpt-3.5-turbo") {
    // !Note: gpt-3.5-turbo may change over time.
    // Returning num tokens assuming gpt--3.5-turbo-0301.")
    return countMessageTokens(messages, "gpt-3.5-turbo-0301");
} else if (model === "gpt-4") {
  // !Note: gpt-4 may change over time. Returning num tokens assuming gpt-4-0314.")
  return countMessageTokens(messages, "gpt-4-0314");
} else if (model === "gpt-3.5-turbo-0301") {
  var tokensPerMessage = 4; // every message follows <|start|>{role/name}\n{content}<|end|>\n
  var tokensPerName = -1; // if there's a name, the role is omitted
} else if (model === "gpt-4-0314") {
  var tokensPerMessage = 3;
  var tokensPerName = 1;
} else {
  throw new Error(
    `numTokensFromMessages() is not implemented for model ${model}. See https://github.com/openai/openai-python/blob/main/chatml.md for information on how messages are converted to tokens.`
  );
}

var numTokens = 0;
for (var i = 0; i < messages.length; i++) {
  numTokens += tokensPerMessage;
  var message = messages[i];
  for (var key in message) {
    var value = message[key];
    numTokens += encoding.encode(value).length;
    if (key === "name") {
      numTokens += tokensPerName;
    }
  }
}
numTokens += 3; // every reply is primed with <|start|>assistant<|message|>
return numTokens;
}

/**
* Returns the number of tokens in a text string.
*
* @param {string} string - The text string.
* @param {string} model_name - The name of the encoding to use. (e.g., "gpt-3.5-turbo")
* @returns {number} The number of tokens in the text string.
*/
function countStringTokens(string, model_name) {
var encoding = tiktoken.encodingForModel(model_name);
return encoding.encode(string).length;
}

module.exports = { countMessageTokens, countStringTokens };