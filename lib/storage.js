// storage.js

const fs = require('fs');

function writeToFile(data, fileName) {
  fs.writeFileSync(fileName, JSON.stringify(data));
}

function readFromFile(fileName) {
  const data = fs.readFileSync(fileName);
  return JSON.parse(data);
}

module.exports = {
  writeToFile,
  readFromFile
};
