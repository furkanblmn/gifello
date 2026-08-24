import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ProfilesService, type ProfileDetail } from '../profiles.service';

@ApiTags('Profiles')
@Controller({
  path: 'profiles',
  version: '1',
})
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get(':username')
  @ApiOperation({ summary: 'Get a profile by username' })
  @ApiParam({ name: 'username', example: 'alice' })
  getByUsername(@Param('username') username: string): Promise<ProfileDetail> {
    return this.profilesService.getByUsername(username);
  }
}
