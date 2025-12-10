// const admin = require('firebase-admin');

// const serviceAccount = require('./shubhlibaas-c4839-firebase-adminsdk-n9xek-a6fd3cc9e2.json');

// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount)
// });
// // 
// // function sendNotification(userTokens, messagePayload) {

// //     const sendPromises = userTokens.map(token => {
// //         message.token = token;
// //         return admin.messaging().send(messagePayload)
// //             .then(response => {
// //                 console.log('Successfully sent message:', response);
// //                 return response;
// //             })
// //             .catch(error => {
// //                 console.error('Error sending message:', error);
// //                 return error;
// //             });
// //     });

// //     return Promise.all(sendPromises);
// // }

// // function sendNotification(userTokens, messagePayload) {
// //     userTokens = ['cUlXHuN-RF-vklKglFZzYT:APA91bEZN5XdtNoxAs2lCZehwrtM2r14RW6ACtb3h42_omvCLjzxf9N9l1yJHxMnpEkHYxhZtPigfk7Tmt7ItUnUOBh6aCvVLfG2N2tl8BShwWtA3o7lJlAFmPdob0B-EvAB-NZ-6XyU']
// //     const sendPromises = userTokens.map(token => {
// //         message.token = token;
// //         return admin.messaging().send(messagePayload);
// //     });

// //     return Promise.all(sendPromises);
// // }

// function sendNotification() {
//     const message = {
//         notification: {
//             title: 'Test Title',
//             body: 'Test Body',
//         },
//         token: 'cUlXHuN-RF-vklKglFZzYT:APA91bEZN5XdtNoxAs2lCZehwrtM2r14RW6ACtb3h42_omvCLjzxf9N9l1yJHxMnpEkHYxhZtPigfk7Tmt7ItUnUOBh6aCvVLfG2N2tl8BShwWtA3o7lJlAFmPdob0B-EvAB-NZ-6XyU'
//     };

//     const sendPromises = userTokens.map(token => {
//         message.token = token;
//         return admin.messaging().send(messagePayload);
//     });

//     return Promise.all(sendPromises)

//     // admin.messaging().send(message)
//     //     .then(response => {
//     //         console.log('Successfully sent message:', response);
//     //     })
//     //     .catch(error => {
//     //         console.error('Error sending message:', error);
//     //     });
// }


// module.exports = sendNotification;

