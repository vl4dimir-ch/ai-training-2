import { Injectable, UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto, AuthResponse } from './dto/auth.dto';
import * as argon2 from 'argon2';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) { }

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { username: { equals: registerDto.username, mode: 'insensitive' } },
          { email: { equals: registerDto.email, mode: 'insensitive' } }
        ]
      }
    });

    if (existingUser) {
      throw new ConflictException('Username or email already exists');
    }

    const hashedPassword = await argon2.hash(registerDto.password);

    const auth = await this.prisma.authentication.create({
      data: {
        username: registerDto.username,
        email: registerDto.email,
        passwordHash: hashedPassword,
      },
    });

    const token = await this.generateToken(auth.id);

    return {
      accessToken: token,
      user: {
        id: auth.id,
        username: auth.username,
        email: auth.email
      }
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const auth = await this.prisma.authentication.findFirst({
      where: {
        OR: [
          { username: { equals: loginDto.usernameOrEmail, mode: 'insensitive' } },
          { email: { equals: loginDto.usernameOrEmail, mode: 'insensitive' } }
        ]
      }
    });

    if (!auth) {
      throw new NotFoundException('User with given username or email is not found');
    }

    const isPasswordValid = await argon2.verify(auth.passwordHash, loginDto.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = await this.generateToken(auth.id);

    return {
      accessToken: token,
      user: {
        id: auth.id,
        username: auth.username,
        email: auth.email
      }
    };
  }

  private async generateToken(userId: number): Promise<string> {
    const payload = { sub: userId };
    return this.jwtService.signAsync(payload);
  }
}
