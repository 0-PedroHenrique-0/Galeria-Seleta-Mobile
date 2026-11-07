import { randomBytes, randomUUID, scryptSync, createHmac, timingSafeEqual } from 'node:crypto';
import { db } from './db.js';

const secret = process.env.AUTH_SECRET;
if (!secret || secret.length < 32) throw new Error('Configure AUTH_SECRET com pelo menos 32 caracteres.');
const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();

function sign(value) { return createHmac('sha256', secret).update(value).digest('base64url'); }
function hashPassword(password, salt = randomBytes(16).toString('hex')) {
  return `${salt}:${scryptSync(password, salt, 64).toString('hex')}`;
}
function verifyPassword(password, stored) {
  const [salt, hash] = stored.split(':');
  const actual = Buffer.from(hash, 'hex');
  const received = scryptSync(password, salt, actual.length);
  return actual.length === received.length && timingSafeEqual(actual, received);
}
function tokenFor(userId) {
  const payload = Buffer.from(JSON.stringify({ sub: userId, exp: Date.now() + 30 * 24 * 60 * 60 * 1000 })).toString('base64url');
  return `${payload}.${sign(payload)}`;
}
export function publicUser(row) {
  return { id: row.id, name: row.name, email: row.email, phone: row.phone ?? '', isAdmin: row.is_admin === 1 };
}

export function register(req, res) {
  const name = String(req.body?.name ?? '').trim();
  const email = String(req.body?.email ?? '').trim().toLowerCase();
  const password = String(req.body?.password ?? '');
  if (name.length < 2 || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || password.length < 8) {
    return res.status(400).json({ message: 'Informe nome, e-mail e senha de pelo menos 8 caracteres.' });
  }
  if (adminEmail && email === adminEmail) return res.status(403).json({ message: 'Este e-mail é reservado à administração.' });
  if (db.prepare('SELECT 1 FROM users WHERE email = ?').get(email)) return res.status(409).json({ message: 'E-mail já cadastrado.' });
  const id = randomUUID();
  db.prepare('INSERT INTO users (id, name, email, password_hash, created_at) VALUES (?, ?, ?, ?, ?)')
    .run(id, name, email, hashPassword(password), new Date().toISOString());
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  return res.status(201).json({ token: tokenFor(id), user: publicUser(user) });
}

if (adminEmail && process.env.ADMIN_PASSWORD && !db.prepare('SELECT 1 FROM users WHERE email = ?').get(adminEmail)) {
  if (process.env.ADMIN_PASSWORD.length < 12) throw new Error('ADMIN_PASSWORD precisa ter pelo menos 12 caracteres.');
  db.prepare('INSERT INTO users (id, name, email, password_hash, is_admin, created_at) VALUES (?, ?, ?, ?, 1, ?)')
    .run(randomUUID(), 'Administrador', adminEmail, hashPassword(process.env.ADMIN_PASSWORD), new Date().toISOString());
}

export function login(req, res) {
  const email = String(req.body?.email ?? '').trim().toLowerCase();
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || !verifyPassword(String(req.body?.password ?? ''), user.password_hash)) {
    return res.status(401).json({ message: 'E-mail ou senha inválidos.' });
  }
  return res.json({ token: tokenFor(user.id), user: publicUser(user) });
}

export function requireUser(req, res, next) {
  const token = /^Bearer (.+)$/i.exec(req.headers.authorization ?? '')?.[1];
  const [payload, signature] = token?.split('.') ?? [];
  if (!payload || !signature) return res.status(401).json({ message: 'Entre na sua conta para continuar.' });
  const expected = Buffer.from(sign(payload));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return res.status(401).json({ message: 'Sessão inválida.' });
  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString());
    if (parsed.exp < Date.now()) return res.status(401).json({ message: 'Sessão expirada.' });
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(parsed.sub);
    if (!user) return res.status(401).json({ message: 'Sessão inválida.' });
    req.user = publicUser(user);
    next();
  } catch {
    return res.status(401).json({ message: 'Sessão inválida.' });
  }
}

export function requireAdmin(req, res, next) {
  if (!req.user.isAdmin) return res.status(403).json({ message: 'Acesso restrito.' });
  next();
}
