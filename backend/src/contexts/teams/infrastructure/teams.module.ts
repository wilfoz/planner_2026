import { Module } from '@nestjs/common';

import { CreateTeamUseCase } from '@/contexts/teams/application/usecases/create-team.usecase';
import { DeleteTeamUseCase } from '@/contexts/teams/application/usecases/delete-team.usecase';
import { GetTeamUseCase } from '@/contexts/teams/application/usecases/get-team.usecase';
import { ListTeamsUseCase } from '@/contexts/teams/application/usecases/list-teams.usecase';
import { UpdateTeamUseCase } from '@/contexts/teams/application/usecases/update-team.usecase';
import { TEAMS_REPOSITORY } from '@/contexts/teams/domain/teams.repository';
import { PrismaTeamsRepository } from '@/contexts/teams/infrastructure/database/prisma/prisma-teams.repository';
import { TeamsController } from '@/contexts/teams/infrastructure/teams.controller';
import { PrismaService } from '@/shared/infrastructure/database/prisma/prisma.service';

@Module({
  controllers: [TeamsController],
  providers: [
    {
      provide: TEAMS_REPOSITORY,
      inject: [PrismaService],
      useFactory: (prisma: PrismaService) => new PrismaTeamsRepository(prisma),
    },
    {
      provide: CreateTeamUseCase,
      inject: [TEAMS_REPOSITORY],
      useFactory: (repo) => new CreateTeamUseCase(repo),
    },
    {
      provide: ListTeamsUseCase,
      inject: [TEAMS_REPOSITORY],
      useFactory: (repo) => new ListTeamsUseCase(repo),
    },
    {
      provide: GetTeamUseCase,
      inject: [TEAMS_REPOSITORY],
      useFactory: (repo) => new GetTeamUseCase(repo),
    },
    {
      provide: UpdateTeamUseCase,
      inject: [TEAMS_REPOSITORY],
      useFactory: (repo) => new UpdateTeamUseCase(repo),
    },
    {
      provide: DeleteTeamUseCase,
      inject: [TEAMS_REPOSITORY],
      useFactory: (repo) => new DeleteTeamUseCase(repo),
    }
  ],
})
export class TeamsModule {}

