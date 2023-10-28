# osu-professor-rating-alexa-skill
AWS Lambda function that scrapes website of SEI ratings for OSU professors and outputs the best option using an Amazon Alexa skill

running npm ci will be required to download the correct versions of libraries.

the code provided here uses the following libraries: ask-sdk-core for Alexa-related functions, and axios & cheerio for web scraping


there are steps that will need to be taken in the Alexa Developer console to make this Lambda function work:

the code, as it is in the current version, uses an Alexa skill with intent named "best_prof"
it has a sample utterance "What is the best professor for {department} {class}?", which covers requests in the current scope of the skill
department is a "Custom with values" slot type and has a handful of OSU departments as a basis for Alexa to understand the gist of what a "department" is (e.g. CSE, ECE, BIO, PHYSICS, MATH)
class is a Built-In slot type named AMAZON.FOUR_DIGIT_NUMBER, as this skill finds SEI ratings for classes that are four digit numbers, which almost all OSU classes are

to make the AWS Lambda function work with the Alexa skill, you'll need to zip the files provided here along with the "node_modules" directory created with the command npm ci and upload this zip to AWS Lambda
go into the Alexa Developer Console's "Endpoint" tab and select "AWS Lambda ARN" as the Service Endpoint Type
copy the skill ID and paste it into a new Alexa trigger in the Lambda function's Function overview section
then, the Function ARN from the Lambda Function overview will need to be copied and pasted into the "Default Region" box back in the Alexa Developer Console's "Endpoint" tab
finally, in the "Configuration" tab of the Lambda function, in the "General configuration" tab, increase the Timeout from its default setting of 3 sec or the function will mostly likely timeout

then, the skill can be tested and eventually used using the "Test" tab in the Alexa Developer Console


of course, the Lambda function can be further added to with corresponding linking to a new intent, sample utterance, and slot type as needed
anytime the Lambda function is changed, it will need to be deployed on the Lambda side and re-built on the Alexa Developer Console side
