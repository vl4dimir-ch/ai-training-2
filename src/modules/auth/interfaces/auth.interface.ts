import { UserResponse } from './user.interface';

export interface AuthResponse {
  accessToken: string;
  user: UserResponse;
} 