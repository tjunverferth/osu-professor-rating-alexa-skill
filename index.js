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
            .reprompt('Please say the department and class number that you are interested in or say stop to exit')
            .getResponse();
    }
};

const StopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Goodbye!';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .withShouldEndSession(true)
            .getResponse();
    }
};

async function determineBestProf(department, classNumber) {
    const url = `https://osuprofs.com/courses/${department}/${classNumber}`;

    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        const profName = $('h5.card-title a').first().text().trim();
        const profRating = $('div.cards .card').first().find("tbody tr:first-child td").text().substring(0,4);
        if (profName.length > 0) {
            const bestProf = [profName, profRating];
            return bestProf;
        } else {
            return false;
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
        const classNumberValue = Alexa.getSlotValue(handlerInput.requestEnvelope, 'class');

        // logic to determine the best professor based on HTML request
        const bestProf = await determineBestProf(departmentValue, classNumberValue);

        let speakOutput = '';
        if (bestProf) {
            speakOutput = `The best professor for ${departmentValue} 
            <say-as interpret-as="characters">${classNumberValue}</say-as> 
            is ${bestProf[0]}, with a rating of ${bestProf[1]} out of five.`;
        } else {
            speakOutput = 'There was an error finding your class.';
        }
        speakOutput += ' Would you like to search for another professor? Please say the department and class number or say stop to exit.';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt('Please say the department and class number or say stop to exit.')
            .getResponse();
    }
};

const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.error(`Error handled: ${error.message}`);
        return handlerInput.responseBuilder
            .speak('Sorry, I cannot understand the command. Please try again.')
            .getResponse();
    }
};

exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        FindProfessorIntentHandler,
        StopIntentHandler,
    )
    .addErrorHandlers(
        ErrorHandler
    )
    .lambda();
