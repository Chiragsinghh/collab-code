import { unzipSync, strFromU8 } from 'fflate';
import { v4 as uuidv4 } from 'uuid';
import Project from '../models/Project.js';
import User from '../models/User.js';

const GITHUB_HEADERS = {
  Accept: 'application/vnd.github.v3+json',
  'User-Agent': 'CodeSync',
};

const BINARY_EXTENSIONS = new Set([
  'png', 'jpg', 'jpeg', 'gif', 'webp', 'ico', 'svg',
  'woff', 'woff2', 'ttf', 'eot', 'pdf', 'zip', 'gz',
  'exe', 'dll', 'so', 'dylib', 'mp3', 'mp4', 'avi',
  'mov', 'bin', 'class', 'pyc', 'o', 'a',
]);

const MAX_IMPORT_FILES = 2000;

const parseRepoUrl = (repoUrl) => {
  const trimmed = repoUrl.trim().replace(/\/$/, '');
  const match = trimmed.match(
    /github\.com\/([^/]+)\/([^/]+?)(?:\.git)?(?:\/tree\/([^/]+))?$/i
  );

  if (!match) {
    throw new Error('Invalid GitHub repository URL');
  }

  const owner = match[1];
  const repo = match[2].replace(/\.git$/, '');
  const branch = match[3] || null;

  return { owner, repo, branch };
};

const isTextFile = (filename) => {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  return !BINARY_EXTENSIONS.has(ext);
};

const githubFetch = async (url) => {
  const response = await fetch(url, { headers: GITHUB_HEADERS });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || `GitHub API error (${response.status})`);
  }
  return response.json();
};

const buildTreeFromPaths = (files) => {
  const root = [];

  const ensureFolder = (children, name) => {
    let folder = children.find((n) => n.type === 'folder' && n.name === name);
    if (!folder) {
      folder = {
        id: uuidv4(),
        name,
        type: 'folder',
        children: [],
      };
      children.push(folder);
    }
    return folder;
  };

  for (const { path, content } of files) {
    const parts = path.split('/').filter(Boolean);
    if (parts.length === 0) continue;

    let current = root;
    for (let i = 0; i < parts.length - 1; i++) {
      const folder = ensureFolder(current, parts[i]);
      current = folder.children;
    }

    const fileName = parts[parts.length - 1];
    const existingIdx = current.findIndex(
      (n) => n.type === 'file' && n.name === fileName
    );
    const fileNode = {
      id: uuidv4(),
      name: fileName,
      type: 'file',
      content: content || '',
    };

    if (existingIdx >= 0) {
      current[existingIdx] = fileNode;
    } else {
      current.push(fileNode);
    }
  }

  return root;
};

const extractFilesFromZip = (zipBuffer) => {
  let unzipped;
  try {
    unzipped = unzipSync(new Uint8Array(zipBuffer));
  } catch (err) {
    throw new Error(`Failed to extract repository archive: ${err.message}`);
  }

  const paths = Object.keys(unzipped).filter((p) => !p.endsWith('/'));
  if (paths.length === 0) {
    throw new Error('Repository archive is empty');
  }

  const rootPrefix = `${paths[0].split('/')[0]}/`;
  const files = [];

  for (const [path, data] of Object.entries(unzipped)) {
    if (path.endsWith('/')) continue;

    const relativePath = path.startsWith(rootPrefix)
      ? path.slice(rootPrefix.length)
      : path;

    if (!relativePath || relativePath.startsWith('.git/')) continue;
    if (!isTextFile(relativePath)) continue;

    try {
      const content = strFromU8(data);
      files.push({ path: relativePath, content });
    } catch {
      // Skip files that can't be decoded as UTF-8
    }
  }

  return files;
};

const fetchRepoViaGitHubApi = async (owner, repo, ref) => {
  const branch = await githubFetch(
    `https://api.github.com/repos/${owner}/${repo}/branches/${encodeURIComponent(ref)}`
  );

  const treeData = await githubFetch(
    `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch.commit.commit.tree.sha}?recursive=1`
  );

  if (treeData.truncated) {
    throw new Error('Repository is too large to import in a single request');
  }

  const blobs = treeData.tree.filter(
    (item) => item.type === 'blob' && isTextFile(item.path)
  );

  if (blobs.length > MAX_IMPORT_FILES) {
    throw new Error(
      `Repository has ${blobs.length} text files; maximum supported is ${MAX_IMPORT_FILES}`
    );
  }

  const files = [];
  const batchSize = 15;

  for (let i = 0; i < blobs.length; i += batchSize) {
    const batch = blobs.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(async (item) => {
        const blob = await githubFetch(
          `https://api.github.com/repos/${owner}/${repo}/git/blobs/${item.sha}`
        );
        const content = Buffer.from(blob.content, 'base64').toString('utf8');
        return { path: item.path, content };
      })
    );
    files.push(...batchResults);
  }

  return files;
};

export const getRepos = async (token) => {
  const response = await fetch('https://api.github.com/user/repos', {
    headers: {
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github.v3+json',
    },
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
      Accept: 'application/vnd.github.v3+json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch repo contents');
  }

  return await response.json();
};

export const importRepoFromUrl = async (repoUrl, userId) => {
  const { owner, repo, branch } = parseRepoUrl(repoUrl);

  const repoMeta = await githubFetch(`https://api.github.com/repos/${owner}/${repo}`);
  const ref = branch || repoMeta.default_branch || 'main';

  let files = [];

  try {
    const zipResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/zipball/${ref}`,
      { headers: GITHUB_HEADERS }
    );

    if (!zipResponse.ok) {
      throw new Error('Failed to download repository archive');
    }

    const zipBuffer = Buffer.from(await zipResponse.arrayBuffer());
    files = extractFilesFromZip(zipBuffer);
  } catch (zipError) {
    console.warn(`Zip import failed for ${owner}/${repo}, using GitHub API:`, zipError.message);
    files = await fetchRepoViaGitHubApi(owner, repo, ref);
  }

  if (files.length === 0) {
    throw new Error('No importable text files found in repository');
  }

  const tree = buildTreeFromPaths(files);
  const roomId = uuidv4();

  const project = await Project.create({
    name: repoMeta.name || repo,
    roomId,
    owner: userId,
    members: [userId],
    tree,
    github: {
      repoUrl: repoMeta.html_url,
      repoId: String(repoMeta.id),
      defaultBranch: ref,
      lastSyncAt: new Date(),
    },
  });

  await User.findByIdAndUpdate(userId, {
    $addToSet: { projects: project._id },
  });

  return project;
};
