import mongoose from "mongoose";

const projectChatMessageSchema = new mongoose.Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        index: true
    },
    roomId: {
        type: String,
        required: true,
        index: true
    },

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    username: { type: String, required: true },
    avatarUrl: { type: String },

    message: { type: String, required: true },
    type: {
        type: String,
        enum: ["text", "system", "join", "leave"],
        default: "text"
    },

    mentions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }]
}, {
    timestamps: true
});

// Compound index for chat history
projectChatMessageSchema.index({ roomId: 1, createdAt: 1 });

const ProjectChatMessage = mongoose.model("ProjectChatMessage", projectChatMessageSchema);
export default ProjectChatMessage;
