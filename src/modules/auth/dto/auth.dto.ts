import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ 
    example: 'john_doe',
    description: 'The username for the new account'
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ 
    example: 'john@example.com',
    description: 'The email address for the new account'
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ 
    example: 'password123',
    description: 'The password for the new account (minimum 8 characters)'
  })
  @IsString()
  @MinLength(8)
  password: string;
}

export class LoginDto {
  @ApiProperty({ 
    example: 'john_doe',
    description: 'Username or email address'
  })
  @IsNotEmpty()
  @IsString()
  usernameOrEmail: string;

  @ApiProperty({ 
    example: 'password123',
    description: 'Account password (minimum 8 characters)'
  })
  @IsString()
  @MinLength(8)
  password: string;
} 