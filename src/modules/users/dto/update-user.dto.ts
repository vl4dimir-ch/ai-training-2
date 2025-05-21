import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { ValidateNested, IsObject, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { AddressDto } from './nested/address.dto';
import { CompanyDto } from './nested/company.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  @IsObject()
  address?: AddressDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => CompanyDto)
  @IsObject()
  company?: CompanyDto;
} 