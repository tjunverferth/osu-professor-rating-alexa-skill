const Alexa = require('ask-sdk-core');
const axios = require('axios');
const cheerio = require('cheerio')

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speakOutput = 'Welcome to the best professor finder for OSU. Which department and class number are you interested in?';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .withShouldEndSession(false)
            .getResponse();
    }
};

async function determineBestProf(department, classNumber) {
    const url = `https://osuprofs.com/courses/${department}/${classNumber}`;  // Corrected URL

    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        const profName = $('h5.card-title a').first().text();

        if (profName.length > 1) {
            return profName;
        } else {
            return 'Professor information not found for the given department and class number.';
        }
    } catch (error) {
        console.error(error);
        return 'An error occurred while fetching the data.';
    }
}

const FindProfessorIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'best_prof';
    },
    async handle(handlerInput) {
        const departmentValue = Alexa.getSlotValue(handlerInput.requestEnvelope, 'department');
        console.log(`department: ${departmentValue}`)
        const classNumberValue = Alexa.getSlotValue(handlerInput.requestEnvelope, 'class');
        console.log(`class: ${classNumberValue}`)

        // Logic to determine the best professor based on HTML request
        const bestProf = await determineBestProf(departmentValue, classNumberValue);

        const speakOutput = `The best professor for ${departmentValue} ${classNumberValue} is ${bestProf}.`;
        console.log(`speak output: ${speakOutput}`)
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .withShouldEndSession(true)
            .getResponse();
    }
};

const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.error('Error handled: ${error.message}');
        return handlerInput.responseBuilder
            .speak('Sorry, I cannot understand the command. Please try again.')
            .getResponse();
    }
};

exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        FindProfessorIntentHandler
    )
    .addErrorHandlers(
        ErrorHandler
    )
    .lambda();
