// commands.js

const { execSync } = require('child_process');

function executeCommand(command) {
  try {
    const output = execSync(command).toString();
    return output.trim();
  } catch (error) {
    console.error(`Error executing command: ${command}`);
    console.error(error);
    process.exit(1);
  }
}

module.exports = {
  executeCommand
};
