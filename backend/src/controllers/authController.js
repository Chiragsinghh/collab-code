import { registerUser, loginUser, generateToken } from '../services/authService.js';

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