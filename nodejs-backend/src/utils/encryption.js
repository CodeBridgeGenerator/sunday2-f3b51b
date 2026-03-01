const CryptoJS = require('crypto-js');

// Encrypt data
function encryptData(app, data) {
    const SECRET_KEY = app.get("authentication.secret");
    try {
        if (!data) throw new Error('No data provided for encryption');
        const ciphertext = CryptoJS.AES.encrypt(
            JSON.stringify(data),
            SECRET_KEY
        ).toString();
        return ciphertext;
    } catch (error) {
        console.error('Encryption error:', error);
        throw error;
    }
}

function decryptData(app, ciphertext) {
    const SECRET_KEY = app.get("authentication.secret");
    try {
        if (!ciphertext)
            throw new Error('No ciphertext provided for decryption');
        const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
        const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
        if (!decryptedData) throw new Error('Decryption failed - empty result');
        return JSON.parse(decryptedData);
    } catch (error) {
        console.error('Decryption error:', error);
        throw error;
    }
}

// FeathersJS Hook - Encrypt Response
const encryptResponse = async (context) => {
    const { app } = context;
    if (context.result) {
        if (!context.result.encrypted) {
            context.result = { encrypted: encryptData(app, context.result) };
        }
    }
    return context;
};

// FeathersJS Hook - Decrypt Request
const decryptRequest = async (context) => {
    const { app } = context;
    if (context.data && context.data.encrypted) {
        context.data = decryptData(app, context.data.encrypted);
    }
    return context;
};

// FeathersJS Hook - Decrypt Response
const decryptResponse = async (context) => {
    const { app } = context;
    if (context.result && context.result.encrypted) {
        context.result = decryptData(app, context.result.encrypted);
    }
    return context;
};

module.exports = {
    encryptData,
    decryptData,
    encryptResponse,
    decryptRequest,
    decryptResponse
};
