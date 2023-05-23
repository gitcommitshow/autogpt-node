const AUTO_GPT_COMMAND_IDENTIFIER = "auto_gpt_command"

/**
 * The CommandRegistry class is a manager for a collection of Command objects.
 * It allows the registration, modification, and retrieval of Command objects,
 * as well as the scanning and loading of command plugins from a specified
 * directory.
 */
class CommandRegistry {
    /**
     * Constructs a new CommandRegistry instance.
     */
    constructor() {
      this.commands = {};
    }
  
    /**
     * Imports a module by name.
     *
     * @param {string} module_name The name of the module to import.
     * @returns {any} The imported module.
     */
    _import_module(module_name) {
      return require(module_name);
    }
  
    /**
     * Reloads a module.
     *
     * @param {any} module The module to reload.
     * @returns {any} The reloaded module.
     */
    _reload_module(module) {
      return require.cache[module.id] = require(module.id);
    }
  
    /**
     * Registers a command.
     *
     * @param {Command} cmd The command to register.
     */
    register(cmd) {
      if (cmd.name in this.commands) {
        console.warn("Command '{cmd.name}' already registered and will be overwritten!");
      }
      this.commands[cmd.name] = cmd;
    }
  
    /**
     * Unregisters a command.
     *
     * @param {string} command_name The name of the command to unregister.
     */
    unregister(command_name) {
      if (command_name in this.commands) {
        delete this.commands[command_name];
      } else {
        throw new Error(`Command '${command_name}' not found in registry.`);
      }
    }
  
    /**
     * Reloads all loaded command plugins.
     */
    reload_commands() {
      // Iterate over all commands
      for (const cmd_name of Object.keys(this.commands)) {
        // Get the command
        const cmd = this.commands[cmd_name];
        // Import the module that contains the command
        const module = this._import_module(cmd.__module__);
        // Reload the module
        const reloaded_module = this._reload_module(module);
        // If the module has a `register` method, call it
        if (reloaded_module.register) {
          reloaded_module.register(this);
        }
      }
    }
  
    /**
     * Gets a command by name.
     *
     * @param {string} name The name of the command to get.
     * @returns {Callable[..., Any]} The command.
     */
    get_command(name) {
      return this.commands[name];
    }
  
    /**
     * Calls a command.
     *
     * @param {string} command_name The name of the command to call.
     * @param {any} [kwargs] The keyword arguments to pass to the command.
     * @returns {any} The result of calling the command.
     */
    call(command_name, kwargs) {
      if (!this.commands.includes(command_name)) {
        throw new Error(`Command '${command_name}' not found in registry.`);
      }
      const command = this.commands[command_name];
      return command(...kwargs);
    }

    importCommands(module_name) {
      const module = require(module_name);
    
      for (const attr_name of Object.keys(module)) {
        const attr = module[attr_name];
    
        // Register decorated functions
        if (attr.hasOwnProperty(AUTO_GPT_COMMAND_IDENTIFIER) && attr[AUTO_GPT_COMMAND_IDENTIFIER]) {
          this.register(attr.command);
        }
    
        // Register command classes
        if (inspect.isClass(attr) && issubclass(attr, Command) && attr !== Command) {
          const cmd_instance = new attr();
          this.register(cmd_instance);
        }
      }
    }
    
}



module.exports = CommandRegistry;