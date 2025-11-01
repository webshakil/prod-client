import CryptoJS from 'crypto-js';

/**
 * Generate unique vote ID
 */
export const generateVoteId = () => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `VOTE-${timestamp}-${random}`.toUpperCase();
};

/**
 * Generate receipt ID
 */
export const generateReceiptId = () => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `RCP-${timestamp}-${random}`.toUpperCase();
};

/**
 * Generate lottery ticket number (8-digit number)
 */
export const generateLotteryTicket = (userId, electionId) => {
  const combined = `${userId}-${electionId}-${Date.now()}`;
  const hash = CryptoJS.SHA256(combined).toString();
  // Take first 8 characters and convert to 8-digit number
  const number = parseInt(hash.substring(0, 8), 16) % 100000000;
  return number.toString().padStart(8, '0');
};

/**
 * Create vote hash for integrity verification
 */
export const createVoteHash = (voteData) => {
  const dataString = JSON.stringify({
    voteId: voteData.voteId,
    electionId: voteData.electionId,
    userId: voteData.userId,
    answers: voteData.answers,
    timestamp: voteData.timestamp
  });
  
  return CryptoJS.SHA256(dataString).toString();
};

/**
 * Encrypt sensitive vote data (AES encryption)
 */
export const encryptVoteData = (voteData, secretKey = 'vottery-secret-2025') => {
  const dataString = JSON.stringify(voteData);
  return CryptoJS.AES.encrypt(dataString, secretKey).toString();
};

/**
 * Decrypt vote data
 */
export const decryptVoteData = (encryptedData, secretKey = 'vottery-secret-2025') => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
    const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decryptedString);
  } catch (error) {
    console.error('Decryption failed:', error);
    return null;
  }
};

/**
 * Verify vote integrity using hash
 */
export const verifyVoteIntegrity = (voteData, providedHash) => {
  const calculatedHash = createVoteHash(voteData);
  return calculatedHash === providedHash;
};

/**
 * Generate digital signature for vote
 */
export const generateDigitalSignature = (voteData) => {
  const timestamp = Date.now();
  const dataString = JSON.stringify({
    ...voteData,
    timestamp
  });
  
  return {
    signature: CryptoJS.HmacSHA256(dataString, 'vottery-sign-key').toString(),
    timestamp
  };
};