
function call_ai_function(functionName, args, description, model = null) {
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
        "content": `You are now the following python function: \`\`\`# ${description}\n${functionName}\`\`\`\n\nOnly respond with your \`return\` value.`,
      },
      {"role": "user", "content": args},
    ];
    return create_chat_completion(messages, model, 0);
}  

async function create_chat_completion(messages, model=null, temperature=CFG.temperature, max_tokens=null) {
    const num_retries = 10;
    let warned_user = false;
    if (CFG.debug_mode) {
        console.log(`Creating chat completion with model ${model}, temperature ${temperature}, max_tokens ${max_tokens}`);
    }
    for (const plugin of CFG.plugins) {
        if (plugin.can_handle_chat_completion({
            messages: messages,
            model: model,
            temperature: temperature,
            max_tokens: max_tokens,
        })) {
            const message = await plugin.handle_chat_completion({
                messages: messages,
                model: model,
                temperature: temperature,
                max_tokens: max_tokens,
            });
            if (message !== null) {
                return message;
            }
        }
    }
    let response = null;
    for (let attempt = 0; attempt < num_retries; attempt++) {
        const backoff = 2 ** (attempt + 2);
        try {
            if (CFG.use_azure) {
                response = await openai.ChatCompletion.create({
                    deployment_id: CFG.get_azure_deployment_id_for_model(model),
                    model: model,
                    messages: messages,
                    temperature: temperature,
                    max_tokens: max_tokens,
                });
            } else {
                response = await openai.ChatCompletion.create({
                    model: model,
                    messages: messages,
                    temperature: temperature,
                    max_tokens: max_tokens,
                });
            }
            break;
        } catch (error) {
            if (error instanceof openai.errors.RateLimitError) {
                if (CFG.debug_mode) {
                    console.log(`Error: Reached rate limit, passing...`);
                }
                if (!warned_user) {
                    logger.double_check(`Please double check that you have setup a PAID OpenAI API Account. You can read more here: https://github.com/Significant-Gravitas/Auto-GPT#openai-api-keys-configuration`);
                    warned_user = true;
                }
            } else if (error instanceof openai.errors.APIError) {
                if (error.httpStatus !== 502) {
                    throw error;
                }
                if (attempt === num_retries - 1) {
                    throw error;
                }
            }
            if (CFG.debug_mode) {
                console.log(`Error: API Bad gateway. Waiting ${backoff} seconds...`);
            }
            await new Promise(resolve => setTimeout(resolve, backoff * 1000));
        }
    }
    if (response === null) {
        logger.typewriter_log(`FAILED TO GET RESPONSE FROM OPENAI`, Fore.RED, `Auto-GPT has failed to get a response from OpenAI's services. Try running Auto-GPT again, and if the problem the persists try running it with \`--debug\`.`);
        logger.double_check();
        if (CFG.debug_mode) {
            throw new Error(`Failed to get response after ${num_retries} retries`);
        } else {
            process.exit(1);
        }
    }
    let resp = response.choices[0].text;
    for (const plugin of CFG.plugins) {
        if (!plugin.can_handle_on_response()) {
            continue;
        }
        resp = await plugin.on_response(resp);
    }
    return resp;
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
