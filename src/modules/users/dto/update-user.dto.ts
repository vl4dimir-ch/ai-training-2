import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { ValidateNested, IsObject, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { AddressDto } from './nested/address.dto';
import { CompanyDto } from './nested/company.dto';
import { ApiProperty, OmitType, PartialType as SwaggerPartialType } from '@nestjs/swagger';

// We need to use @nestjs/swagger PartialType for proper Swagger documentation
export class UpdateUserDto extends SwaggerPartialType(CreateUserDto) {
  @ApiProperty({ 
    type: AddressDto,
    required: false,
    description: 'User\'s address information',
    nullable: true
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  @IsObject()
  address?: AddressDto;

  @ApiProperty({ 
    type: CompanyDto,
    required: false,
    description: 'User\'s company information',
    nullable: true
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CompanyDto)
  @IsObject()
  company?: CompanyDto;
} 