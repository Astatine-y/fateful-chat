// apps/api/src/types/index.ts
export interface AuthPayload {
  id: string;
  email: string;
  iat: number;
}

export interface UserCredentials {
  email: string;
  password: string;
}

export interface BaziRequest {
  year: number;
  month: number;
  day: number;
  hour: number;
  longitude: number;
  latitude: number;
}

export interface AuthRequest extends Express.Request {
  user?: AuthPayload;
}

export interface PaymentIntentRequest {
  amount: number;
}
