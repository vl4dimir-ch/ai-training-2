import { IsString, IsEmail, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { AddressDto } from './nested/address.dto';
import { CompanyDto } from './nested/company.dto';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsString()
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  phone: string;

  @IsString()
  website: string;

  @ValidateNested()
  @Type(() => AddressDto)
  @IsObject()
  address: AddressDto;

  @ValidateNested()
  @Type(() => CompanyDto)
  @IsObject()
  company: CompanyDto;
} 