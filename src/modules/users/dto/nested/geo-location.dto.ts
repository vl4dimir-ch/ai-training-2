import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GeoLocationDto {
  @ApiProperty({ 
    example: '-37.3159', 
    description: 'Latitude coordinate' 
  })
  @IsString()
  lat: string;

  @ApiProperty({ 
    example: '81.1496', 
    description: 'Longitude coordinate' 
  })
  @IsString()
  lng: string;
} 