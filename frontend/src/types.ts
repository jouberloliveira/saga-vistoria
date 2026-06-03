export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'inspector'
}

export interface Employee {
  id: string
  name: string
  email: string
  role: 'admin' | 'inspector'
  active: 0 | 1
  created_at: string
}

export interface Vehicle {
  id: string
  plate: string
  brand: string
  model: string
  year: number
  color: string
  created_at: string
}

export interface InspectionItem {
  id: string
  inspection_id: string
  type: string
  location: string
  severity: 'low' | 'medium' | 'high'
  notes?: string
  created_at: string
}

export interface Photo {
  id: string
  inspection_id: string
  item_id?: string
  filename: string
  original_name: string
  created_at: string
}

export interface Signature {
  id: string
  type: 'employee' | 'client'
  created_at: string
}

export interface Inspection {
  id: string
  vehicle_id: string
  employee_id: string
  client_name: string
  client_cpf: string
  mileage?: number
  notes?: string
  status: 'open' | 'signed'
  signed_at?: string
  created_at: string
  plate?: string
  brand?: string
  model?: string
  year?: number
  color?: string
  employee_name?: string
  employee_email?: string
  items?: InspectionItem[]
  photos?: Photo[]
  signatures?: Signature[]
}
