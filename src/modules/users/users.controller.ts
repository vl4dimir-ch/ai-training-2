import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Put,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ReplaceUserDto } from './dto/replace-user.dto';
import { FilterUserDto } from './dto/filter-user.dto';
import { UserResponse } from './types/user-response.type';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'User successfully created',
    type: UserResponse 
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Invalid input data' 
  })
  create(@Body() createUserDto: CreateUserDto): Promise<UserResponse> {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'List of users retrieved successfully',
    type: [UserResponse]
  })
  @ApiQuery({ type: FilterUserDto })
  findAll(@Query() filters: FilterUserDto): Promise<UserResponse[]> {
    return this.usersService.findAll(filters);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiParam({ name: 'id', description: 'User ID', type: 'number' })
  @ApiQuery({ type: FilterUserDto })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'User found and retrieved successfully',
    type: UserResponse
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'User not found' 
  })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Query() filters: FilterUserDto,
  ): Promise<UserResponse> {
    return this.usersService.findOne(id, filters);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a user partially' })
  @ApiParam({ name: 'id', description: 'User ID', type: 'number' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'User updated successfully',
    type: UserResponse
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'User not found' 
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Invalid input data' 
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponse> {
    return this.usersService.update(id, updateUserDto);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Replace a user entirely' })
  @ApiParam({ name: 'id', description: 'User ID', type: 'number' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'User replaced successfully',
    type: UserResponse
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'User not found' 
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Invalid input data' 
  })
  replace(
    @Param('id', ParseIntPipe) id: number,
    @Body() replaceUserDto: ReplaceUserDto,
  ): Promise<UserResponse> {
    return this.usersService.replace(id, replaceUserDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a user' })
  @ApiParam({ name: 'id', description: 'User ID', type: 'number' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'User deleted successfully',
    type: UserResponse
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'User not found' 
  })
  remove(@Param('id', ParseIntPipe) id: number): Promise<UserResponse> {
    return this.usersService.remove(id);
  }
}
