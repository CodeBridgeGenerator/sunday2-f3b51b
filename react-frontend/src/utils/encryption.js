// src/utils/encryption.js
const CryptoJS = require('crypto-js');

const SECRET_KEY = process.env.REACT_APP_SECRETKEY;

export function decryptData(ciphertext) {
    try {
        // Decrypt the data
        const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
        const decryptedDataString = bytes.toString(CryptoJS.enc.Utf8);

        if (!decryptedDataString) {
            console.error('Decryption resulted in empty data. Ciphertext:', ciphertext);
            return null;
        }

        return JSON.parse(decryptedDataString);
    } catch (error) {
        console.error('Decryption failed:', error);
        return null;
    }
}
// Feathers Client Hook - Decrypt Response
export const decryptResponseClientHook = async (context) => {
    if (context.result && context.result.encrypted) {
        const encrypted = context.result.encrypted;
        const decrypted = decryptData(encrypted);
        if (decrypted) {
            context.result = decrypted;
        }
    } else {
        console.debug('No encrypted data found in response:', context.result);
    }

    return context;
};
