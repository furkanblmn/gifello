import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SearchQueryDto } from '../dto/search-query.dto';
import { SearchService, type SearchResult } from '../search.service';

@ApiTags('Search')
@Controller({
  path: 'search',
  version: '1',
})
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @ApiOperation({ summary: 'Search across supported entities with payload' })
  @ApiBody({ type: SearchQueryDto })
  @Post()
  search(@Body() dto: SearchQueryDto): Promise<SearchResult> {
    return this.searchService.search(dto.text ?? '');
  }
}
