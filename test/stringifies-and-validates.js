const tap = require('tap');
const { resolve } = require('path');
const { build } = require('@mapbox/cloudfriend');

const stringifiedDefinition =
  '{"Comment":"A Hello World AWL example using an AWS Lambda function","StartAt":"HelloWorld","States":{"HelloWorld":{"Type":"Task","Resource":"${lambdaArn}","End":true}}}';

tap.test('will stringify a valid definition', function(t) {
  const cft = resolve(__dirname, 'fixtures', 'valid.js');
  return build(cft).then(template => {
    t.strictSame(
      template.Resources.MyStateMachine.Properties.DefinitionString[
        'Fn::Sub'
      ][0],
      stringifiedDefinition
    );
    t.end();
  });
});

tap.test('will throw if the definition is invalid', function(t) {
  const cft = resolve(__dirname, 'fixtures', 'invalid.js');
  const expectedError = new Error(`ASL Not Valid
{
  "keyword": "required",
  "dataPath": "",
  "schemaPath": "#/required",
  "params": {
    "missingProperty": "StartAt"
  },
  "message": "should have required property 'StartAt'"
}
{
  "Error code": "MISSING_TRANSITION_TARGET",
  "Message": "State HelloWorld is not reachable"
}`);

  t.throws(() => require(cft), expectedError);
  t.end();
});
