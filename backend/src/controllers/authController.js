import { registerUser, loginUser, generateToken, oauthLoginOrCreate, verifyGoogleToken, exchangeGoogleCode, exchangeGitHubCode } from '../services/authService.js';

export const signup = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const user = await registerUser({ username, email, password });

        res.status(201).json({
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                name: user.name || "",
                bio: user.bio || "",
                projectsDoneCount: user.projectsDoneCount || 0,
                socialLinks: user.socialLinks || { github: "", twitter: "", linkedin: "", website: "" },
                preferences: user.preferences
            },
            token: generateToken(user._id),
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await loginUser({ email, password });

        res.json({
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                name: user.name || "",
                bio: user.bio || "",
                projectsDoneCount: user.projectsDoneCount || 0,
                socialLinks: user.socialLinks || { github: "", twitter: "", linkedin: "", website: "" },
                preferences: user.preferences
            },
            token: generateToken(user._id),
        });
    } catch (error) {
        res.status(401).json({ message: error.message });
    }
};

export const getUser = async (req, res) => {
    try {
        const user = req.user;
        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            name: user.name || "",
            bio: user.bio || "",
            projectsDoneCount: user.projectsDoneCount || 0,
            socialLinks: user.socialLinks || { github: "", twitter: "", linkedin: "", website: "" },
            preferences: user.preferences,
            lastActive: user.lastActive
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export const oauthLogin = async (req, res) => {
    try {
        const { provider, email, name, avatarUrl, providerId } = req.body;

        if (!['google', 'github'].includes(provider)) {
            return res.status(400).json({ message: 'Invalid OAuth provider' });
        }

        const { user, token } = await oauthLoginOrCreate({
            provider,
            email,
            name,
            avatarUrl,
            providerId,
        });

        res.json({ user, token });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const user = req.user; // populated by protect middleware
        
        const { name, bio, projectsDoneCount, socialLinks, preferences } = req.body;
        
        if (name !== undefined) user.name = name;
        if (bio !== undefined) user.bio = bio;
        if (projectsDoneCount !== undefined) user.projectsDoneCount = Number(projectsDoneCount) || 0;
        
        if (socialLinks) {
            user.socialLinks = {
                github: socialLinks.github !== undefined ? socialLinks.github : (user.socialLinks?.github || ""),
                twitter: socialLinks.twitter !== undefined ? socialLinks.twitter : (user.socialLinks?.twitter || ""),
                linkedin: socialLinks.linkedin !== undefined ? socialLinks.linkedin : (user.socialLinks?.linkedin || ""),
                website: socialLinks.website !== undefined ? socialLinks.website : (user.socialLinks?.website || "")
            };
        }
        
        if (preferences) {
            user.preferences = {
                theme: preferences.theme !== undefined ? preferences.theme : user.preferences.theme,
                editorFontSize: preferences.editorFontSize !== undefined ? Number(preferences.editorFontSize) : user.preferences.editorFontSize,
                tabSize: preferences.tabSize !== undefined ? Number(preferences.tabSize) : user.preferences.tabSize,
                keymap: preferences.keymap !== undefined ? preferences.keymap : user.preferences.keymap
            };
        }
        
        await user.save();
        
        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            name: user.name || "",
            bio: user.bio || "",
            projectsDoneCount: user.projectsDoneCount || 0,
            socialLinks: user.socialLinks || { github: "", twitter: "", linkedin: "", website: "" },
            preferences: user.preferences,
            lastActive: user.lastActive
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getAuthConfig = async (req, res) => {
    try {
        res.json({
            googleClientId: process.env.GOOGLE_CLIENT_ID || "",
            githubClientId: process.env.GITHUB_CLIENT_ID || "",
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const googleLogin = async (req, res) => {
    try {
        const { idToken, code } = req.body;
        if (!idToken && !code) {
            return res.status(400).json({ message: 'idToken or code is required' });
        }
        
        let googleProfile;
        if (code) {
            googleProfile = await exchangeGoogleCode(code);
        } else {
            googleProfile = await verifyGoogleToken(idToken);
        }

        const { user, token } = await oauthLoginOrCreate({
            provider: 'google',
            email: googleProfile.email,
            name: googleProfile.name,
            avatarUrl: googleProfile.avatarUrl,
            providerId: googleProfile.providerId,
        });
        
        res.json({ user, token });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const githubLogin = async (req, res) => {
    try {
        const { code } = req.body;
        if (!code) {
            return res.status(400).json({ message: 'code is required' });
        }
        
        const githubProfile = await exchangeGitHubCode(code);
        const { user, token } = await oauthLoginOrCreate({
            provider: 'github',
            email: githubProfile.email,
            name: githubProfile.name,
            avatarUrl: githubProfile.avatarUrl,
            providerId: githubProfile.providerId,
            githubUsername: githubProfile.githubUsername,
            githubToken: githubProfile.accessToken,
        });
        
        res.json({ user, token });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};