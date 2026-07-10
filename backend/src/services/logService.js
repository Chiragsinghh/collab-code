import ActivityLog from '../models/ActivityLog.js';

export const logActivity = async (userId, action, details = {}) => {
    try {
        await ActivityLog.create({
            userId,
            action,
            details
        });
    } catch (error) {
        console.error("Logging failed:", error);
    }
};
