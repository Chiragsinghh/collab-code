import { deployProject } from '../services/deployService.js';

export const deploy = async (req, res) => {
    try {
        const { projectId, files, adapter } = req.body;

        if (!projectId || !files) {
            return res.status(400).json({ message: "Missing projectId or files" });
        }

        const url = await deployProject(projectId, files, adapter);
        res.json({ url, message: `Successfully deployed to ${adapter || 'vercel'}` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
