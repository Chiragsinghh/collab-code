import mongoose from "mongoose";

const collabSessionSchema = new mongoose.Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        index: true
    },
    roomId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },

    activeUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],

    startedAt: { type: Date, default: Date.now },
    lastHeartbeatAt: { type: Date, default: Date.now }
}, {
    timestamps: true
});

// Auto-expire after 1 hour (3600s) of inactivity if needed, or manage via socket
collabSessionSchema.index({ lastHeartbeatAt: 1 }, { expireAfterSeconds: 3600 });

const CollaborationSession = mongoose.model("CollaborationSession", collabSessionSchema);
export default CollaborationSession;
