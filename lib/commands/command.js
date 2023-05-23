/**
 * A class representing a command.
 *
 * @class Command
 * @param {string} name The name of the command.
 * @param {string} description A brief description of what the command does.
 * @param {Function} method The function that the command executes.
 * @param {string} [signature] The signature of the function that the command executes. Defaults to None.
 * @param {boolean} [enabled=true] Whether the command is enabled.
 * @param {string|undefined} [disabledReason] The reason why the command is disabled.
 */
class Command {
    /**
     * Constructs a new Command instance.
     *
     * @param {string} name The name of the command.
     * @param {string} description A brief description of what the command does.
     * @param {Function} method The function that the command executes.
     * @param {string} [signature] The signature of the function that the command executes. Defaults to None.
     * @param {boolean} [enabled=true] Whether the command is enabled.
     * @param {string|undefined} [disabledReason] The reason why the command is disabled.
     */
    constructor(
      name,
      description,
      method,
      signature,
      enabled = true,
      disabledReason,
    ) {
      this.name = name;
      this.description = description;
      this.method = method;
      this.signature = signature || inspect.signature(method).toString();
      this.enabled = enabled;
      this.disabledReason = disabledReason;
    }
  
    /**
     * Executes the command.
     *
     * @param {any[]} args The arguments to pass to the command.
     * @returns {any} The result of executing the command.
     */
    call(...args) {
      if (!this.enabled) {
        return `Command '${this.name}' is disabled: ${this.disabledReason}`;
      }
      return this.method(...args);
    }
  
    /**
     * Gets a string representation of the command.
     *
     * @returns {string} A string representation of the command.
     */
    toString() {
      return `${this.name}: ${this.description}, args: ${this.signature}`;
    }
  }
  
  module.exports = Command;