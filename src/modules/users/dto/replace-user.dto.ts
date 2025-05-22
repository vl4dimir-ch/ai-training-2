import { CreateUserDto } from './create-user.dto';
import { ApiProperty } from '@nestjs/swagger';

// This class inherits all Swagger documentation from CreateUserDto
export class ReplaceUserDto extends CreateUserDto {}