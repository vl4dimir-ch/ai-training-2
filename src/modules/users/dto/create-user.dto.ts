import { IsString, IsEmail, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { AddressDto } from './nested/address.dto';
import { CompanyDto } from './nested/company.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'Leanne Graham', description: 'Full name of the user' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Bret', description: 'Username for the account' })
  @IsString()
  username: string;

  @ApiProperty({ example: 'sincere@april.biz', description: 'Email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '1-770-736-8031 x56442', description: 'Contact phone number' })
  @IsString()
  phone: string;

  @ApiProperty({ example: 'hildegard.org', description: 'Personal or business website' })
  @IsString()
  website: string;

  @ApiProperty({ type: AddressDto, description: 'User\'s address information' })
  @ValidateNested()
  @Type(() => AddressDto)
  @IsObject()
  address: AddressDto;

  @ApiProperty({ type: CompanyDto, description: 'User\'s company information' })
  @ValidateNested()
  @Type(() => CompanyDto)
  @IsObject()
  company: CompanyDto;
} 