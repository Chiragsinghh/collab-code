import * as projectService from '../services/projectService.js';

export const create = async (req, res) => {
    try {
        const { name } = req.body;
        const project = await projectService.createProject({
            name,
            ownerId: req.user._id
        });
        res.status(201).json(project);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getProject = async (req, res) => {
    try {
        const project = await projectService.getProjectByRoomId(req.params.roomId);
        if (!project) return res.status(404).json({ message: 'Project not found' });

        if (req.user && req.user._id) {
            await projectService.addMemberToProject(project._id, req.user._id);
        }

        const updatedProject = await projectService.getProjectByRoomId(req.params.roomId);
        res.json(updatedProject);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateTree = async (req, res) => {
    try {
        const { tree } = req.body;
        const project = await projectService.updateProjectTree(req.params.roomId, tree);
        res.json(project);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getMyProjects = async (req, res) => {
    try {
        const projects = await projectService.getUserProjects(req.user._id);
        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const remove = async (req, res) => {
    try {
        await projectService.deleteProject(req.params.roomId, req.user._id);
        res.json({ message: 'Project deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
