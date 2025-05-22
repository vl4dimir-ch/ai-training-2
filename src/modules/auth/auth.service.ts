import { Injectable, UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { AuthResponse } from './interfaces/auth.interface';
import { UserResponse } from './interfaces/user.interface';
import { AUTH_ERRORS } from './constants/auth.constants';
import * as argon2 from 'argon2';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) { }

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    await this.validateUserDoesNotExist(registerDto.username, registerDto.email);
    const hashedPassword = await this.hashPassword(registerDto.password);
    const auth = await this.createUser(registerDto, hashedPassword);
    const token = await this.generateToken(auth.id);
    return this.createAuthResponse(auth, token);
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const auth = await this.findUserByUsernameOrEmail(loginDto.usernameOrEmail);
    await this.validatePassword(auth.passwordHash, loginDto.password);
    const token = await this.generateToken(auth.id);
    return this.createAuthResponse(auth, token);
  }

  private async validateUserDoesNotExist(username: string, email: string): Promise<void> {
    const existingUser = await this.prisma.authentication.findFirst({
      where: {
        OR: [
          { username: { equals: username, mode: 'insensitive' } },
          { email: { equals: email, mode: 'insensitive' } }
        ]
      }
    });

    if (existingUser) {
      throw new ConflictException(AUTH_ERRORS.USER_EXISTS);
    }
  }

  private async hashPassword(password: string): Promise<string> {
    return argon2.hash(password);
  }

  private async createUser(registerDto: RegisterDto, hashedPassword: string) {
    return this.prisma.authentication.create({
      data: {
        username: registerDto.username,
        email: registerDto.email,
        passwordHash: hashedPassword,
      },
    });
  }

  private async findUserByUsernameOrEmail(usernameOrEmail: string) {
    const auth = await this.prisma.authentication.findFirst({
      where: {
        OR: [
          { username: { equals: usernameOrEmail, mode: 'insensitive' } },
          { email: { equals: usernameOrEmail, mode: 'insensitive' } }
        ]
      }
    });

    if (!auth) {
      throw new NotFoundException(AUTH_ERRORS.USER_NOT_FOUND);
    }

    return auth;
  }

  private async validatePassword(hashedPassword: string, password: string): Promise<void> {
    const isPasswordValid = await argon2.verify(hashedPassword, password);
    if (!isPasswordValid) {
      throw new UnauthorizedException(AUTH_ERRORS.INVALID_CREDENTIALS);
    }
  }

  private async generateToken(userId: number): Promise<string> {
    const payload = { sub: userId };
    return this.jwtService.signAsync(payload);
  }

  private createAuthResponse(auth: { id: number; username: string; email: string }, token: string): AuthResponse {
    return {
      accessToken: token,
      user: {
        id: auth.id,
        username: auth.username,
        email: auth.email
      }
    };
  }
}
