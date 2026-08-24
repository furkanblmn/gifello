import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
import { DeviceMetadataDto } from './device-metadata.dto';

export class LoginDto extends DeviceMetadataDto {
  @ApiProperty({
    example: 'alice@example.com',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 'Password123!',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;
}
