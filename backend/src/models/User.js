import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    index: true
  },
  passwordHash: {
    type: String,
    required: true,
    select: false // Do not return by default
  },

  // Profile
  avatarUrl: {
    type: String,
    default: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
  },
  bio: { type: String, maxlength: 200 },
  name: { type: String, trim: true },
  projectsDoneCount: { type: Number, default: 0 },
  socialLinks: {
    github: { type: String, default: "" },
    twitter: { type: String, default: "" },
    linkedin: { type: String, default: "" },
    website: { type: String, default: "" }
  },

  // GitHub Integration
  githubId: { type: String, unique: true, sparse: true, index: true },
  githubUsername: { type: String },
  githubAccessTokenEncrypted: { type: String, select: false },

  // Role & Status
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user"
  },
  isEmailVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },

  // Activity
  lastLoginAt: { type: Date },
  lastActiveAt: { type: Date, default: Date.now },

  projects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  }],

  // User Preferences
  preferences: {
    theme: {
      type: String,
      enum: ["light", "dark", "system"],
      default: "dark"
    },
    editorFontSize: { type: Number, default: 14 },
    tabSize: { type: Number, default: 2 },
    keymap: {
      type: String,
      enum: ["vscode", "vim", "emacs"],
      default: "vscode"
    }
  },

  // Security
  security: {
    refreshTokenHash: { type: String, select: false },
    passwordChangedAt: { type: Date },
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date }
  }
}, {
  timestamps: true // createdAt, updatedAt
});

const User = mongoose.model("User", userSchema);
export default User;