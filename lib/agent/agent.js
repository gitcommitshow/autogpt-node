class Agent {
    /**
     * Agent class for interacting with Auto-GPT.
     * 
     * @param {string} ai_name - The name of the agent.
     * @param {*} memory - The memory object to use.
     * @param {[]} full_message_history - The full message history.
     * @param {number} next_action_count - The number of actions to execute.
     * @param {*} command_registry - The command registry.
     * @param {*} config - The agent's configuration.
     * @param {string} system_prompt - The system prompt is the initial prompt that defines everything
     *    the AI needs to know to achieve its task successfully.
     *    Currently, the dynamic and customizable information in the system prompt are
     *    ai_name, description and goals.
     * @param {string} triggering_prompt - The last sentence the AI will see before answering.
     *    For Auto-GPT, this prompt is:
     *    Determine which next command to use, and respond using the format specified above:
     *    The triggering prompt is not part of the system prompt because between the system prompt and the triggering
     *    prompt we have contextual information that can distract the AI and make it forget that its goal is to find
     *    the next task to achieve.
     *    SYSTEM PROMPT
     *    CONTEXTUAL INFORMATION (memory, previous conversations, anything relevant)
     *    TRIGGERING PROMPT
     *    The triggering prompt reminds the AI about its short term meta task (defining the next task)
     */
    constructor(
        ai_name,
        memory,
        full_message_history,
        next_action_count,
        command_registry,
        config,
        system_prompt,
        triggering_prompt,
    ) {
        this.ai_name = ai_name;
        this.memory = memory;
        this.full_message_history = full_message_history;
        this.next_action_count = next_action_count;
        this.command_registry = command_registry;
        this.config = config;
        this.system_prompt = system_prompt;
        this.triggering_prompt = triggering_prompt;
    }

    startInteractionLoop() {
        // Interaction Loop
        const cfg = new Config();
        let loop_count = 0;
        let command_name = null;
        let arguments = null;
        let user_input = "";

        while (true) {
            // Discontinue if continuous limit is reached
            loop_count += 1;
            if (
                cfg.continuous_mode &&
                cfg.continuous_limit > 0 &&
                loop_count > cfg.continuous_limit
            ) {
                logger.typewriter_log(
                    "Continuous Limit Reached: ",
                    Fore.YELLOW,
                    `${cfg.continuous_limit}`
                );
                break;
            }

            // Send message to AI, get response
            withSpinner("Thinking... ", () => {
                assistant_reply = chat_with_ai(
                    this,
                    this.system_prompt,
                    this.triggering_prompt,
                    this.full_message_history,
                    this.memory,
                    cfg.fast_token_limit
                ); // TODO: This hardcodes the model to use GPT3.5. Make this an argument
            });

            const assistant_reply_json = fixJsonUsingMultipleTechniques(
                assistant_reply
            );
            for (const plugin of cfg.plugins) {
                if (!plugin.canHandlePostPlanning()) {
                    continue;
                }
                assistant_reply_json = plugin.postPlanning(this, assistant_reply_json);
            }

            // Print Assistant thoughts
            if (assistant_reply_json !== {}) {
                validateJson(assistant_reply_json, "llm_response_format_1");
                // Get command name and arguments
                try {
                    printAssistantThoughts(this.ai_name, assistant_reply_json);
                    [command_name, arguments] = getCommand(assistant_reply_json);
                    if (cfg.speak_mode) {
                        sayText(`I want to execute ${command_name}`);
                    }
                } catch (e) {
                    logger.error("Error: \n", str(e));
                }
            }

            if (!cfg.continuous_mode && this.next_action_count == 0) {
                // ### GET USER AUTHORIZATION TO EXECUTE COMMAND ###
                // Get key press: Prompt the user to press enter to continue or escape
                // to exit
                logger.typewriter_log(
                    "NEXT ACTION: ",
                    Fore.CYAN,
                    `COMMAND = ${Fore.CYAN}${command_name}${Style.RESET_ALL}  ` +
                    `ARGUMENTS = ${Fore.CYAN}${arguments}${Style.RESET_ALL}`
                );
                console.log(
                    "Enter 'y' to authorise command, 'y -N' to run N continuous " +
                    "commands, 'n' to exit program, or enter feedback for " +
                    `${this.ai_name}...`
                );
                while (true) {
                    const console_input = cleanInput(
                        Fore.MAGENTA + "Input:" + Style.RESET_ALL
                    );
                    if (console_input.toLowerCase().trim() === "y") {
                        user_input = "GENERATE NEXT COMMAND JSON";
                        break;
                    } else if (console_input.toLowerCase().trim() === "") {
                        console.log("Invalid input format.");
                        continue;
                    } else if (console_input.toLowerCase().startsWith("y -")) {
                        try {
                            this.next_action_count = Math.abs(
                                parseInt(console_input.split(" ")[1])
                            );
                            user_input = "GENERATE NEXT COMMAND JSON";
                        } catch (error) {
                            console.log(
                                "Invalid input format. Please enter 'y -n' where n is" +
                                " the number of continuous tasks."
                            );
                            continue;
                        }
                        break;
                    } else if (console_input.toLowerCase() === "n") {
                        user_input = "EXIT";
                        break
                    } else {
                        user_input = console_input
                        command_name = "human_feedback"
                        break;
                    }
                    if (user_input == "GENERATE NEXT COMMAND JSON") {
                        logger.typewriter_log(
                            "-=-=-=-=-=-=-= COMMAND AUTHORISED BY USER -=-=-=-=-=-=-=",
                            Fore.MAGENTA,
                            "",
                        )
                    } else if (user_input == "EXIT") {
                        print("Exiting...", flush = True)
                        break
                    } else {
                        // Print command
                        logger.typewriter_log(
                            "NEXT ACTION: ",
                            "\x1b[36m",
                            "COMMAND = \x1b[36m" + command_name + "\x1b[0m" + " ARGUMENTS = \x1b[36m" + arguments + "\x1b[0m"
                        );
                    }
                    // Execute command
                    if (command_name !== null && command_name.toLowerCase().startsWith("error")) {
                        result = `Command ${command_name} threw the following error: ${arguments}`;
                    } else if (command_name === "human_feedback") {
                        result = `Human feedback: ${user_input}`;
                    } else {
                        for (let i = 0; i < cfg.plugins.length; i++) {
                            const plugin = cfg.plugins[i];
                            if (!plugin.can_handle_pre_command()) {
                                continue;
                            }
                            [command_name, arguments] = plugin.pre_command(command_name, arguments);
                        }
                        const command_result = execute_command(
                            this.command_registry,
                            command_name,
                            arguments,
                            this.config.prompt_generator
                        );
                        result = `Command ${command_name} returned: ${command_result}`;

                        for (let i = 0; i < cfg.plugins.length; i++) {
                            const plugin = cfg.plugins[i];
                            if (!plugin.can_handle_post_command()) {
                                continue;
                            }
                            result = plugin.post_command(command_name, result);
                        }
                        if (this.next_action_count > 0) {
                            this.next_action_count -= 1;
                        }
                    }
                    if (command_name !== "do_nothing") {
                        const memory_to_add = `Assistant Reply: ${assistant_reply} \nResult: ${result} \nHuman Feedback: ${user_input}`;
                        this.memory.add(memory_to_add);

                        // Check if there's a result from the command append it to the message
                        // history
                        if (result !== null) {
                            this.full_message_history.push(create_chat_message("system", result));
                            logger.typewriter_log("SYSTEM: ", Fore.YELLOW, result);
                        } else {
                            this.full_message_history.push(
                                create_chat_message("system", "Unable to execute command")
                            );
                            logger.typewriter_log("SYSTEM: ", Fore.YELLOW, "Unable to execute command");
                        }
                    }
                }

            }
        }
    }
}