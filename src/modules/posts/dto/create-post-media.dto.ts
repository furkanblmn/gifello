import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PostMediaType } from '@prisma/client';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
} from 'class-validator';

export class CreatePostMediaDto {
  @ApiProperty({
    enum: PostMediaType,
    example: PostMediaType.IMAGE,
  })
  @IsEnum(PostMediaType)
  mediaType!: PostMediaType;

  @ApiProperty({
    example: 'posts/alice-2.jpg',
  })
  @IsString()
  @MaxLength(255)
  storageKey!: string;

  @ApiProperty({
    example: 'https://cdn.example.com/posts/alice-2.jpg',
  })
  @IsUrl()
  @MaxLength(2048)
  mediaUrl!: string;

  @ApiPropertyOptional({
    example: 'https://cdn.example.com/posts/alice-2-thumb.jpg',
  })
  @IsOptional()
  @IsUrl()
  @MaxLength(2048)
  thumbnailUrl?: string;

  @ApiPropertyOptional({
    example: 'image/jpeg',
  })
  @IsOptional()
  @IsString()
  @MaxLength(191)
  mimeType?: string;

  @ApiPropertyOptional({
    example: 1080,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  width?: number;

  @ApiPropertyOptional({
    example: 1350,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  height?: number;

  @ApiPropertyOptional({
    example: 15000,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  durationMs?: number;

  @ApiPropertyOptional({
    example: 248000,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  fileSizeBytes?: number;
}
