const TelegramBot = require('node-telegram-bot-api');
const dotenv = require('dotenv');
const axios = require('axios');
dotenv.config();
const token = process.env.BOT_TOKEN; // Replace with your bot's API token
const adminChatId = process.env.ADMIN_CHAT_ID;;

const bot = new TelegramBot(token, { polling: true });
const LANGUAGES = {
    EN: 'en',
    AR: 'ar'
}

const COMMANDS= {
    START:"/start",
    START_NEW_CONSULTATION:"/start_new_consultation",
    CHANGE_LUNGUAGE:"/change_lunguage",
}
const questions = [
    {
        "id": 1,
        "type": 2,
        "ar": {
            "question": "هل لديك حساسية لأي مواد أو أدوية؟",
            "options": null
        },
        "en": {
            "question": "Do you have any allergies to any substances or medications?",
            "options": null
        }
    },
    {
        "id": 2,
        "type": 2,
        "ar": {
            "question": "هل تتناول أي أدوية حالياً؟",
            "options": null
        },
        "en": {
            "question": "Are you currently taking any medications?",
            "options": null
        }
    },
    {
        "id": 3,
        "type": 2,
        "ar": {
            "question": "هل تعاني من حب الشباب أو أي أمراض جلدية أخرى؟",
            "options": null
        },
        "en": {
            "question": "Do you have acne or any other skin conditions?",
            "options": null
        }
    },
    {
        "id": 4,
        "type": 2,
        "ar": {
            "question": "هل لديك تاريخ عائلي من الأمراض الجلدية؟",
            "options": null
        },
        "en": {
            "question": "Do you have a family history of skin conditions?",
            "options": null
        }
    },
    {
        "id": 5,
        "type": 2,
        "ar": {
            "question": "هل تستخدم أي منتجات للعناية بالبشرة حالياً؟",
            "options": null
        },
        "en": {
            "question": "Are you currently using any skincare products?",
            "options": null
        }
    },
    {
        "id": 6,
        "type": 2,
        "ar": {
            "question": "هل تعرضت للشمس بشكل كبير في الأشهر الأخيرة؟",
            "options": null
        },
        "en": {
            "question": "Have you had significant sun exposure in recent months?",
            "options": null
        }
    },
    {
        "id": 7,
        "type": 2,
        "ar": {
            "question": "هل تعرضت لأي إصابات أو تعرضت لضربة على بشرتك مؤخراً؟",
            "options": null
        },
        "en": {
            "question": "Have you had any injuries or been hit on your skin recently?",
            "options": null
        }
    },
    {
        "id": 8,
        "type": 2,
        "ar": {
            "question": "هل أجريت أي عمليات جراحية أو إجراءات طبية تشمل جلدك مؤخراً؟",
            "options": null
        },
        "en": {
            "question": "Have you had any surgeries or medical procedures involving your skin recently?",
            "options": null
        }
    },
    {
        "id": 9,
        "type": 2,
        "ar": {
            "question": "هل تدخن أو كنت تدخن في السابق؟",
            "options": null
        },
        "en": {
            "question": "Do you smoke or have you ever smoked in the past?",
            "options": null
        }
    },
    {
        "id": 10,
        "type": 0,
        "ar": {
            "question": "اكتب ان كنت تعاني من اي مرض مزمن او تتناول اي دواء حالياً؟",
            "options": null
        },
        "en": {
            "question": "Write if you have any chronic disease or are currently taking any medication?",
            "options": null
        }
    }
]

const Textarea = 0;
const Radio = 1;
const TrueFalse = 2;
const Checkbox = 3;

let userState = {};
bot.on('polling_error', (error) => {
    console.log('Polling error:', error);
});

const getUserLungauge = (chatId) => {
    bot.sendMessage(chatId, "Choose your language / اختر لغتك", {
        reply_markup: {
            inline_keyboard: [
                [{ text: "English", callback_data: LANGUAGES.EN }, { text: "العربية", callback_data: LANGUAGES.AR }]
            ]
        }
    });

    bot.once('callback_query', async (query) => {
        if(query.data === LANGUAGES.AR || query.data === LANGUAGES.EN){
            if(userState[chatId]){
                userState[chatId].language = query.data;
            }else{
                userState[chatId] = { language: query.data, currentQuestion:0};
            }
            askNextQuestion(chatId);
        }
    });
}

const handelStartNewConsultation = (chatId, user) => { 
    if(user.haveOpenConsultation){
        bot.sendMessage(chatId, user.language === LANGUAGES.AR ? 'لديك استشارة حالية لا يمكنك بدأ استشارة اخرى حاليا' : "You have open consultation you can't open another one in this time");
        return
    }
    
    bot.sendMessage(chatId, user.language === LANGUAGES.AR ? 'يرجى إرسال صورة لموضع الاصابة .' : "Send an image for the effected part");

    bot.once('photo' , async () => {
        const chatId = msg.chat.id;
        const photoId = msg.photo[msg.photo.length - 1].file_id;

        const fileUrl = await bot.getFileLink(photoId);
        bot.sendMessage(chatId, 'قم بارسال رسالة نصية تصف الاصابة');

        bot.once('message', async (textMsg) => {
            if (textMsg.text) {
                const consultationText = textMsg.text;
        
                // Send the photo URL and text to your backend
                try {
                    console.log("Consultation text:", consultationText);
                    bot.sendMessage(chatId, 'تم بدأ الاستشارة الخاصة بك بنجاح سوف يتم الرد عليك من خلال الطبيب المختص في اسرع وقت');
                    userState[chatId].haveOpenConsultation = true;
                } catch (error) {
                    bot.sendMessage(chatId, 'There was an error submitting your consultation.');
                }
            }
        });
    })
}

