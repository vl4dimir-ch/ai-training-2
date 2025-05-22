import { IsString, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { GeoLocationDto } from './geo-location.dto';
import { ApiProperty } from '@nestjs/swagger';

export class AddressDto {
  @ApiProperty({ 
    example: 'Kulas Light', 
    description: 'Street name' 
  })
  @IsString()
  street: string;

  @ApiProperty({ 
    example: 'Apt. 556', 
    description: 'Suite number or additional address info' 
  })
  @IsString()
  suite: string;

  @ApiProperty({ 
    example: 'Gwenborough', 
    description: 'City name' 
  })
  @IsString()
  city: string;

  @ApiProperty({ 
    example: '92998-3874', 
    description: 'Postal code' 
  })
  @IsString()
  zipcode: string;

  @ApiProperty({ 
    type: GeoLocationDto,
    description: 'Geographic coordinates' 
  })
  @ValidateNested()
  @Type(() => GeoLocationDto)
  @IsObject()
  geo: GeoLocationDto;
} 