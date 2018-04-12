# cloudformation-step-function-buddy
[![Build Status](https://travis-ci.org/mapbox/cloudformation-step-function-buddy.svg?branch=master)](https://travis-ci.org/mapbox/cloudformation-step-function-buddy)

Write your Step Function definition in JavaScript (instead of JSON) and validate it

## Usage

You'll need to be using tool that generates CloudFormation templates from JavaScript. At Mapbox, we use [cloudfriend](https://github.com/mapbox/cloudfriend), but any JavaScript-based tool will do.

```js
const cf = require('@mapbox/cloudfriend');
const {
  stringifyDefinition
} = require('@mapbox/cloudformation-step-function-buddy');

module.exports = {
  AWSTemplateFormatVersion: '2010-09-09',
  Description:
    'An example template with an IAM role for a Lambda state machine.',
  Resources: {
    LambdaExecutionRole: {
      Type: 'AWS::IAM::Role',
      Properties: {
        AssumeRolePolicyDocument: {
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: {
                Service: 'lambda.amazonaws.com'
              },
              Action: 'sts:AssumeRole'
            }
          ]
        }
      }
    },
    MyLambdaFunction: {
      Type: 'AWS::Lambda::Function',
      Properties: {
        Handler: 'index.handler',
        Role: cf.getAtt('LambdaExecutionRole', 'Arn'),
        Code: {
          ZipFile:
            'exports.handler = (event, context, callback) => { callback(null, "Hello World!");};'
        },
        Runtime: 'nodejs4.3',
        Timeout: '25'
      }
    },
    StatesExecutionRole: {
      Type: 'AWS::IAM::Role',
      Properties: {
        AssumeRolePolicyDocument: {
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: {
                Service: cf.sub('states.${AWS::Region}.amazonaws.com')
              },
              Action: 'sts:AssumeRole'
            }
          ]
        },
        Path: '/',
        Policies: [
          {
            PolicyName: 'StatesExecutionPolicy',
            PolicyDocument: {
              Version: '2012-10-17',
              Statement: [
                {
                  Effect: 'Allow',
                  Action: ['lambda:InvokeFunction'],
                  Resource: '*'
                }
              ]
            }
          }
        ]
      }
    },
    MyStateMachine: {
      Type: 'AWS::StepFunctions::StateMachine',
      Properties: {
        DefinitionString: cf.sub(
          stringifyDefinition({
            Comment: 'A Hello World AWL example using an AWS Lambda function',
            StartAt: 'HelloWorld',
            States: {
              HelloWorld: {
                Type: 'Task',
                Resource: '${lambdaArn}',
                End: true
              }
            }
          }),
          {
            lambdaArn: cf.getAtt('MyLambdaFunction', 'Arn')
          }
        ),
        RoleArn: cf.getAtt('StatesExecutionRole', 'Arn')
      }
    }
  }
};
```

