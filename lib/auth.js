import { jwtVerify, SignJWT } from 'jose';
import { cookies } from 'next/headers';
import { dbGet } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-for-dev';
const secretKey = new TextEncoder().encode(JWT_SECRET);

export async function signToken(payload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(secretKey);
}

export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload;
  } catch (err) {
    return null;
  }
}

export async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;

  if (!token) {
    return null;
  }

  const decoded = await verifyToken(token);
  if (!decoded || !decoded.userId) {
    return null;
  }

  const user = await dbGet('SELECT id, email, full_name, role, avatar_url FROM users WHERE id = ?', [decoded.userId]);
  
  return user || null;
}
