import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { DeviceMetadataDto } from './device-metadata.dto';

export class RegisterDto extends DeviceMetadataDto {
  @ApiProperty({
    example: 'new.user@example.com',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 'new_user',
    minLength: 3,
    maxLength: 30,
  })
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  @Matches(/^[a-zA-Z0-9_.]+$/)
  username!: string;

  @ApiProperty({
    example: 'Password123!',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;

  @ApiPropertyOptional({
    example: 'New User',
  })
  @IsOptional()
  @IsString()
  @MaxLength(191)
  displayName?: string;
}
