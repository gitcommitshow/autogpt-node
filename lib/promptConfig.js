const fs = require('node:fs');
const Config = require('./config');
var config = new Config();

class PromptConfig {
    constructor(config_file = config.prompt_settings_file) {
        let config_params = {};
        try {
            let fileContent = fs.readFileSync(config_file, { encoding: "utf-8" })
            config_params = JSON.parse(fileContent);
        } catch(err){
            throw new Error(err);
        }
        this.constraints = config_params["constraints"] || [];
        this.resources = config_params["resources"] || [];
        this.performance_evaluations = config_params["performance_evaluations"] || [];
    }
  }

  module.exports = PromptConfig;
  