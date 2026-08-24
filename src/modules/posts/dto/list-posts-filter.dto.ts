import { ApiPropertyOptional } from '@nestjs/swagger';
import { PostType } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

export class ListPostsFilterDto {
  @ApiPropertyOptional({
    enum: PostType,
    description: 'Filter posts by type.',
  })
  @IsOptional()
  @IsEnum(PostType)
  type?: PostType;
}
