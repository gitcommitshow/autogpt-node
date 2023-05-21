
class AgentManager {
    constructor() {
      this.next_key = 0;
      this.agents = {}; // key, (task, full_message_history, model)
      this.cfg = new Config();
    }
  
    // Create new GPT agent
    // TODO: Centralise use of create_chat_completion() to globally enforce token limit
  
    create_agent(task, prompt, model) {
      // The messages array to be passed to the create_chat_completion function
      let messages = [{ role: "user", content: prompt }];
  
      for (let plugin of this.cfg.plugins) {
        if (!plugin.can_handle_pre_instruction()) {
          continue;
        }
        if (plugin_messages) {
          let plugin_messages = plugin.pre_instruction(messages);
          messages = messages.concat(plugin_messages);
        }
      }
  
      // Start GPT instance
      let agent_reply = create_chat_completion({
        model: model,
        messages: messages,
      });
  
      messages.push({ role: "assistant", content: agent_reply });
  
      let plugins_reply = "";
      for (let i = 0; i < this.cfg.plugins.length; i++) {
        let plugin = this.cfg.plugins[i];
        if (!plugin.can_handle_on_instruction()) {
          continue;
        }
        let plugin_result = plugin.on_instruction(messages);
        if (plugin_result) {
          let sep = i ? "\n" : "";
          plugins_reply = `${plugins_reply}${sep}${plugin_result}`;
        }
      }
  
      if (plugins_reply && plugins_reply !== "") {
        messages.push({ role: "assistant", content: plugins_reply });
      }
  
      let key = this.next_key;
      // This is done instead of Object.keys(agents).length to make keys unique even if agents
      // are deleted
      this.next_key += 1;
  
      this.agents[key] = [task, messages, model];
  
      for (let plugin of this.cfg.plugins) {
        if (!plugin.can_handle_post_instruction()) {
          continue;
        }
        agent_reply = plugin.post_instruction(agent_reply);
      }
  
      return [key, agent_reply];
    }

    message_agent(key, message) {
        const [task, messages, model] = this.agents[parseInt(key)];
        
        // Add user message to message history before sending to agent
        messages.push({ role: "user", content: message });
        
        for (const plugin of this.cfg.plugins) {
            if (!plugin.can_handle_pre_instruction()) continue;
            const pluginMessages = plugin.pre_instruction(messages);
            if (pluginMessages) {
                for (const pluginMessage of pluginMessages) {
                    messages.push(pluginMessage);
                }
            }
        }
        
        // Start GPT instance
        const agentReply = create_chat_completion({
            model: model,
            messages: messages,
        });
        
        messages.push({ role: "assistant", content: agentReply });
        
        let pluginsReply = agentReply;
        for (let i = 0; i < this.cfg.plugins.length; i++) {
            const plugin = this.cfg.plugins[i];
            if (!plugin.can_handle_on_instruction()) continue;
            const pluginResult = plugin.on_instruction(messages);
            const sep = (i === 0) ? "\n" : "";
            pluginsReply = pluginsReply + sep + pluginResult;
        }
        
        // Update full message history
        if (pluginsReply && pluginsReply !== "") {
            messages.push({ role: "assistant", content: pluginsReply });
        }
        
        let updatedAgentReply = agentReply;
        for (const plugin of this.cfg.plugins) {
            if (!plugin.can_handle_post_instruction()) continue;
            updatedAgentReply = plugin.post_instruction(agentReply);
        }
        
        return updatedAgentReply;
    }

    list_agents() {
        // Return a list of agent keys and their tasks
        return Object.entries(this.agents).map(([key, [task]]) => [key, task]);
      }
    
      delete_agent(key) {
        try {
          delete this.agents[parseInt(key)];
          return true;
        } catch (error) {
          return false;
      }
    }
    
}
  