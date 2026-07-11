import * as githubService from '../services/githubService.js';

export const listRepos = async (req, res) => {
    try {
        // Client should send the GitHub token in a custom header or we should have stored it
        // For this implementation, we expect it in 'X-GitHub-Token' header for simplicity
        const token = req.headers['x-github-token'];

        if (!token) {
            return res.status(400).json({ message: "GitHub token required" });
        }

        const repos = await githubService.getRepos(token);
        res.json(repos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const importRepo = async (req, res) => {
    try {
        const { owner, repo } = req.body;
        const token = req.headers['x-github-token'];

        if (!token) return res.status(400).json({ message: "GitHub token required" });

        const contents = await githubService.getRepoContents(token, owner, repo);
        res.json(contents);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const importUrl = async (req, res) => {
    try {
        const { repoUrl } = req.body;

        if (!repoUrl?.trim()) {
            return res.status(400).json({ message: 'Repository URL is required' });
        }

        const project = await githubService.importRepoFromUrl(repoUrl.trim(), req.user._id);

        res.status(201).json({
            roomId: project.roomId,
            name: project.name,
            tree: project.tree,
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
