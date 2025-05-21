import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponse } from './types/user-response.type';
import { userSelect } from './constants/user-select.constant';
import { ReplaceUserDto } from './dto/replace-user.dto';
import { removeUndefinedProperties } from '../../utils/object.utils';

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) { }

    async create(createUserDto: CreateUserDto): Promise<UserResponse> {
        const { address, company, ...userData } = createUserDto;

        // Ensure the username and email is unique
        const existingUser = await this.prisma.user.findFirst({
            where: {
                OR: [
                    { username: { equals: userData.username, mode: 'insensitive' } },
                    { email: { equals: userData.email, mode: 'insensitive' } }
                ]
            }
        });

        if (existingUser) {
            if (existingUser.username === userData.username) {
                throw new ConflictException('Username already exists');
            }

            throw new ConflictException('Email already exists');
        }

        const lastUser = await this.prisma.user.findFirst({
            orderBy: { id: 'desc' },
            select: { id: true }
        });

        const fakeId = (lastUser?.id || 0) + 1;

        return {
            id: fakeId,
            ...userData,
            address: address,
            company: company,
            createdAt: new Date(),
            updatedAt: new Date()
        };
    }

    async findAll(): Promise<UserResponse[]> {
        return await this.prisma.user.findMany({
            select: userSelect
        });
    }

    async findOne(id: number): Promise<UserResponse> {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: userSelect
        });

        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        return user;
    }

    async update(id: number, updateUserDto: UpdateUserDto): Promise<UserResponse> {
        const existingUser = await this.findOne(id);

        if (!existingUser) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        if (updateUserDto.username || updateUserDto.email) {
            const existingUserWithUsernameOrEmail = await this.prisma.user.findFirst({
                where: {
                    AND: [
                        { id: { not: id } },
                        { OR: [
                            { username: { equals: updateUserDto.username, mode: 'insensitive' } },
                            { email: { equals: updateUserDto.email, mode: 'insensitive' } }
                        ] }
                    ]
                }
            });

            if (existingUserWithUsernameOrEmail) {
                if (existingUserWithUsernameOrEmail.username === updateUserDto.username) {
                    throw new ConflictException('Username already exists');
                }

                throw new ConflictException('Email already exists');
            }
        }

        return {
            ...existingUser,
            ...removeUndefinedProperties(updateUserDto),
            updatedAt: new Date()
        };
    }

    // Since mutations are fake, both PUT and PATCH are implemented as updateOrReplace
    async replace(id: number, updateUserDto: UpdateUserDto): Promise<UserResponse> {
        return await this.update(id, updateUserDto);
    }

    async remove(id: number): Promise<UserResponse> {
        const user = await this.findOne(id);

        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        return user;
    }
}
