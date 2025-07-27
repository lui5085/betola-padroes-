export interface UserPayload {
  id: string;
  email: string;
  username: string;
  iat?: number;
  exp?: number;
}