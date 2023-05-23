exports.executeCommand = executeCommand;

function executeCommand(
    commandRegistry,
    commandName,
    arguments,
    prompt,
  ) {
    try {
        const cmd = commandRegistry.commands.commandName;

        // If the command is found, call it with the provided arguments
        if (cmd) {
            return cmd(...arguments);
        }

        // TODO: Remove commands below after they are moved to the command registry.
        commandName = mapCommandSynonyms(commandName.toLowerCase());
      
        //TODO Add memory support
        //   if (commandName === "memory_add") {
        //     return getMemory(CFG).add(arguments.string);
        //   } else { 
  
        // TODO: Change these to take in a file rather than pasted code, if
        // non-file is given, return instructions "Input should be a python
        // filepath, write your code to file and try again
        for (const command of prompt.commands) {
            if (
            command.label.toLowerCase() === commandName ||
            command.name.toLowerCase() === commandName
            ) {
            return command.function(...arguments);
            }
        }
        return ("Unknown command '{commandName}'. Please refer to the 'COMMANDS' list for available commands and only respond in the specified JSON format.");
    } catch (e) {
      return `Error: ${e.message}`;
    }
}
  
function mapCommandSynonyms(commandName) {
    const synonyms = [
        ["write_file", "write_to_file"],
        ["create_file", "write_to_file"],
        ["search", "google"],
    ];
    for (const [seenCommand, actualCommandName] of synonyms) {
        if (commandName === seenCommand) {
            return actualCommandName;
        }
    }
    return commandName;
}
  