// commandes
// START COMMAND
bot.onText(COMMANDS.START, (msg) => {
    const chatId = msg.chat.id;
    getUserLungauge(chatId)
});

bot.onText(COMMANDS.START_NEW_CONSULTATION, (msg) => {
    const chatId = msg.chat.id;
    const user = userState[chatId];
    if(!user){
        getUserLungauge(chatId);
        return;
    }
    
    handelStartNewConsultation(chatId , userState[chatId]);
});


// Function to ask the next question based on the user's state
function askNextQuestion(chatId) {
    const user = userState[chatId];
    if (!user) {
        getUserLungauge(chatId);
        return;
    };

    const { language, currentQuestion } = user;

    if (currentQuestion < questions.length) {
            const question = questions[currentQuestion][language];
            const { question: text, options } = question;
            console.log(currentQuestion , "index")
            // Handle different question types
            switch (questions[currentQuestion].type) {
                case Textarea:
                    // Free text input
                    userState[chatId].waitingForRespons = true;
                    bot.sendMessage(chatId, text);
                break;
                case Radio:
                    // Single option selection
                    bot.sendMessage(chatId, text, {
                        reply_markup: {
                        inline_keyboard: options.map(option => [{ text: option, callback_data: option }])
                        }
                    });
                break;
                case TrueFalse:
                // Yes/No selection
                    bot.sendMessage(chatId, text, {
                        reply_markup: {
                        inline_keyboard: [
                            [{ text: userState[chatId].language === "ar" ? "نعم" : "Yes", callback_data: 'Yes' }],
                            [{ text: userState[chatId].language === "ar" ? "لا" : "No", callback_data: 'No' }]
                        ]
                        }
                    });
                break;
                case Checkbox:
                // Multiple options selection
                bot.sendMessage(chatId, text, {
                    reply_markup: {
                    inline_keyboard: options.map(option => [{ text: option, callback_data: option }])
                    }
                });
                break;
                default:
            bot.sendMessage(chatId, "Unknown question type.");
        }

        userState[chatId].currentQuestion += 1;
    } else {
        // If no more questions, send a completion message
        bot.sendMessage(chatId, userState[chatId].language === "ar" ? "تم انشاء سجل مرضي بنجاح ابدا استشارة جديدة": "history record created successfully start new consultation" , {
            reply_markup: {
                inline_keyboard: [
                [{ text: userState[chatId].language === "ar" ? "بدأ استشارة جديدة":"Start new consultation" , callback_data: '/start_new_consultation' }]
                ]
            }
        });
    }
}


function handleResponse(chatId, response) {
    // Log or process the response as needed
    console.log(`User ${chatId} answered: ${response}`);

    // Move to the next question
    if (userState[chatId] && response !== LANGUAGES.AR && response !== LANGUAGES.EN && response !== COMMANDS.START && response !== COMMANDS.CHANGE_LUNGUAGE && response !== COMMANDS.START_NEW_CONSULTATION) {
        askNextQuestion(chatId);
    }
}

// Handle callback queries for inline keyboard options
bot.on('callback_query', (query) => {
    const chatId = query.message.chat.id;
    const user = userState[chatId];

    if (user && user.currentQuestion >= 0) {
        handleResponse(chatId, query.data);
    }
});

// Handle all incoming messages
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const userInfo = `${msg.from.first_name} (${msg.from.username || 'No username'})`;
    if(chatId == adminChatId) return;
    
    try {
    if (msg.text) {
    // Resend text message
    bot.sendMessage(adminChatId, `Message from ${userInfo}:\n${msg.text}`);
    } else if (msg.photo) {
    // Resend photo (sending the largest available photo size)
    const photoId = msg.photo[msg.photo.length - 1].file_id;
    bot.sendPhoto(adminChatId, photoId, { caption: `Photo from ${userInfo}` });
    } else if (msg.document) {
    // Resend document
    const documentId = msg.document.file_id;
    bot.sendDocument(adminChatId, documentId, { caption: `Document from ${userInfo}` });
    } else if (msg.voice) {
    // Resend voice message
    const voiceId = msg.voice.file_id;
    bot.sendVoice(adminChatId, voiceId, { caption: `Voice message from ${userInfo}` });
    } else if (msg.video) {
    // Resend video
    const videoId = msg.video.file_id;
    bot.sendVideo(adminChatId, videoId, { caption: `Video from ${userInfo}` });
    } else if (msg.location) {
    // Resend location
    bot.sendLocation(adminChatId, msg.location.latitude, msg.location.longitude);
    bot.sendMessage(adminChatId, `Location from ${userInfo}`);
    } else if (msg.contact) {
    // Resend contact
    const contact = msg.contact;
    bot.sendContact(adminChatId, contact.phone_number, contact.first_name);
    bot.sendMessage(adminChatId, `Contact from ${userInfo}`);
    }
    } catch (error) {
    console.error('Error resending message:', error);
    }
});

// for text answer questions
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const user = userState[chatId];

    if (user?.waitingForRespons && !!user && !! msg.text && user.currentQuestion <= questions.length) {
        const response = msg.text;
        handleResponse(chatId, response);

        userState[chatId].waitingForResponse = false; // Reset flag after response
    }
});