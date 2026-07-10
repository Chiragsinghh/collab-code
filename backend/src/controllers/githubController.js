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
        // In a real app, we would recursively fetch the whole tree and convert it to our Project structure
        // This is a simplified version returning the root contents
        res.json(contents);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
