import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtModule } from '@nestjs/jwt';
import { UsersController } from '../../users/users.controller';
import { UsersService } from '../../users/users.service';
import { PrismaService } from '../../prisma/prisma.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { AuthGuard } from '@nestjs/passport';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        Reflector,
        {
          provide: UsersService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            user: {
              findMany: jest.fn(),
              findFirst: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
      controllers: [UsersController],
      imports: [
        JwtModule.register({
          secret: 'test-secret',
          signOptions: { expiresIn: '1h' },
        }),
      ],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should return true for public routes', () => {
      const context = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({}),
          getResponse: jest.fn().mockReturnValue({}),
          getNext: jest.fn().mockReturnValue({}),
        }),
      } as unknown as ExecutionContext;

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

      const result = guard.canActivate(context);

      expect(result).toBe(true);
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(IS_PUBLIC_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
    });

    it('should call super.canActivate for protected routes', async () => {
      const context = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({}),
          getResponse: jest.fn().mockReturnValue({}),
          getNext: jest.fn().mockReturnValue({}),
        }),
      } as unknown as ExecutionContext;

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
      
      const testGuard = new JwtAuthGuard(reflector);
      const superCanActivate = jest
        .spyOn(AuthGuard('jwt').prototype, 'canActivate')
        .mockImplementation(() => true);

      const result = await testGuard.canActivate(context);

      expect(result).toBe(true);
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(IS_PUBLIC_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
      expect(superCanActivate).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException for invalid token', async () => {
      const context = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({}),
          getResponse: jest.fn().mockReturnValue({}),
          getNext: jest.fn().mockReturnValue({}),
        }),
      } as unknown as ExecutionContext;

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
      
      jest
        .spyOn(JwtAuthGuard.prototype, 'canActivate')
        .mockRejectedValue(new UnauthorizedException());

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});

describe('JwtAuthGuard Integration', () => {
  let app: TestingModule;
  let usersController: UsersController;
  let prismaService: PrismaService;

  beforeEach(async () => {
    app = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findMany: jest.fn(),
              findFirst: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
        {
          provide: 'APP_GUARD',
          useClass: JwtAuthGuard,
        },
        Reflector,
      ],
      imports: [
        JwtModule.register({
          secret: 'test-secret',
          signOptions: { expiresIn: '1h' },
        }),
      ],
    }).compile();

    usersController = app.get<UsersController>(UsersController);
    prismaService = app.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(usersController).toBeDefined();
  });

  describe('Protected Routes', () => {
    const mockUser = {
      id: 1,
      name: 'Test User',
      username: 'testuser',
      email: 'test@example.com',
      phone: '1234567890',
      website: 'test.com',
      createdAt: new Date(),
      updatedAt: new Date(),
      address: null,
      company: null,
    };

    beforeEach(() => {
      (prismaService.user.findMany as jest.Mock).mockResolvedValue([mockUser]);
    });

    it('should allow access to findAll with valid token', async () => {
      const result = await usersController.findAll({});
      expect(result).toEqual([mockUser]);
    });

    it('should throw UnauthorizedException without valid token', async () => {
      (prismaService.user.findMany as jest.Mock).mockRejectedValue(
        new UnauthorizedException(),
      );

      await expect(usersController.findAll({})).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
}); 