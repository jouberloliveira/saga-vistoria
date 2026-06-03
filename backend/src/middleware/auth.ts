import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../lib/jwt';
import { prisma, auditContext } from '../lib/prisma';

export interface AuthRequest extends Request {
  user?: { id: string; role: string; nome: string };
}

export async function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token ausente' });
    return;
  }

  const token = header.slice(7);
  try {
    const payload = verifyToken(token);
    const funcionario = await prisma.funcionario.findUnique({
      where: { id: payload.sub },
      select: { id: true, role: true, nome: true, ativo: true },
    });

    if (!funcionario || !funcionario.ativo) {
      res.status(401).json({ error: 'Usuário inativo ou não encontrado' });
      return;
    }

    req.user = { id: funcionario.id, role: funcionario.role, nome: funcionario.nome };

    // Run the rest of the request inside the audit context so middleware can attribute actions
    auditContext.run({ funcionarioId: funcionario.id }, () => next());
  } catch {
    res.status(401).json({ error: 'Token inválido ou expirado' });
  }
}

export function requireAdmin(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void {
  if (req.user?.role !== 'admin') {
    res.status(403).json({ error: 'Acesso restrito a administradores' });
    return;
  }
  next();
}
