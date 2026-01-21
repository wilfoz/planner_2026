import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CreateTeamUseCase } from '@/contexts/teams/application/usecases/create-team.usecase';
import { DeleteTeamUseCase } from '@/contexts/teams/application/usecases/delete-team.usecase';
import { GetTeamUseCase } from '@/contexts/teams/application/usecases/get-team.usecase';
import { ListTeamsUseCase } from '@/contexts/teams/application/usecases/list-teams.usecase';
import { UpdateTeamUseCase } from '@/contexts/teams/application/usecases/update-team.usecase';
import { CreateTeamDto } from '@/contexts/teams/infrastructure/dto/create-team.dto';
import { ListTeamsQueryDto } from '@/contexts/teams/infrastructure/dto/list-teams.query.dto';
import { UpdateTeamDto } from '@/contexts/teams/infrastructure/dto/update-team.dto';
import { TeamPresenter } from '@/contexts/teams/infrastructure/presenters/team.presenter';
import { CollectionPresenter } from '@/shared/presenters/collection.presenter';

@ApiTags('Teams')
@Controller('teams')
export class TeamsController {
  constructor(
    private readonly createTeam: CreateTeamUseCase,
    private readonly listTeams: ListTeamsUseCase,
    private readonly getTeam: GetTeamUseCase,
    private readonly updateTeam: UpdateTeamUseCase,
    private readonly deleteTeam: DeleteTeamUseCase,
  ) {}

  @Post()
  async create(@Body() dto: CreateTeamDto) {
    const output = await this.createTeam.execute(dto);
    return new TeamPresenter(output);
  }

  @Get()
  async list(@Query() query: ListTeamsQueryDto) {
    const result = await this.listTeams.execute(query);
    return new CollectionPresenter({
      meta: result.meta,
      data: result.data.map((t) => new TeamPresenter(t)),
    });
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const output = await this.getTeam.execute({ id });
    return new TeamPresenter(output);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateTeamDto) {
    const output = await this.updateTeam.execute({ id, ...dto });
    return new TeamPresenter(output);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string) {
    await this.deleteTeam.execute({ id });
  }
}

