import Project from '../models/Project.js';
import User from '../models/User.js';
import { v4 as uuidv4 } from 'uuid';

export const createProject = async ({ name, ownerId }) => {
    const roomId = uuidv4();

    const project = await Project.create({
        name,
        roomId,
        owner: ownerId,
        members: [ownerId],
        tree: [] // Start empty array (was object)
    });

    // Add project to user's projects list
    await User.findByIdAndUpdate(ownerId, {
        $addToSet: { projects: project._id }
    });

    return project;
};

export const getProjectByRoomId = async (roomId) => {
    return await Project.findOne({ roomId }).populate('owner', 'username email avatar').populate('members', 'username email avatar');
};

export const getUserProjects = async (userId) => {
    const user = await User.findById(userId).populate({
        path: 'projects',
        options: { sort: { updatedAt: -1 } }
    });
    return user ? user.projects : [];
};

export const updateProjectTree = async (roomId, tree) => {
    return await Project.findOneAndUpdate(
        { roomId },
        { tree, updatedAt: Date.now() },
        { new: true }
    );
};

export const deleteProject = async (roomId, userId) => {
    const project = await Project.findOne({ roomId });

    if (!project) throw new Error('Project not found');
    if (project.owner.toString() !== userId.toString()) throw new Error('Not authorized');

    await Project.deleteOne({ _id: project._id });

    // Remove from all members' lists
    await User.updateMany(
        { projects: project._id },
        { $pull: { projects: project._id } }
    );

    return true;
};

export const addMemberToProject = async (projectId, userId) => {
    // Add member to Project
    await Project.findByIdAndUpdate(projectId, {
        $addToSet: { members: userId }
    });

    // Add project to User
    await User.findByIdAndUpdate(userId, {
        $addToSet: { projects: projectId }
    });
};
