import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const dataDir = path.join(process.cwd(), 'data');
const usersPath = path.join(dataDir, 'users.json');
const itemsPath = path.join(dataDir, 'items.json');
const SECRET_KEY = 'dispensary-nextjs-secret-key-2026';

function ensureFiles() {
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
    if (!fs.existsSync(usersPath)) {
        fs.writeFileSync(usersPath, '[]', 'utf8');
    }
    if (!fs.existsSync(itemsPath)) {
        fs.writeFileSync(itemsPath, '[]', 'utf8');
    }
}

function readJson(filePath) {
    ensureFiles();
    const content = fs.readFileSync(filePath, 'utf8');
    try {
        return JSON.parse(content || '[]');
    } catch {
        return [];
    }
}

function writeJson(filePath, data) {
    ensureFiles();
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

function signToken(payload) {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = crypto
        .createHmac('sha256', SECRET_KEY)
        .update(`${header}.${body}`)
        .digest('base64url');
    return `${header}.${body}.${signature}`;
}

function verifyToken(token) {
    if (!token) return null;
    const [header, body, signature] = token.split('.');
    if (!header || !body || !signature) return null;
    const expected = crypto.createHmac('sha256', SECRET_KEY).update(`${header}.${body}`).digest('base64url');
    if (signature !== expected) return null;
    try {
        return JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    } catch {
        return null;
    }
}

export function getUsers() {
    return readJson(usersPath);
}

export function getItems() {
    return readJson(itemsPath);
}

export function saveUsers(users) {
    writeJson(usersPath, users);
}

export function saveItems(items) {
    writeJson(itemsPath, items);
}

export function findUserByEmail(email) {
    return getUsers().find((user) => user.email === email.toLowerCase());
}

export function createUser(email, password) {
    const users = getUsers();
    const existing = users.find((user) => user.email === email.toLowerCase());
    if (existing) {
        throw new Error('Email already exists');
    }
    const user = {
        id: crypto.randomUUID(),
        email: email.toLowerCase(),
        passwordHash: hashPassword(password)
    };
    users.push(user);
    saveUsers(users);
    return user;
}

export function validateUser(email, password) {
    const user = findUserByEmail(email);
    if (!user) return null;
    if (user.passwordHash !== hashPassword(password)) return null;
    return user;
}

export function createAuthToken(user) {
    const payload = {
        userId: user.id,
        email: user.email,
        exp: Date.now() + 1000 * 60 * 60 * 24 * 7
    };
    return signToken(payload);
}

export function getUserFromToken(token) {
    const payload = verifyToken(token.replace(/^Bearer\s+/, ''));
    if (!payload || payload.exp < Date.now()) {
        return null;
    }
    const user = getUsers().find((userItem) => userItem.id === payload.userId);
    return user || null;
}

export function getItemsForUser(userId) {
    return getItems().filter((item) => item.userId === userId);
}

export function upsertItem(userId, { name, count }) {
    const items = getItems();
    const normalized = name.trim();
    const existingIndex = items.findIndex((item) => item.userId === userId && item.name.toLowerCase() === normalized.toLowerCase());
    if (existingIndex >= 0) {
        items[existingIndex].count = count;
    } else {
        items.push({ id: crypto.randomUUID(), userId, name: normalized, count });
    }
    saveItems(items);
}

export function deleteItem(userId, name) {
    const items = getItems();
    const filtered = items.filter((item) => !(item.userId === userId && item.name.toLowerCase() === name.trim().toLowerCase()));
    saveItems(filtered);
}
