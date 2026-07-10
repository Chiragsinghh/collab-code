import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: false // names don't have to be unique globally, but maybe per user?
  },
  slug: {
    type: String,
    unique: true,
    sparse: true,
    index: true
  },
  roomId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },

  description: { type: String, maxlength: 500 },
  visibility: {
    type: String,
    enum: ["private", "shared", "public"],
    default: "private"
  },

  // Owner & Members
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    index: true
  }],

  // File Tree
  tree: {
    type: mongoose.Schema.Types.Mixed, // JSON object
    default: []
  },

  // IDE Settings
  settings: {
    autosaveInterval: { type: Number, default: 3000 },
    runOnSave: { type: Boolean, default: false },
    defaultLanguage: { type: String, default: "javascript" },
    previewPort: { type: Number, default: 3000 }
  },

  // GitHub Integration
  github: {
    repoUrl: { type: String },
    repoId: { type: String },
    defaultBranch: { type: String, default: "main" },
    lastSyncAt: { type: Date }
  },

  // Stats
  stats: {
    totalRuns: { type: Number, default: 0 },
    totalDeploys: { type: Number, default: 0 },
    lastRunAt: { type: Date }
  },

  // Flags
  flags: {
    isArchived: { type: Boolean, default: false },
    isTemplate: { type: Boolean, default: false }
  }

}, {
  timestamps: true
});

const Project = mongoose.model("Project", projectSchema);
export default Project;
