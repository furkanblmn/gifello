import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class DeviceMetadataDto {
  @ApiPropertyOptional({
    example: 'device-ios-001',
    description: 'Stable device identifier from the mobile client.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(191)
  deviceId?: string;

  @ApiPropertyOptional({
    example: 'iPhone 15 Pro',
    description: 'User-friendly device name.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(191)
  deviceName?: string;

  @ApiPropertyOptional({
    example: 'iOS 18.1',
    description: 'Operating system reported by the client.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(191)
  deviceOs?: string;

  @ApiPropertyOptional({
    example: 'ios',
    description: 'Platform identifier such as ios, android, or web.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(191)
  platform?: string;

  @ApiPropertyOptional({
    example: '1.0.0',
    description: 'Application version sent by the client.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(191)
  appVersion?: string;
}
