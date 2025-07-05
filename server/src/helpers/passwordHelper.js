import bcrypt from 'bcryptjs';

/**
 * Hash password using bcrypt
 * @param {string} password - Plain text password to hash
 * @returns {Promise<string>} - Returns hashed password
 */
export async function hashPassword(password) {
  const saltRounds = 10;

  const hashedPassword = await new Promise((resolve, reject) => {
    bcrypt.hash(password, saltRounds, function (err, hash) {
      if (err) reject(err);
      else resolve(hash);
    });
  });

  return hashedPassword;
}

/**
 * Compare plain text password with hashed password
 * @param {string} candidatePassword - Plain text password to compare
 * @param {string} hashedPassword - Hashed password from database
 * @returns {Promise<boolean>} - Returns true if passwords match
 */
export async function comparePassword(candidatePassword, hashedPassword) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(candidatePassword, hashedPassword, (err, isMatch) => {
      if (err) reject(err);
      else resolve(isMatch);
    });
  });
}
