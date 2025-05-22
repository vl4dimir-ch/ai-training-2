import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponse } from './types/user-response.type';
import { userSelect } from './constants/user-select.constant';
import { ReplaceUserDto } from './dto/replace-user.dto';
import { removeUndefinedProperties } from '../../utils/object.utils';
import { FilterUserDto } from './dto/filter-user.dto';
import { Prisma } from '@prisma/client';
import { USER_ERROR_MESSAGES } from './constants/error-messages.constant';

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) { }

    private async validateUniqueConstraints(
        username?: string,
        email?: string,
        excludeUserId?: number,
    ): Promise<void> {
        if (!username && !email) {
            return;
        }

        const whereCondition: Prisma.UserWhereInput = {
            AND: [
                excludeUserId ? { id: { not: excludeUserId } } : {},
                {
                    OR: [
                        username ? { username: { equals: username, mode: 'insensitive' } } : {},
                        email ? { email: { equals: email, mode: 'insensitive' } } : {},
                    ],
                },
            ],
        };

        const existingUser = await this.prisma.user.findFirst({ where: whereCondition });

        if (existingUser) {
            if (existingUser.username === username) {
                throw new ConflictException(USER_ERROR_MESSAGES.USERNAME_EXISTS);
            }
            throw new ConflictException(USER_ERROR_MESSAGES.EMAIL_EXISTS);
        }
    }

    private async getNextUserId(): Promise<number> {
        const lastUser = await this.prisma.user.findFirst({
            orderBy: { id: 'desc' },
            select: { id: true },
        });
        return (lastUser?.id || 0) + 1;
    }

    async create(createUserDto: CreateUserDto): Promise<UserResponse> {
        const { address, company, username, email, ...userData } = createUserDto;

        await this.validateUniqueConstraints(username, email);

        const fakeId = await this.getNextUserId();
        const now = new Date();

        return {
            id: fakeId,
            username,
            email,
            ...userData,
            address,
            company,
            createdAt: now,
            updatedAt: now,
        };
    }

    async findAll(filters?: FilterUserDto): Promise<UserResponse[]> {
        try {
            return await this.prisma.user.findMany({
                where: filters,
                select: userSelect,
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                throw new BadRequestException(USER_ERROR_MESSAGES.INVALID_FILTERS);
            }
            throw error;
        }
    }

    async findOne(id: number, filters?: FilterUserDto): Promise<UserResponse> {
        try {
            const user = await this.prisma.user.findFirst({
                where: {
                    id,
                    ...filters,
                },
                select: userSelect,
            });

            if (!user) {
                throw new NotFoundException(USER_ERROR_MESSAGES.USER_NOT_FOUND(id));
            }

            return user;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                throw new BadRequestException(USER_ERROR_MESSAGES.INVALID_FILTERS);
            }
            throw error;
        }
    }

    async update(id: number, updateUserDto: UpdateUserDto): Promise<UserResponse> {
        const existingUser = await this.findOne(id);

        if (updateUserDto.username || updateUserDto.email) {
            await this.validateUniqueConstraints(
                updateUserDto.username,
                updateUserDto.email,
                id,
            );
        }

        return {
            ...existingUser,
            ...removeUndefinedProperties(updateUserDto),
            updatedAt: new Date(),
        };
    }

    async replace(id: number, replaceUserDto: ReplaceUserDto): Promise<UserResponse> {
        return this.update(id, replaceUserDto);
    }

    async remove(id: number): Promise<UserResponse> {
        const user = await this.findOne(id);
        return user;
    }
}
