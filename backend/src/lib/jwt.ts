import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'saga_vistoria_secret_change_me';
const EXPIRES_IN = '8h';

export interface JwtPayload {
  sub: string;
  role: string;
  nome: string;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, SECRET) as JwtPayload;
}
