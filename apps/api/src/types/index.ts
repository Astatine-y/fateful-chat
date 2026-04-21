import type { Request } from 'express';

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
  gender?: 'male' | 'female';
}

export interface AuthRequest<T = any> extends Request {
  user?: AuthPayload;
  body: T;
}

export interface PaymentIntentRequest {
  amount: number;
}

