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

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    provider: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      lowercase: true,
      unique: true,
      required: [true, "can't be blank"],
      match: [/^[a-zA-Z0-9_]+$/, 'is invalid'],
      index: true,
    },
    email: {
      type: String,
      lowercase: true,
      unique: true,
      required: [true, "can't be blank"],
      match: [/\S+@\S+\.\S+/, 'is invalid'],
      index: true,
    },
    password: {
      type: String,
      trim: true,
      minlength: 6,
      maxlength: 60,
    },
    name: String,
    avatar: String,
    role: { type: String, default: 'USER' },
    bio: String,
    // google
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    // fb
    facebookId: {
      type: String,
      unique: true,
      sparse: true,
    },
    // messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }],
  },
  { timestamps: true },
);

userSchema.methods.toJSON = function () {
  // if not exists avatar1 default
  const absoluteAvatarFilePath = `${join(__dirname, '../..', IMAGES_FOLDER_PATH)}${this.avatar}`;
  const avatar = isValidUrl(this.avatar)
    ? this.avatar
    : fs.existsSync(absoluteAvatarFilePath)
      ? `${IMAGES_FOLDER_PATH}${this.avatar}`
      : `${IMAGES_FOLDER_PATH}avatar2.jpg`;

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

const isProduction = process.env.NODE_ENV === 'production';
const secretOrKey = isProduction ? process.env.JWT_SECRET_PROD : process.env.JWT_SECRET_DEV;

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

userSchema.methods.registerUser = async function () {
  if (this.password && this.provider === 'local') {
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
  }
  return this.save();
};

// Add password validation
userSchema.pre('save', function (next) {
  if (this.provider === 'local' && (!this.password || this.password.length < 6)) {
    return next(new Error('Password is required and must be at least 6 characters for local users'));
  }
  next();
});

userSchema.methods.comparePassword = function (candidatePassword, callback) {
  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    if (err) return callback(err);
    callback(null, isMatch);
  });
};

const User = mongoose.model('User', userSchema);

export default User;
export { hashPassword, validateUserModel };
