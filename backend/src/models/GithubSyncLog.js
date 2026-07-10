import mongoose from "mongoose";

const githubSyncLogSchema = new mongoose.Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: true,
        index: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    action: {
        type: String,
        enum: ["import", "push", "pull", "commit"],
        required: true
    },

    repo: { type: String },
    branch: { type: String },
    filesChanged: { type: Number },

    status: {
        type: String,
        enum: ["success", "failure"],
        required: true
    },
    message: { type: String }
}, {
    timestamps: true
});

const GithubSyncLog = mongoose.model("GithubSyncLog", githubSyncLogSchema);
export default GithubSyncLog;
