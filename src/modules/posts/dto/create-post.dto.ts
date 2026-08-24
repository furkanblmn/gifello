import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PostType, PostVisibility } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { CreatePostMediaDto } from './create-post-media.dto';

export class CreatePostDto {
  @ApiPropertyOptional({
    enum: PostType,
    default: PostType.STANDARD,
    example: PostType.STANDARD,
  })
  @IsOptional()
  @IsEnum(PostType)
  type?: PostType;

  @ApiProperty({
    example: 'Bugun ofiste olanlari anlatsam olay olur.',
    description:
      'Required for gossip cauldron posts. Optional for standard posts.',
  })
  @IsString()
  @MaxLength(5000)
  caption!: string;

  @ApiPropertyOptional({
    enum: PostVisibility,
    default: PostVisibility.PUBLIC,
  })
  @IsOptional()
  @IsEnum(PostVisibility)
  visibility?: PostVisibility;

  @ApiPropertyOptional({
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  commentsDisabled?: boolean;

  @ApiPropertyOptional({
    default: false,
    description:
      'When true, nearby users inside the configured app radius receive a notification.',
  })
  @IsOptional()
  @IsBoolean()
  hasScent?: boolean;

  @ApiPropertyOptional({
    type: [CreatePostMediaDto],
    description:
      'Allowed only for standard posts. Gossip cauldron posts must not include media.',
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => CreatePostMediaDto)
  mediaItems?: CreatePostMediaDto[];
}
