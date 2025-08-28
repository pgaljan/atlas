import { Request } from 'express';

interface User {
  id: string;
  email: string;
}

export interface AuthenticatedRequest extends Request {
  user?: User;
}
