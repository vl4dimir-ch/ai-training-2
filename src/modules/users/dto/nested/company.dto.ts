import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CompanyDto {
  @ApiProperty({ 
    example: 'Romaguera-Crona', 
    description: 'Company name' 
  })
  @IsString()
  name: string;

  @ApiProperty({ 
    example: 'Multi-layered client-server neural-net', 
    description: 'Company catch phrase' 
  })
  @IsString()
  catchPhrase: string;

  @ApiProperty({ 
    example: 'harness real-time e-markets', 
    description: 'Company business description' 
  })
  @IsString()
  bs: string;
} 