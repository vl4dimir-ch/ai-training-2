import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ReplaceUserDto } from './dto/replace-user.dto';
import { FilterUserDto } from './dto/filter-user.dto';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UserResponse } from './types/user-response.type';
import { userSelect } from './constants/user-select.constant';
import { USER_ERROR_MESSAGES } from './constants/error-messages.constant';

// Mock implementation of PrismaService
type MockPrismaService = {
    user: {
        findFirst: jest.Mock;
        findMany: jest.Mock;
        create: jest.Mock;
        update: jest.Mock;
        delete: jest.Mock;
    };
};

describe('UsersService', () => {
    let service: UsersService;
    let prisma: MockPrismaService;

    const mockUser: UserResponse = {
        id: 1,
        name: 'Test User',
        username: 'testuser',
        email: 'test@example.com',
        phone: '1-234-567-8900',
        website: 'test.com',
        createdAt: new Date(),
        updatedAt: new Date(),
        address: {
            street: 'Test St',
            suite: 'Suite 123',
            city: 'Test City',
            zipcode: '12345',
            geo: {
                lat: '40.7128',
                lng: '-74.0060'
            }
        },
        company: {
            name: 'Test Company',
            catchPhrase: 'Testing is good',
            bs: 'test business'
        }
    };

    const mockPrismaService = {
        user: {
            findFirst: jest.fn(),
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
            ],
        }).compile();

        service = module.get<UsersService>(UsersService);
        prisma = module.get(PrismaService) as unknown as MockPrismaService;

        // Reset all mocks
        jest.clearAllMocks();
    });

    describe('create', () => {
        const createUserDto: CreateUserDto = {
            name: 'Test User',
            username: 'testuser',
            email: 'test@example.com',
            phone: '1-234-567-8900',
            website: 'test.com',
            address: {
                street: 'Test St',
                suite: 'Suite 123',
                city: 'Test City',
                zipcode: '12345',
                geo: {
                    lat: '40.7128',
                    lng: '-74.0060'
                }
            },
            company: {
                name: 'Test Company',
                catchPhrase: 'Testing is good',
                bs: 'test business'
            }
        };

        it('should create a new user when username and email are unique', async () => {
            prisma.user.findFirst
                .mockResolvedValueOnce(null) // No existing user with same username/email
                .mockResolvedValueOnce({ id: 0 }); // Last user ID

            const result = await service.create(createUserDto);

            expect(result).toEqual({
                id: 1,
                ...createUserDto,
                createdAt: expect.any(Date),
                updatedAt: expect.any(Date),
            });

            expect(prisma.user.findFirst).toHaveBeenCalledWith({
                where: {
                    OR: [
                        { username: { equals: createUserDto.username, mode: 'insensitive' } },
                        { email: { equals: createUserDto.email, mode: 'insensitive' } }
                    ]
                }
            });

            expect(prisma.user.findFirst).toHaveBeenLastCalledWith({
                orderBy: { id: 'desc' },
                select: { id: true },
            });
        });

        it('should throw ConflictException when username already exists', async () => {
            prisma.user.findFirst.mockResolvedValueOnce({
                ...mockUser,
                username: createUserDto.username,
            });

            await expect(service.create(createUserDto)).rejects.toThrow(
                new ConflictException(USER_ERROR_MESSAGES.USERNAME_EXISTS),
            );
        });

        it('should throw ConflictException when email already exists', async () => {
            prisma.user.findFirst.mockResolvedValueOnce({
                ...mockUser,
                email: createUserDto.email,
                username: 'different',
            });

            await expect(service.create(createUserDto)).rejects.toThrow(
                new ConflictException(USER_ERROR_MESSAGES.EMAIL_EXISTS),
            );
        });

        it('should generate correct ID when no users exist', async () => {
            prisma.user.findFirst
                .mockResolvedValueOnce(null) // No existing user with same username/email
                .mockResolvedValueOnce(null); // No existing users at all

            const result = await service.create(createUserDto);
            expect(result.id).toBe(1);
        });
    });

    describe('findAll', () => {
        const filters: FilterUserDto = { name: 'test' };

        it('should return all users matching filters', async () => {
            const mockUsers = [mockUser];
            prisma.user.findMany.mockResolvedValue(mockUsers);

            const result = await service.findAll(filters);

            expect(result).toEqual(mockUsers);
            expect(prisma.user.findMany).toHaveBeenCalledWith({
                where: filters,
                select: userSelect,
            });
        });

        it('should return empty array when no users match filters', async () => {
            prisma.user.findMany.mockResolvedValue([]);

            const result = await service.findAll(filters);

            expect(result).toEqual([]);
        });
    });

    describe('findOne', () => {
        const filters: FilterUserDto = { name: 'test' };

        it('should return a user when found', async () => {
            prisma.user.findFirst.mockResolvedValue(mockUser);

            const result = await service.findOne(1, filters);

            expect(result).toEqual(mockUser);
            expect(prisma.user.findFirst).toHaveBeenCalledWith({
                where: {
                    id: 1,
                    ...filters,
                },
                select: userSelect,
            });
        });

        it('should throw NotFoundException when user not found', async () => {
            prisma.user.findFirst.mockResolvedValue(null);

            await expect(service.findOne(999, filters)).rejects.toThrow(
                new NotFoundException(USER_ERROR_MESSAGES.USER_NOT_FOUND(999)),
            );
        });
    });

    describe('update', () => {
        const updateUserDto: UpdateUserDto = {
            name: 'Updated Name',
            username: 'updateduser',
        };

        it('should update a user when found and username/email are unique', async () => {
            prisma.user.findFirst
                .mockResolvedValueOnce(mockUser) // Existing user
                .mockResolvedValueOnce(null); // No conflicting username/email

            const updatedUser: UserResponse = {
                ...mockUser,
                name: updateUserDto.name || mockUser.name,
                username: updateUserDto.username || mockUser.username,
                updatedAt: expect.any(Date),
            };

            const result = await service.update(1, updateUserDto);

            expect(result).toEqual(updatedUser);
        });

        it('should throw NotFoundException when user not found', async () => {
            prisma.user.findFirst.mockResolvedValue(null);

            await expect(service.update(999, updateUserDto)).rejects.toThrow(
                new NotFoundException(USER_ERROR_MESSAGES.USER_NOT_FOUND(999)),
            );
        });

        it('should throw ConflictException when username already exists', async () => {
            prisma.user.findFirst
                .mockResolvedValueOnce(mockUser) // Existing user
                .mockResolvedValueOnce({ // Conflicting user
                    ...mockUser,
                    id: 2,
                    username: updateUserDto.username,
                });

            await expect(service.update(1, updateUserDto)).rejects.toThrow(
                new ConflictException(USER_ERROR_MESSAGES.USERNAME_EXISTS),
            );
        });

        it('should throw ConflictException when email already exists', async () => {
            const updateWithEmail = { ...updateUserDto, email: 'new@example.com' };

            prisma.user.findFirst
                .mockResolvedValueOnce(mockUser) // Existing user
                .mockResolvedValueOnce({ // Conflicting user
                    ...mockUser,
                    id: 2,
                    email: updateWithEmail.email,
                });

            await expect(service.update(1, updateWithEmail)).rejects.toThrow(
                new ConflictException(USER_ERROR_MESSAGES.EMAIL_EXISTS),
            );
        });

        it('should not check uniqueness when username and email are not updated', async () => {
            const updateWithoutUsernameEmail: UpdateUserDto = { name: 'Updated Name' };
            prisma.user.findFirst.mockResolvedValueOnce(mockUser); // Only one call for finding user

            await service.update(1, updateWithoutUsernameEmail);

            expect(prisma.user.findFirst).toHaveBeenCalledTimes(1);
        });

        it('should throw NotFoundException from findOne when user not found', async () => {
            prisma.user.findFirst.mockResolvedValue(null);

            await expect(service.findOne(999)).rejects.toThrow(
                new NotFoundException(USER_ERROR_MESSAGES.USER_NOT_FOUND(999)),
            );
        });

        it('should handle undefined username and email in update', async () => {
            const updateWithoutUsernameEmail: UpdateUserDto = { name: 'Updated Name' };
            prisma.user.findFirst.mockResolvedValueOnce(mockUser); // Only one call for finding user

            const result = await service.update(1, updateWithoutUsernameEmail);

            expect(result).toEqual({
                ...mockUser,
                name: 'Updated Name',
                updatedAt: expect.any(Date),
            });
            expect(prisma.user.findFirst).toHaveBeenCalledTimes(1);
        });
    });

    describe('replace', () => {
        const replaceUserDto: ReplaceUserDto = {
            name: 'New Name',
            username: 'newuser',
            email: 'new@example.com',
            phone: '1-234-567-8901',
            website: 'new.com',
            address: {
                street: 'New St',
                suite: 'Suite 456',
                city: 'New City',
                zipcode: '54321',
                geo: {
                    lat: '40.7128',
                    lng: '-74.0060'
                }
            },
            company: {
                name: 'New Company',
                catchPhrase: 'New is good',
                bs: 'new business'
            }
        };

        it('should replace a user when found and username/email are unique', async () => {
            prisma.user.findFirst
                .mockResolvedValueOnce(mockUser) // Existing user
                .mockResolvedValueOnce(null); // No conflicting username/email

            const replacedUser: UserResponse = {
                ...mockUser,
                ...replaceUserDto,
                updatedAt: expect.any(Date),
            };

            const result = await service.replace(1, replaceUserDto);

            expect(result).toEqual(replacedUser);
        });

        it('should throw NotFoundException when user not found', async () => {
            prisma.user.findFirst.mockResolvedValue(null);

            await expect(service.replace(999, replaceUserDto)).rejects.toThrow(
                new NotFoundException(USER_ERROR_MESSAGES.USER_NOT_FOUND(999)),
            );
        });
    });

    describe('remove', () => {
        it('should return the removed user', async () => {
            prisma.user.findFirst.mockResolvedValue(mockUser);

            const result = await service.remove(1);

            expect(result).toEqual(mockUser);
            expect(prisma.user.findFirst).toHaveBeenCalledWith({
                where: { id: 1 },
                select: userSelect,
            });
        });

        it('should throw NotFoundException when user not found', async () => {
            prisma.user.findFirst.mockResolvedValue(null);

            await expect(service.remove(999)).rejects.toThrow(
                new NotFoundException(USER_ERROR_MESSAGES.USER_NOT_FOUND(999)),
            );
        });
    });
}); 