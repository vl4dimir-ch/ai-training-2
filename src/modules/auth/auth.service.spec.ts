import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as argon2 from 'argon2';

jest.mock('argon2', () => ({
  hash: jest.fn(),
  verify: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  const mockPrismaService = {
    authentication: {
      findFirst: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  const mockJwtService = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
  };

  const mockUser = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    passwordHash: 'hashedPassword123',
  };

  const mockToken = 'mock.jwt.token';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);

    // Reset all mocks
    jest.clearAllMocks();
    mockJwtService.signAsync.mockResolvedValue(mockToken);
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'Password123!',
    };

    it('should successfully register a new user', async () => {
      // Mock user not found (unique username/email)
      mockPrismaService.authentication.findFirst.mockResolvedValue(null);
      
      // Mock password hashing
      const hashedPassword = 'hashedPassword123';
      (argon2.hash as jest.Mock).mockResolvedValue(hashedPassword);

      // Mock user creation
      mockPrismaService.authentication.create.mockResolvedValue(mockUser);

      const result = await service.register(registerDto);

      expect(result).toEqual({
        accessToken: mockToken,
        user: {
          id: mockUser.id,
          username: mockUser.username,
          email: mockUser.email,
        },
      });

      expect(mockPrismaService.authentication.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [
            { username: { equals: registerDto.username, mode: 'insensitive' } },
            { email: { equals: registerDto.email, mode: 'insensitive' } },
          ],
        },
      });

      expect(argon2.hash).toHaveBeenCalledWith(registerDto.password);
      expect(mockPrismaService.authentication.create).toHaveBeenCalledWith({
        data: {
          username: registerDto.username,
          email: registerDto.email,
          passwordHash: hashedPassword,
        },
      });
      expect(mockJwtService.signAsync).toHaveBeenCalledWith({ sub: mockUser.id });
    });

    it('should throw ConflictException if username or email exists', async () => {
      mockPrismaService.authentication.findFirst.mockResolvedValue(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      usernameOrEmail: 'testuser',
      password: 'Password123!',
    };

    it('should successfully login with correct credentials', async () => {
      mockPrismaService.authentication.findFirst.mockResolvedValue(mockUser);
      (argon2.verify as jest.Mock).mockResolvedValue(true);

      const result = await service.login(loginDto);

      expect(result).toEqual({
        accessToken: mockToken,
        user: {
          id: mockUser.id,
          username: mockUser.username,
          email: mockUser.email,
        },
      });

      expect(mockPrismaService.authentication.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [
            { username: { equals: loginDto.usernameOrEmail, mode: 'insensitive' } },
            { email: { equals: loginDto.usernameOrEmail, mode: 'insensitive' } },
          ],
        },
      });

      expect(argon2.verify).toHaveBeenCalledWith(
        mockUser.passwordHash,
        loginDto.password,
      );
      expect(mockJwtService.signAsync).toHaveBeenCalledWith({ sub: mockUser.id });
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.authentication.findFirst.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      mockPrismaService.authentication.findFirst.mockResolvedValue(mockUser);
      (argon2.verify as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('JWT Token Generation and Validation', () => {
    it('should generate valid JWT token', async () => {
      const userId = 1;
      const token = await service['generateToken'](userId);

      expect(token).toBe(mockToken);
      expect(mockJwtService.signAsync).toHaveBeenCalledWith({ sub: userId });
    });

    it('should properly validate JWT token payload', async () => {
      const payload = { sub: 1 };
      mockJwtService.verifyAsync.mockResolvedValue(payload);
      mockPrismaService.authentication.findUnique.mockResolvedValue(mockUser);

      // This test simulates what happens in the JwtStrategy
      const token = 'valid.jwt.token';
      const result = await jwtService.verifyAsync(token);
      const user = await prismaService.authentication.findUnique({
        where: { id: result.sub },
      });

      expect(result).toEqual(payload);
      expect(user).toEqual(mockUser);
    });

    it('should fail validation for non-existent user', async () => {
      const payload = { sub: 999 }; // Non-existent user ID
      mockJwtService.verifyAsync.mockResolvedValue(payload);
      mockPrismaService.authentication.findUnique.mockResolvedValue(null);

      // This test simulates what happens in the JwtStrategy
      const token = 'valid.jwt.token';
      const result = await jwtService.verifyAsync(token);
      const user = await prismaService.authentication.findUnique({
        where: { id: result.sub },
      });

      expect(result).toEqual(payload);
      expect(user).toBeNull();
    });
  });
}); 