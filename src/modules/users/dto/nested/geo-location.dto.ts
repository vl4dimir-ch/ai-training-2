import { IsString } from 'class-validator';

export class GeoLocationDto {
  @IsString()
  lat: string;

  @IsString()
  lng: string;
} 