const crypto = require('crypto');

const DEFAULT_SERVER_SEED_LENGTH = 64;
const DEFAULT_CLIENT_SEED_LENGTH = 20;
const DICE_MULTIPLIER = 10001;

function generateServerSeed(seedLength = DEFAULT_SERVER_SEED_LENGTH) {
    const possibleCharacters = '0123456789abcdefABCDEF';
    let seed = '';
    for (let i = 0; i < seedLength; i++) {
        seed += possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
    }
    return seed;
}

function generateClientSeed(seedLength = DEFAULT_CLIENT_SEED_LENGTH) {
    const possibleCharacters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!-_+=/?@#$%^&*()';
    let seed = '';
    for (let i = 0; i < seedLength; i++) {
        seed += possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
    }
    return seed;
}

function sha256Encrypt(inputString) {
    return crypto.createHash('sha256').update(inputString, 'utf8').digest('hex');
}

function seedsToHexadecimals(serverSeed, clientSeed, nonce) {
    const message = `${clientSeed}:${nonce}:0`;
    const hmac = crypto.createHmac('sha256', serverSeed);
    hmac.update(message);
    return [hmac.digest('hex')];
}

function hexadecimalToBytes(hexadecimal) {
    const bytes = [];
    for (let i = 0; i < hexadecimal.length; i += 2) {
        bytes.push(parseInt(hexadecimal.substr(i, 2), 16));
    }
    return bytes;
}

function bytesToBasicNumber(bytesList) {
    return (bytesList[0] / Math.pow(256, 1)) +
           (bytesList[1] / Math.pow(256, 2)) +
           (bytesList[2] / Math.pow(256, 3)) +
           (bytesList[3] / Math.pow(256, 4));
}

function bytesToNumber(bytesList, multiplier) {
    const basicNumber = bytesToBasicNumber(bytesList);
    return Math.floor(basicNumber * multiplier);
}

function seedsToResults(serverSeed, clientSeed, nonce) {
    const hexs = seedsToHexadecimals(serverSeed, clientSeed, nonce);
    const bytesLists = hexs.map(hexadecimalToBytes);
    const row = [];
    for (const bytesList of bytesLists) {
        for (let i = 0; i < bytesList.length; i += 4) {
            const chunk = bytesList.slice(i, i + 4);
            if (chunk.length === 4) {
                row.push(bytesToNumber(chunk, DICE_MULTIPLIER));
                if (row.length === 1) {
                    return Math.round(row.reduce((a, b) => a + b, 0) / 100);
                }
            }
        }
    }
}
