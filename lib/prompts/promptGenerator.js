class PromptGenerator {
    constructor() {
      this.constraints = [];
      this.commands = [];
      this.resources = [];
      this.performance_evaluation = [];
      this.goals = [];
      this.command_registry = null;
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
  
    add_constraint(constraint) {
      this.constraints.push(constraint);
    }
  
    add_command(command_label, command_name, args = {}, func = null) {
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
  
    _generate_command_string(command) {
      const args_string = Object.entries(command.args)
        .map(([key, value]) => `"${key}": "${value}"`)
        .join(", ");
      return `${command.label}: "${command.name}", args: {${args_string}}`;
    }
  
    add_resource(resource) {
      this.resources.push(resource);
    }
  
    add_performance_evaluation(evaluation) {
      this.performance_evaluation.push(evaluation);
    }
  
    _generate_numbered_list(items, item_type = "list") {
      if (item_type === "command") {
        let command_strings = [];
        if (this.command_registry) {
          command_strings = Object.values(this.command_registry.commands)
            .filter((item) => item.enabled)
            .map((item) => this._generate_command_string(item));
        }
        command_strings.push(
          ...items.map((item) => this._generate_command_string(item))
        );
        return command_strings
          .map((item, i) => `${i + 1}. ${item}`)
          .join("\n");
      } else {
        return items.map((item, i) => `${i + 1}. ${item}`).join("\n");
      }
    }
  
    generate_prompt_string() {
      const formatted_response_format = JSON.stringify(
        this.response_format,
        null,
        4
      );
      return (
        `Constraints:\n${this._generate_numbered_list(
          this.constraints
        )}\n\nCommands:\n${this._generate_numbered_list(
          this.commands,
          "command"
        )}\n\nResources:\n${this._generate_numbered_list(
          this.resources
        )}\n\nPerformance Evaluation:\n${this._generate_numbered_list(
          this.performance_evaluation
        )}\n\nYou should only respond in JSON format as described below \nResponse Format: \n${formatted_response_format} \nEnsure the response can be parsed by Python json.loads`
      );
    }
}
  