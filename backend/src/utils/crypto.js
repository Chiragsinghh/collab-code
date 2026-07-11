import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;

// Derive a fixed 32-byte key from the JWT_SECRET
const getEncryptionKey = () => {
  const secret = process.env.JWT_SECRET || 'default-fallback-secret-key-32bytes';
  return crypto.createHash('sha256').update(secret).digest();
};

/**
 * Encrypts cleartext using AES-256-CBC.
 * @param {string} text - Text to encrypt
 * @returns {string} The encrypted token representation "iv:encryptedtext"
 */
export function encrypt(text) {
  if (!text) return null;
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const key = getEncryptionKey();
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return `${iv.toString('hex')}:${encrypted}`;
  } catch (error) {
    console.error('Encryption failed:', error);
    return null;
  }
}

/**
 * Decrypts encrypted text back to cleartext.
 * @param {string} text - Encrypted text in "iv:encryptedtext" format
 * @returns {string} The decrypted cleartext
 */
export function decrypt(text) {
  if (!text) return null;
  try {
    const textParts = text.split(':');
    if (textParts.length < 2) {
      throw new Error('Invalid encrypted text format');
    }
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const key = getEncryptionKey();
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error);
    return null;
  }
}
