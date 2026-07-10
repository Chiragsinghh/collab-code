import mongoose from "mongoose";

const activityEventSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        index: true
    },
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        index: true
    },

    type: {
        type: String,
        enum: ["login", "signup", "project_create", "project_delete", "run", "deploy", "edit", "share", "join_room"],
        required: true
    },

    meta: { type: mongoose.Schema.Types.Mixed } // Flexible metadata
}, {
    timestamps: true
});

// Indexes for common queries
activityEventSchema.index({ userId: 1, createdAt: -1 });
activityEventSchema.index({ projectId: 1, createdAt: -1 });

const ActivityEvent = mongoose.model("ActivityEvent", activityEventSchema);
export default ActivityEvent;
