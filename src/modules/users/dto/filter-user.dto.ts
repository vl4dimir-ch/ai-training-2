import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FilterUserDto {
    @ApiProperty({
        required: false,
        description: 'Filter users by name',
        example: 'Leanne Graham'
    })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiProperty({
        required: false,
        description: 'Filter users by username',
        example: 'Bret'
    })
    @IsOptional()
    @IsString()
    username?: string;

    @ApiProperty({
        required: false,
        description: 'Filter users by email',
        example: 'sincere@april.biz'
    })
    @IsOptional()
    @IsString()
    email?: string;

    @ApiProperty({
        required: false,
        description: 'Filter users by phone number',
        example: '1-770-736-8031 x56442'
    })
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiProperty({
        required: false,
        description: 'Filter users by website',
        example: 'hildegard.org'
    })
    @IsOptional()
    @IsString()
    website?: string;
} 