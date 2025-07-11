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
// ADDRESS SCHEMA
// ===========================================
const addressSchema = new Schema({
    type: {
        type: String,
        enum: ['home', 'work', 'other'],
        default: 'home'
    },
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    phoneNumber: {
        type: String,
        required: true,
        trim: true
    },
    address: {
        type: String,
        required: true,
        trim: true
    },
    city: {
        type: String,
        required: true,
        trim: true
    },
    district: {
        type: String,
        required: true,
        trim: true
    },
    ward: {
        type: String,
        required: true,
        trim: true
    },
    isDefault: {
        type: Boolean,
        default: false
    }
});

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
      index: true,
    },
      email: {
        type: String,
        lowercase: true,
        unique: true,
        required: [true, "can't be blank"],
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'is invalid'],
        index: true,
      },
      password: {
        type: String,
        trim: true,
        minlength: 6,
        maxlength: 60,
      },
      name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters'],
        maxlength: [50, 'Name cannot exceed 50 characters']
      },
      avatar: String,
      role: {
        type: String,
        default: 'USER',
        enum: ['USER', 'ADMIN'],
        uppercase: true
      },
      bio: {
        type: String,
        maxlength: [500, 'Bio cannot exceed 500 characters'],
        trim: true
      },
      phoneNumber: {
        type: String,
        trim: true,
        validate: {
          validator: function(v) {
            return !v || /^[0-9]{10,11}$/.test(v);
          },
          message: 'Phone number must be 10-11 digits'
        }
      },
      dateOfBirth: {
        type: Date
      },
      gender: {
        type: String,
        enum: ['male', 'female', 'other'],
        lowercase: true
      },
      addresses: [addressSchema],
      // Wishlist - products user wants to buy later
      wishlist: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      }],
      preferences: {
        petTypes: [{
          type: String,
          enum: ['dog', 'cat', 'bird', 'fish', 'other']
        }],
        newsletter: {
          type: Boolean,
          default: true
        },
        notifications: {
          orders: { type: Boolean, default: true },
          promotions: { type: Boolean, default: true },
          newProducts: { type: Boolean, default: false }
        }
      },
      isActive: {
        type: Boolean,
        default: true
      },
      lastLogin: {
        type: Date
      },
      emailVerified: {
        type: Boolean,
        default: false
      },
      emailVerificationToken: String,
      passwordResetToken: String,
      passwordResetExpires: Date,
      // ===========================================
      // SOCIAL LOGIN IDs
      // ===========================================
      googleId: {
        type: String,
        unique: true,
        sparse: true, // Allow multiple null values
      },
      facebookId: {
        type: String,
        unique: true,
        sparse: true, // Allow multiple null values
      },
    },
  { timestamps: true },
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
// Hash password before saving (for local users)
userSchema.pre('save', async function (next) {
  // Only hash password if it's modified and user is local
  if (this.isModified('password') && this.provider === 'local') {
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
  }
  next();
});

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

// Promise-based version for modern async/await
userSchema.methods.comparePasswordAsync = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ===========================================
// CREATE AND EXPORT MODEL
// ===========================================
const User = mongoose.model('User', userSchema);

export default User;
export { hashPassword, validateUserModel };
