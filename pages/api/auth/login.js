import { validateUser, createAuthToken } from '../../../lib/store';

export default function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { email, password } = req.body || {};
    if (!email || !password) {
        return res.status(400).json({ error: 'Missing login credentials' });
    }

    const user = validateUser(email, password);
    if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = createAuthToken(user);
    return res.status(200).json({ token });
}
