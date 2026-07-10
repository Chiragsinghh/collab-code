export const getRepos = async (token) => {
    const response = await fetch('https://api.github.com/user/repos', {
        headers: {
            Authorization: `token ${token}`,
            Accept: 'application/vnd.github.v3+json'
        }
    });

    if (!response.ok) {
        throw new Error('Failed to fetch repos');
    }

    return await response.json();
};

export const getRepoContents = async (token, owner, repo, path = '') => {
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
    const response = await fetch(url, {
        headers: {
            Authorization: `token ${token}`,
            Accept: 'application/vnd.github.v3+json'
        }
    });

    if (!response.ok) {
        throw new Error('Failed to fetch repo contents');
    }

    return await response.json();
};
