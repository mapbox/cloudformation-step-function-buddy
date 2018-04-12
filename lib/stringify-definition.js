const validate = require('./validate');

module.exports = stringifyDefinition;

function stringifyDefinition(definition) {
  validate(definition);
  return JSON.stringify(definition);
}
