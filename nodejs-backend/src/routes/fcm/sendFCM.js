const admin = require('firebase-admin');
const serviceAccount = require('./gcp-service-account.json');

// const messagePayload = {
//     notification: {
//         title: "New Update Available!",
//         body: "Check out the latest features in our app.",
//         image: "https://example.com/image.png", // URL of the image
//     },
//     data: {
//         click_action: "FLUTTER_NOTIFICATION_CLICK",
//         promotion_id: "12345",
//         discount: "50",
//     },
//     android: {
//         priority: "high",
//     },
//     apns: {
//         headers: {
//             "apns-priority": "10",
//         },
//     },
// };

// const tokens = [
//     "fcm_token_1",
//     "fcm_token_2",
//     "fcm_token_3", // Add your FCM tokens here
// ];

async function sendFCM(messagePayload) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
    let isSuccess = false;
    try {
        const response = await admin.messaging().sendEachForMulticast({
            ...messagePayload
        });
        isSuccess = true;

        console.debug('FCM Response:', response);
        console.debug(
            `${response.successCount} messages were sent successfully.`
        );

        response.responses.forEach((res, idx) => {
            if (res.success) {
                console.debug(`Message to token[${idx}] sent successfully.`);
            } else {
                console.error(`Error sending to token[${idx}]:`, res.error);
                // todo updat the table if the fcm token for user us invalid
            }
        });

        return { isSuccess, response };
    } catch (error) {
        console.error('Error sending FCM messages:', error);
        return { isSuccess, error: error.message };
    }
}

module.exports = sendFCM;
