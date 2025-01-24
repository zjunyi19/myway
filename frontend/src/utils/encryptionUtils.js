const crypto = require('crypto-browserify');
const Buffer = require('buffer/').Buffer;

// 加密消息
export const encryptMessage = (message, publicKey) => {
    try {
        const encrypted = crypto.publicEncrypt(
            {
                key: publicKey,
                padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            },
            Buffer.from(message)
        );
        return encrypted.toString('base64');
    } catch (error) {
        console.error('Encryption error:', error);
        return null;
    }
};

// 解密消息
export const decryptMessage = (encryptedMessage, privateKey) => {
    try {
        const decrypted = crypto.privateDecrypt(
            {
                key: privateKey,
                padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            },
            Buffer.from(encryptedMessage, 'base64')
        );
        return decrypted.toString();
    } catch (error) {
        console.error('Decryption error:', error);
        return null;
    }
}; 