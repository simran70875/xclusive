export interface User {
  _id: string,
  type: string,
  userId: string,
  password: string,
  email: string,
  phone: string,
  firstName: string,
  lastName: string,
  address: string,
  city: string,
  company: string,
  postcode?: string,
  isActive: any
}

export interface UserQuery {
  _id: string,
  type: string,
  userId: string,
  password: string,
  email: string,
  phone: number,
  firstName: string,
  lastName: string,
  address: string,
  city: string,
  company: string,
  message: string,
  document: string,
  createdAt: string,
}



export interface AuthState {
  adminUser: User | null
  adminToken: string | null
}