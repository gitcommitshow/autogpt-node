class PromptGenerator {
    constructor() {
      this.constraints = [];
      this.commands = [];
      this.resources = [];
      this.performanceEvaluation = [];
      this.goals = [];
      this.commandRegistry = null;
      this.name = "Bob";
      this.role = "AI";
      this.response_format = {
        thoughts: {
          text: "thought",
          reasoning: "reasoning",
          plan: "- short bulleted\n- list that conveys\n- long-term plan",
          criticism: "constructive self-criticism",
          speak: "thoughts summary to say to user",
        },
        command: { name: "command name", args: { "arg name": "value" } },
      };
    }
  
    addConstraint(constraint) {
      this.constraints.push(constraint);
    }
  
    addCommand(command_label, command_name, args = {}, func = null) {
      const command_args = {};
      for (const [key, value] of Object.entries(args)) {
        command_args[key] = value;
      }
      const command = {
        label: command_label,
        name: command_name,
        args: command_args,
        function: func,
      };
      this.commands.push(command);
    }
  
    generatCommandString(command) {
      const args_string = Object.entries(command.args)
        .map(([key, value]) => `"${key}": "${value}"`)
        .join(", ");
      return `${command.label}: "${command.name}", args: {${args_string}}`;
    }
  
    addResource(resource) {
      this.resources.push(resource);
    }
  
    addPerformanceEvaluation(evaluation) {
      this.performanceEvaluation.push(evaluation);
    }
  
    generateNumberedList(items, item_type = "list") {
      if (item_type === "command") {
        let command_strings = [];
        if (this.commandRegistry) {
          command_strings = Object.values(this.commandRegistry.commands)
            .filter((item) => item.enabled)
            .map((item) => this.generatCommandString(item));
        }
        command_strings.push(
          ...items.map((item) => this.generatCommandString(item))
        );
        return command_strings
          .map((item, i) => `${i + 1}. ${item}`)
          .join("\n");
      } else {
        return items.map((item, i) => `${i + 1}. ${item}`).join("\n");
      }
    }
  
    generatePromptString() {
      const formatted_response_format = JSON.stringify(
        this.response_format,
        null,
        4
      );
      return (
        `Constraints:\n${this.genera(
          this.constraints
        )}\n\nCommands:\n${this.generateNumberedList(
          this.commands,
          "command"
        )}\n\nResources:\n${this.generateNumberedList(
          this.resources
        )}\n\nPerformance Evaluation:\n${this.generateNumberedList(
          this.performanceEvaluation
        )}\n\nYou should only respond in JSON format as described below \nResponse Format: \n${formatted_response_format} \nEnsure the response can be parsed by JSON.parse`
      );
    }
}
  
module.exports = PromptGenerator;