const sendFCM = require('./sendFCM');

async function fcmSendService(request, response) {
    const messagePayload = request.body.payload;

    try {
        const result = await sendFCM(messagePayload);
        return response.status(200).json(result);
    } catch (error) {
        return response.status(511).send(`fcm Send Service : ${error.message}`);
    }
}

module.exports = fcmSendService;
