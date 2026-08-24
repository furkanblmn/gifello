import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({
    example: '2ee18f9db4f143f8bf3bb2a8b82f4ce0d4f8deab',
    minLength: 20,
  })
  @IsString()
  @MinLength(20)
  refreshToken!: string;
}
