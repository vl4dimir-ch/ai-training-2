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

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createUserDto: CreateUserDto): Promise<UserResponse> {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(@Query() filters: FilterUserDto): Promise<UserResponse[]> {
    return this.usersService.findAll(filters);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Query() filters: FilterUserDto,
  ): Promise<UserResponse> {
    return this.usersService.findOne(id, filters);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponse> {
    return this.usersService.update(id, updateUserDto);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  replace(
    @Param('id', ParseIntPipe) id: number,
    @Body() replaceUserDto: ReplaceUserDto,
  ): Promise<UserResponse> {
    return this.usersService.replace(id, replaceUserDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id', ParseIntPipe) id: number): Promise<UserResponse> {
    return this.usersService.remove(id);
  }
}
