const aslValidator = require('asl-validator');

module.exports = validate;

/**
 * CloudFormation allows us to provide the ARN of the Lambda using Fn::Sub with
 * template parameters and a variable map: https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-sub.html
 * But the ASL Validator requires a literal ARN for each Resource property.
 * So we fake it, allowing us to validate the remainder of the ASL.
 */
function replaceVariablesWithFakeArns(obj) {
  const str = JSON.stringify(obj).replace(
    /"\${[^${}\s]+}"/g,
    '"arn:aws:lambda:us-east-1:123456789012:function:FUNCTION_NAME"'
  );
  return JSON.parse(str);
}

function stringifyValidationErrors(validationErrors) {
  return validationErrors
    .map(error => JSON.stringify(error, null, 2))
    .join('\n');
}

function validate(definition) {
  const validation = aslValidator(replaceVariablesWithFakeArns(definition));
  if (!validation.isValid) {
    const error = new Error(
      `ASL Not Valid\n${stringifyValidationErrors(validation.errors)}`
    );
    throw error;
  }
}
