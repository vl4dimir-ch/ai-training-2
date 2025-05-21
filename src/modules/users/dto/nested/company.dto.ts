import { IsString } from 'class-validator';

export class CompanyDto {
  @IsString()
  name: string;

  @IsString()
  catchPhrase: string;

  @IsString()
  bs: string;
} 