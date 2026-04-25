// utils/hash.js
import crypto from 'crypto';

export const generateFileHash = (buffer) => {
  return crypto.createHash('sha256').update(buffer).digest('hex');
};
