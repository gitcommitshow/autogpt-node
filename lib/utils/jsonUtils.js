// Utilities for the json_fixes package.
const path = require("node:path");
const fs = require("node:fs");
var JSONValidator = require("jsonschema").Validator;
var Config = require('../config');

exports.LLM_DEFAULT_RESPONSE_FORMAT = "llm_response_format_1";
exports.validateJSON = validateJSON;

var config = new Config();

function extractCharPosition(errorMessage) {
  // Extract the character position from the JSONDecodeError message.
  var charPattern = "/^\((char (\d+)\)/";
  var match = charPattern.exec(errorMessage);
  if (match) {
    return parseInt(match[1]);
  } else {
    throw new Error("Character position not found in the error message.");
  }
}

function validateJSON(jsonObject, schemaName) {
  // Validate the JSON object against the schema.
  var schemeFile =  path.join(process.cwd(),schemaName + ".json");
  console.debug("Using "+(process.cwd()+schemaName + ".json")+" file for Json validation")
  var schema = JSON.parse(fs.readFileSync(schemeFile, { encoding: "utf-8" }));
  var validator = new JSONValidator();

  var validationResults = validator.validate(jsonObject, schema);
  var errors = validationResults.errors;
  if (errors && errors.length > 0) {
    console.error("The JSON object is invalid.");
    if (config.debugMode) {
      logger.error(
        JSON.stringify(jsonObject, null, 4)
      );  // Replace 'json_object' with the variable containing the JSON data
      console.error("The following issues were found:");

      for (var error of errors) {
        console.error(error.message);
      }
    }
    return null;
  } else {
    console.debug("The JSON object is valid.");
    return jsonObject;
  }
}


async function validateJSONString(jsonString, schemaName) {
  // Validate the JSON string against the schema.
  try {
    var jsonObject = await JSON.parse(jsonString);
    return validateJSON(jsonObject, schemaName);
  } catch (e) {
    return null;
  }
}


function isStringValidJson(jsonString, schemaName) {
  // Return true if the JSON string is valid, false otherwise.
  return validateJSONString(jsonString, schemaName) !== null;
}
