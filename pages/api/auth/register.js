import { createUser, createAuthToken } from '../../../lib/store';

export default function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { email, password } = req.body || {};
    if (!email || !password || password.length < 6) {
        return res.status(400).json({ error: 'Please provide valid credentials and password length >= 6' });
    }

    try {
        const user = createUser(email, password);
        const token = createAuthToken(user);
        return res.status(201).json({ token });
    } catch (error) {
        return res.status(400).json({ error: error.message || 'Unable to create account' });
    }
}
