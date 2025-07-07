import fs from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { isValidUrl } from '../utils/utils.js';
import { IMAGES_FOLDER_PATH } from '../utils/constants.js';
import { hashPassword } from '../helpers/passwordHelper.js';
import { validateUserModel } from '../validations/userValidation.js';

// Get current directory for file paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const { Schema } = mongoose;

// ===========================================
// USER SCHEMA
// ===========================================
// This schema defines user accounts for the e-commerce site
const userSchema = new Schema(
  {
    // How the user signed up (local, google, facebook)
    provider: {
      type: String,
      required: true,
    },
    // Unique username for login
    username: {
      type: String,
      lowercase: true,
      unique: true,
      required: [true, "can't be blank"],
      match: [/^[a-zA-Z0-9_]+$/, 'is invalid'], // Only letters, numbers, underscore
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [20, 'Username cannot exceed 20 characters'],
      index: true, // For fast lookup
    },
    // User's email address
    email: {
      type: String,
      lowercase: true,
      unique: true,
      required: [true, "can't be blank"],
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'is invalid'], // Valid email format
      index: true, // For fast lookup
    },
    // Password (only for local accounts, not social login)
    password: {
      type: String,
      trim: true,
      minlength: 6,
      maxlength: 60,
    },
    // User's display name
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters']
    },
    // Profile picture
    avatar: String,
    // User role (regular user or admin)
    role: { 
      type: String, 
      default: 'USER',
      enum: ['USER', 'ADMIN'],
      uppercase: true
    },
    // User's bio/description
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
      trim: true
    },
    // ===========================================
    // SOCIAL LOGIN IDs
    // ===========================================
    // Google account ID (for Google login)
    googleId: {
      type: String,
      unique: true,
      sparse: true, // Allow multiple null values
    },
    // Facebook account ID (for Facebook login)
    facebookId: {
      type: String,
      unique: true,
      sparse: true, // Allow multiple null values
    },
  },
  { timestamps: true }, // Auto add createdAt and updatedAt
);

// ===========================================
// INSTANCE METHODS
// ===========================================
// Control what data is sent to frontend (hide sensitive info)
userSchema.methods.toJSON = function () {
  // Handle avatar path - check if it's a URL or local file
  const absoluteAvatarFilePath = `${join(__dirname, '../..', IMAGES_FOLDER_PATH)}${this.avatar}`;
  const avatar = isValidUrl(this.avatar)
    ? this.avatar // Use URL as-is
    : fs.existsSync(absoluteAvatarFilePath)
      ? `${IMAGES_FOLDER_PATH}${this.avatar}` // Use local file
      : `${IMAGES_FOLDER_PATH}avatar2.jpg`; // Use default avatar

  return {
    id: this._id,
    provider: this.provider,
    email: this.email,
    username: this.username,
    avatar: avatar,
    name: this.name,
    role: this.role,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

// ===========================================
// JWT TOKEN GENERATION
// ===========================================
// Choose secret key based on environment
const isProduction = process.env.NODE_ENV === 'production';
const secretOrKey = isProduction ? process.env.JWT_SECRET_PROD : process.env.JWT_SECRET_DEV;

// Generate login token for user
userSchema.methods.generateJWT = function () {
  const token = jwt.sign(
    {
      expiresIn: '12h',
      id: this._id,
      provider: this.provider,
      email: this.email,
    },
    secretOrKey,
  );
  return token;
};

// ===========================================
// USER REGISTRATION
// ===========================================
// Register new user (hash password if local account)
userSchema.methods.registerUser = async function () {
  if (this.password && this.provider === 'local') {
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
  }
  return this.save();
};

// ===========================================
// MIDDLEWARE (runs before saving)
// ===========================================
// Validate password for local users before saving
userSchema.pre('save', function (next) {
  if (this.provider === 'local' && (!this.password || this.password.length < 6)) {
    return next(new Error('Password is required and must be at least 6 characters for local users'));
  }
  next();
});

// ===========================================
// PASSWORD COMPARISON
// ===========================================
// Compare entered password with stored hash
userSchema.methods.comparePassword = function (candidatePassword, callback) {
  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    if (err) return callback(err);
    callback(null, isMatch);
  });
};

// ===========================================
// CREATE AND EXPORT MODEL
// ===========================================
const User = mongoose.model('User', userSchema);

export default User;
export { hashPassword, validateUserModel };
