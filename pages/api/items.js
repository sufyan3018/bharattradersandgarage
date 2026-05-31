import { getUserFromToken, getItemsForUser, upsertItem, deleteItem } from '../../lib/store';

export default function handler(req, res) {
    const token = req.headers.authorization || '';
    const user = getUserFromToken(token);
    if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    if (req.method === 'GET') {
        return res.status(200).json({ items: getItemsForUser(user.id) });
    }

    if (req.method === 'POST') {
        const { name, count } = req.body || {};
        if (!name || typeof count !== 'number' || count < 0) {
            return res.status(400).json({ error: 'Invalid item payload' });
        }
        upsertItem(user.id, { name, count });
        return res.status(200).json({ success: true });
    }

    if (req.method === 'DELETE') {
        const { name } = req.body || {};
        if (!name) {
            return res.status(400).json({ error: 'Missing item name' });
        }
        deleteItem(user.id, name);
        return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
