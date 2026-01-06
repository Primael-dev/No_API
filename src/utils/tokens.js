import crypto from 'crypto';

export function generateToken(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

export function getTokenExpiry(expiresIn) {
  const now = new Date();
  const value = parseInt(expiresIn);
  const unit = expiresIn.replace(/[0-9]/g, '');

  const multipliers = {
    'm': 60 * 1000,
    'h': 60 * 60 * 1000,
    'd': 24 * 60 * 60 * 1000
  };

  const ms = value * (multipliers[unit] || multipliers.m);
  return new Date(now.getTime() + ms);
}