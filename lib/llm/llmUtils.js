const ApiManager = require('./apiManager');

exports.createChatCompletion = createChatCompletion;

function callAIFunction(functionName, args, description, model = null) {
    if (model === null) {
      model = CFG.smart_llm_model;
    }
    // For each arg, if any are null, convert to "None":
    args = args.map((arg) => arg !== null ? arg : "None");
    // parse args to comma separated string
    args = args.join(", ");
    const messages = [
      {
        "role": "system",
        "content": `You are now the following node.js function: \`\`\`# ${description}\n${functionName}\`\`\`\n\nOnly respond with your \`return\` value.`,
      },
      {"role": "user", "content": args},
    ];
    return createChatCompletion(messages, model, 0);
}  

function createChatCompletion(messages, model, temperature, maxTokens) {
    // Check if temperature is None.
    if (temperature === undefined) {
      temperature = cfg.temperature;
    }
  
    //TODO: Iterate over the plugins list if any of them can handle this chat completion
  
    // Create an ApiManager object.
    const apiManager = new ApiManager();
  
    // Iterate over the num_retries argument.
    num_retries = 10;
    for (let attempt = 0; attempt < num_retries; attempt++) {
      // Try to create a chat completion using the ApiManager object.
      try {
        const response = apiManager.createChatCompletion({
          deploymentId: cfg.getAzureDeploymentIdForModel(model),
          model: model,
          messages: messages,
          temperature: temperature,
          maxTokens: maxTokens,
        });
        // If the chat completion is created successfully, break out of the loop.
        if (response) {
          break;
        }
      } catch (error) {
        if (e.httpStatus !== 502 || attempt === num_retries - 1) {
            // throw new Exception("needs cooldown");
            console.log("API Bad gateway. Waiting {backoff} seconds...")
            await sleep(30);
        }
        console.error("Reached rate limit, passing...");
        if (!warnedUser) {
          console.log("Please double check that you have setup a PAID OpenAI API Account. "+ "You can read more here: {Fore.CYAN}https://docs.agpt.co/setup/#getting-an-api-key");
          warnedUser = true;
        }
      }
    }
  
    // If the chat completion cannot be created after num_retries attempts, raise an error.
    if (!response) {
        console.error("FAILED TO GET RESPONSE FROM OPENAI");
        console.log("Auto-GPT has failed to get a response from OpenAI's services. ");
        console.log("Try running Auto-GPT again, and if the problem the persists try running it with--debug.");
      if (cfg.debugMode) {
        throw new RuntimeError("Failed to get response after {num_retries} retries");
      } else {
        process.exit(1);
      }
    }
  
    // Get the response from the chat completion.
    const response = response.choices[0].message["content"];
  
    //TODO: Iterate over the plugins list and check if any of them can handle this response
  
    // Return the response.
    return response;
  }
  

async function create_embedding_with_ada(text) {
    let num_retries = 10;
    for (let attempt = 0; attempt < num_retries; attempt++) {
        let backoff = 2 ** (attempt + 2);
        try {
            if (CFG.use_azure) {
                const response = await openai.Embedding.create({
                    input: [text],
                    engine: CFG.get_azure_deployment_id_for_model(
                        "text-embedding-ada-002"
                    )
                });
                return response.data[0].embedding;
            } else {
                const response = await openai.Embedding.create({
                    input: [text],
                    model: "text-embedding-ada-002"
                });
                return response.data[0].embedding;
            }
        } catch (err) {
            if (err.httpStatusCode === 429) { // RateLimitError
                continue;
            }
            if (err.httpStatusCode !== 502) { // APIError
                throw err;
            }
            if (attempt === num_retries - 1) {
                throw err;
            }
        }
        if (CFG.debug_mode) {
            console.log(
                `%c Error: API Bad gateway. Waiting ${backoff} seconds... %c`,
                "color: red;",
                ""
            );
        }
        await new Promise(resolve => setTimeout(resolve, backoff * 1000));
    }
}
