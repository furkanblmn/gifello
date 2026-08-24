import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class RevokeSessionDto {
  @ApiPropertyOptional({
    example: '2ee18f9db4f143f8bf3bb2a8b82f4ce0d4f8deab',
    minLength: 20,
  })
  @IsOptional()
  @IsString()
  @MinLength(20)
  refreshToken?: string;
}
