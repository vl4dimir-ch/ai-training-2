import { ApiProperty } from '@nestjs/swagger';
import { UserResponse } from './user.interface';

export class AuthResponse {
  @ApiProperty({ 
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', 
    description: 'JWT access token' 
  })
  accessToken: string;

  @ApiProperty({ 
    type: UserResponse,
    description: 'User information' 
  })
  user: UserResponse;
} 