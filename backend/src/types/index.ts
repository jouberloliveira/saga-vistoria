export interface Employee {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: 'admin' | 'inspector';
  active: number;
  created_at: string;
}

export interface Vehicle {
  id: string;
  plate: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  created_at: string;
}

export interface Inspection {
  id: string;
  vehicle_id: string;
  employee_id: string;
  client_name: string;
  client_cpf: string;
  mileage: number | null;
  notes: string | null;
  status: 'open' | 'signed' | 'cancelled';
  created_at: string;
  signed_at: string | null;
}

export interface InspectionItem {
  id: string;
  inspection_id: string;
  type: string;
  location: string;
  severity: 'low' | 'medium' | 'high';
  notes: string | null;
  created_at: string;
}

export interface Photo {
  id: string;
  inspection_id: string;
  item_id: string | null;
  filename: string;
  original_name: string;
  created_at: string;
}

export interface Signature {
  id: string;
  inspection_id: string;
  type: 'employee' | 'client';
  data: string;
  created_at: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
