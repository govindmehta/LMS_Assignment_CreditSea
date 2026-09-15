import type { Request } from 'express';
import { UserRole } from '../models/User.js';

export interface AuthPayload {
  userId: string;
  role: UserRole;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthPayload;
}