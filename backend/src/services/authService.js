import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { encrypt } from '../utils/crypto.js';

export const registerUser = async ({ username, email, password }) => {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new Error('User already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
        username,
        email,
        passwordHash: hashedPassword,
    });

    return user;
};

export const loginUser = async ({ email, password }) => {
    // Select passwordHash explicitly
    const user = await User.findOne({ email }).select('+passwordHash');

    if (!user) {
        throw new Error('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
        throw new Error('Invalid credentials');
    }

    // Update lastActive
    user.lastActive = Date.now();
    await user.save();

    return user;
};

export const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

const formatUserResponse = (user) => ({
    _id: user._id,
    username: user.username,
    email: user.email,
    name: user.name || '',
    bio: user.bio || '',
    projectsDoneCount: user.projectsDoneCount || 0,
    socialLinks: user.socialLinks || { github: '', twitter: '', linkedin: '', website: '' },
    preferences: user.preferences,
});

export const verifyGoogleToken = async (idToken) => {
    const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
    if (!response.ok) {
        throw new Error('Invalid Google token');
    }
    const payload = await response.json();
    
    // Validate client ID if configured
    if (process.env.GOOGLE_CLIENT_ID && payload.aud !== process.env.GOOGLE_CLIENT_ID) {
        throw new Error('Google token client ID mismatch');
    }
    
    return {
        email: payload.email,
        name: payload.name,
        avatarUrl: payload.picture,
        providerId: payload.sub,
    };
};

export const exchangeGoogleCode = async (code) => {
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            code,
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            redirect_uri: 'http://localhost:5173/login',
            grant_type: 'authorization_code',
        }),
    });

    if (!tokenResponse.ok) {
        const errData = await tokenResponse.json();
        throw new Error(errData.error_description || 'Failed to exchange Google authorization code');
    }

    const tokenData = await tokenResponse.json();
    const idToken = tokenData.id_token;
    
    return verifyGoogleToken(idToken);
};

export const exchangeGitHubCode = async (code) => {
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
        body: JSON.stringify({
            client_id: process.env.GITHUB_CLIENT_ID,
            client_secret: process.env.GITHUB_CLIENT_SECRET,
            code,
            redirect_uri: process.env.GITHUB_REDIRECT_URI,
        }),
    });

    if (!tokenResponse.ok) {
        throw new Error('Failed to exchange GitHub authorization code');
    }

    const tokenData = await tokenResponse.json();
    if (tokenData.error) {
        throw new Error(tokenData.error_description || tokenData.error);
    }

    const accessToken = tokenData.access_token;

    // Fetch user profile
    const userResponse = await fetch('https://api.github.com/user', {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/vnd.github.v3+json',
            'User-Agent': 'CodeSync-OAuth'
        },
    });

    if (!userResponse.ok) {
        throw new Error('Failed to retrieve GitHub user profile');
    }

    const githubUser = await userResponse.json();

    // Fetch user emails
    let email = githubUser.email;
    if (!email) {
        const emailResponse = await fetch('https://api.github.com/user/emails', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: 'application/vnd.github.v3+json',
                'User-Agent': 'CodeSync-OAuth'
            },
        });
        if (emailResponse.ok) {
            const emails = await emailResponse.json();
            const primaryEmail = emails.find(e => e.primary && e.verified);
            if (primaryEmail) {
                email = primaryEmail.email;
            } else if (emails.length > 0) {
                email = emails[0].email;
            }
        }
    }

    if (!email) {
        email = `${githubUser.login || 'user'}@github.com`;
    }

    return {
        email,
        name: githubUser.name || githubUser.login,
        avatarUrl: githubUser.avatar_url,
        providerId: String(githubUser.id),
        githubUsername: githubUser.login,
        accessToken,
    };
};

export const oauthLoginOrCreate = async ({ provider, email, name, avatarUrl, providerId, githubUsername, githubToken }) => {
    if (!provider || !email) {
        throw new Error('Provider and email are required');
    }

    const normalizedEmail = email.toLowerCase().trim();
    let user = await User.findOne({ email: normalizedEmail });

    if (!user && providerId) {
        const providerField = provider === 'github' ? 'githubId' : null;
        if (providerField) {
            user = await User.findOne({ [providerField]: providerId });
        }
    }

    if (!user) {
        const baseUsername = (githubUsername || name || email.split('@')[0])
            .replace(/[^a-zA-Z0-9_]/g, '')
            .slice(0, 20) || 'user';
        let username = baseUsername;
        let suffix = 1;

        while (await User.findOne({ username })) {
            username = `${baseUsername}${suffix}`;
            suffix += 1;
        }

        const salt = await bcrypt.genSalt(10);
        const randomPassword = await bcrypt.hash(
            `${provider}-${providerId || normalizedEmail}-${Date.now()}`,
            salt
        );

        const userData = {
            username,
            email: normalizedEmail,
            passwordHash: randomPassword,
            name: name || username,
            avatarUrl: avatarUrl || undefined,
            isEmailVerified: true,
            lastLoginAt: Date.now(),
        };

        if (provider === 'github' && providerId) {
            userData.githubId = providerId;
            userData.githubUsername = githubUsername || name || username;
            userData.socialLinks = { github: `https://github.com/${githubUsername || name || username}` };
            if (githubToken) {
                userData.githubAccessTokenEncrypted = encrypt(githubToken);
            }
        }

        user = await User.create(userData);
    } else {
        user.lastLoginAt = Date.now();
        if (name && !user.name) user.name = name;
        if (avatarUrl) user.avatarUrl = avatarUrl;
        if (provider === 'github' && providerId && !user.githubId) {
            user.githubId = providerId;
            user.githubUsername = githubUsername || name || user.username;
        }
        if (provider === 'github' && githubToken) {
            user.githubAccessTokenEncrypted = encrypt(githubToken);
        }
        await user.save();
    }

    return { user: formatUserResponse(user), token: generateToken(user._id) };
};
