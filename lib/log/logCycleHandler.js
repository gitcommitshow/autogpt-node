import { join } from 'path';

/**
 * A class for logging cycle data.
 */
class LogCycleHandler {

  static DEFAULT_PREFIX = 'agent';
  static FULL_MESSAGE_HISTORY_FILE_NAME = 'full_message_history.json';
  static CURRENT_CONTEXT_FILE_NAME = 'current_context.json';
  static NEXT_ACTION_FILE_NAME = 'next_action.json';
  static PROMPT_SUMMARY_FILE_NAME = 'prompt_summary.json';
  static SUMMARY_FILE_NAME = 'summary.txt';
  static SUPERVISOR_FEEDBACK_FILE_NAME = 'supervisor_feedback.txt';
  static PROMPT_SUPERVISOR_FEEDBACK_FILE_NAME = 'prompt_supervisor_feedback.json';
  static USER_INPUT_FILE_NAME = 'user_input.txt';

    /**
     * The number of logs within the current cycle.
     * @type {number}
     */
    logCountWithinCycle = 0;
  
    /**
     * Creates a directory if it does not already exist.
     * @param {string} directoryPath The path to the directory to create.
     * @throws {Error} If the directory already exists.
     */
    static createDirectoryIfNotExists(directoryPath) {
      if (fs.existsSync(directoryPath)) {
        throw new Error(`Directory ${directoryPath} already exists.`);
      }
  
      fs.mkdirSync(directoryPath, { recursive: true });
    }
  
    /**
     * Creates the outer directory for a cycle.
     * @param {string} aiName The name of the AI.
     * @param {string} createdAt The date and time the cycle was created.
     * @return {string} The path to the outer directory.
     */
    createOuterDirectory(aiName, createdAt) {
      //TODO add logger
      const logDirectory = logger.getLogDirectory();
  
      const outerFolderName = process.env.OVERWRITE_DEBUG === '1' ? 'auto_gpt' : `${createdAt}_${aiName.slice(0, 15)}`;
      const outerFolderPath = join(logDirectory, 'DEBUG', outerFolderName);
  
      this.createDirectoryIfNotExists(outerFolderPath);
  
      return outerFolderPath;
    }
  
    /**
     * Creates the inner directory for a cycle.
     * @param {string} outerFolderPath The path to the outer directory.
     * @param {number} cycleCount The number of the cycle.
     * @return {string} The path to the inner directory.
     */
    createInnerDirectory(outerFolderPath, cycleCount) {
      const nestedFolderName = String(cycleCount).padStart(3, '0');
      const nestedFolderPath = join(outerFolderPath, nestedFolderName);
  
      this.createDirectoryIfNotExists(nestedFolderPath);
  
      return nestedFolderPath;
    }
  
    /**
     * Creates the nested directory for a cycle.
     * @param {string} aiName The name of the AI.
     * @param {string} createdAt The date and time the cycle was created.
     * @param {number} cycleCount The number of the cycle.
     * @return {string} The path to the nested directory.
     */
    createNestedDirectory(
      aiName, createdAt, cycleCount
    ) {
      const outerFolderPath = this.createOuterDirectory(aiName, createdAt);
      const nestedFolderPath = this.createInnerDirectory(outerFolderPath, cycleCount);
  
      return nestedFolderPath;
    }
  
    /**
     * Logs cycle data to a JSON file.
     * @param {string} aiName The name of the AI.
     * @param {string} createdAt The date and time the cycle was created.
     * @param {number} cycleCount The number of the cycle.
     * @param {any} data The data to be logged.
     * @param {string} fileName The name of the file to save the logged data.
     */
    logCycle(
      aiName,
      createdAt,
      cycleCount,
      data,
      fileName,
    ) {
      const nestedFolderPath = this.createNestedDirectory(
        aiName, createdAt, cycleCount
      );
  
      const jsonData = JSON.stringify(data, null, 4);
      const logFilePath = join(
        nestedFolderPath, `${this.logCountWithinCycle}_${fileName}`
      );
        
      //TODO add logger
      logger.logJson(jsonData, logFilePath);
      this.logCountWithinCycle += 1;
    }
}

module.exports = LogCycleHandler;