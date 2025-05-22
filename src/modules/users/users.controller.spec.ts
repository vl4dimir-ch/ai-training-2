import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ReplaceUserDto } from './dto/replace-user.dto';
import { FilterUserDto } from './dto/filter-user.dto';
import { UnauthorizedException, NotFoundException } from '@nestjs/common';
import { UserResponse } from './types/user-response.type';

describe('UsersController', () => {
  let controller: UsersController;
  let service: jest.Mocked<UsersService>;

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

  const mockUsersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    replace: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
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

    it('should create a new user', async () => {
      service.create.mockResolvedValue(mockUser);
      const result = await controller.create(createUserDto);
      expect(result).toEqual(mockUser);
      expect(service.create).toHaveBeenCalledWith(createUserDto);
    });

    it('should throw UnauthorizedException when not authenticated', async () => {
      service.create.mockRejectedValue(new UnauthorizedException());
      await expect(controller.create(createUserDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('findAll', () => {
    const filters: FilterUserDto = { name: 'test' };

    it('should return an array of users with filters', async () => {
      const mockUsers = [mockUser];
      service.findAll.mockResolvedValue(mockUsers);
      
      const result = await controller.findAll(filters);
      expect(result).toEqual(mockUsers);
      expect(service.findAll).toHaveBeenCalledWith(filters);
    });

    it('should return empty array when no users match filters', async () => {
      service.findAll.mockResolvedValue([]);
      const result = await controller.findAll({ name: 'nonexistent' });
      expect(result).toEqual([]);
    });

    it('should throw UnauthorizedException when not authenticated', async () => {
      service.findAll.mockRejectedValue(new UnauthorizedException());
      await expect(controller.findAll(filters)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('findOne', () => {
    const filters: FilterUserDto = { name: 'test' };

    it('should return a single user with filters', async () => {
      service.findOne.mockResolvedValue(mockUser);
      
      const result = await controller.findOne(1, filters);
      expect(result).toEqual(mockUser);
      expect(service.findOne).toHaveBeenCalledWith(1, filters);
    });

    it('should throw NotFoundException when user not found', async () => {
      service.findOne.mockRejectedValue(new NotFoundException());
      await expect(controller.findOne(999, filters)).rejects.toThrow(NotFoundException);
    });

    it('should throw UnauthorizedException when not authenticated', async () => {
      service.findOne.mockRejectedValue(new UnauthorizedException());
      await expect(controller.findOne(1, filters)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('update', () => {
    const updateUserDto: UpdateUserDto = {
      name: 'Updated Name',
      username: 'updateduser'
    };

    it('should update a user', async () => {
      const updatedUser: UserResponse = {
        ...mockUser,
        name: updateUserDto.name || mockUser.name,
        username: updateUserDto.username || mockUser.username
      };
      service.update.mockResolvedValue(updatedUser);
      
      const result = await controller.update(1, updateUserDto);
      expect(result).toEqual(updatedUser);
      expect(service.update).toHaveBeenCalledWith(1, updateUserDto);
    });

    it('should not modify the id even if provided in dto', async () => {
      const dtoWithId = { ...updateUserDto, id: 999 } as UpdateUserDto;
      const updatedUser: UserResponse = {
        ...mockUser,
        name: updateUserDto.name || mockUser.name,
        username: updateUserDto.username || mockUser.username
      };
      service.update.mockResolvedValue(updatedUser);
      
      const result = await controller.update(1, dtoWithId);
      expect(result.id).toBe(1);
      expect(service.update).toHaveBeenCalledWith(1, dtoWithId);
    });

    it('should throw NotFoundException when user not found', async () => {
      service.update.mockRejectedValue(new NotFoundException());
      await expect(controller.update(999, updateUserDto)).rejects.toThrow(NotFoundException);
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

    it('should replace a user', async () => {
      const replacedUser = { ...mockUser, ...replaceUserDto };
      service.replace.mockResolvedValue(replacedUser);
      
      const result = await controller.replace(1, replaceUserDto);
      expect(result).toEqual(replacedUser);
      expect(service.replace).toHaveBeenCalledWith(1, replaceUserDto);
    });

    it('should not modify the id even if provided in dto', async () => {
      const dtoWithId = { ...replaceUserDto, id: 999 } as ReplaceUserDto;
      const replacedUser = { ...mockUser, ...replaceUserDto };
      service.replace.mockResolvedValue(replacedUser);
      
      const result = await controller.replace(1, dtoWithId);
      expect(result.id).toBe(1);
      expect(service.replace).toHaveBeenCalledWith(1, dtoWithId);
    });

    it('should throw NotFoundException when user not found', async () => {
      service.replace.mockRejectedValue(new NotFoundException());
      await expect(controller.replace(999, replaceUserDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      service.remove.mockResolvedValue(mockUser);
      
      const result = await controller.remove(1);
      expect(result).toEqual(mockUser);
      expect(service.remove).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when user not found', async () => {
      service.remove.mockRejectedValue(new NotFoundException());
      await expect(controller.remove(999)).rejects.toThrow(NotFoundException);
    });

    it('should throw UnauthorizedException when not authenticated', async () => {
      service.remove.mockRejectedValue(new UnauthorizedException());
      await expect(controller.remove(1)).rejects.toThrow(UnauthorizedException);
    });
  });
}); 