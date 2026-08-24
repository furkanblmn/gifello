import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class SearchQueryDto {
  @ApiPropertyOptional({
    example: 'alice',
    description: 'Search text used across supported entities.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(191)
  text?: string;
}
