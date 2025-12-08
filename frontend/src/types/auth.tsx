export interface User {
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
}


export interface AuthState {
  user: User | null
  token: string | null
  userId:  string | null
}