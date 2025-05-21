import { IsString, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { GeoLocationDto } from './geo-location.dto';

export class AddressDto {
  @IsString()
  street: string;

  @IsString()
  suite: string;

  @IsString()
  city: string;

  @IsString()
  zipcode: string;

  @ValidateNested()
  @Type(() => GeoLocationDto)
  @IsObject()
  geo: GeoLocationDto;
} 