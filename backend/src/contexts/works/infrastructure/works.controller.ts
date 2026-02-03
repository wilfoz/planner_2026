
import {
  Body, Controller, Delete, ForbiddenException, Get, Param, Patch, Post, Put, Query, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthenticatedUser, Roles, Unprotected } from 'nest-keycloak-connect';

import { WorkOutput } from '@/contexts/works/application/dto/work.output';
import { CreateWorkUseCase } from '@/contexts/works/application/usecases/create-work.usecase';
import { DeleteWorkUseCase } from '@/contexts/works/application/usecases/delete-work.usecase';
import { GetWorkUseCase } from '@/contexts/works/application/usecases/get-work.usecase';
import { ListWorksUseCase } from '@/contexts/works/application/usecases/list-works.usecase';
import { UpdateWorkUseCase } from '@/contexts/works/application/usecases/update-work.usecase';
import { CreateWorkDto } from '@/contexts/works/infrastructure/dto/create-work.dto';
import { ListWorksQueryDto } from '@/contexts/works/infrastructure/dto/list-works.query.dto';
import { UpdateWorkDto } from '@/contexts/works/infrastructure/dto/update-work.dto';
import { WorksListResponseDto } from '@/contexts/works/infrastructure/dto/works-list.response.dto';
import { WorkOwnershipGuard } from '@/shared/infrastructure/auth/guards/work-ownership.guard';

@ApiTags('Works')
@ApiBearerAuth()
@Controller('works')
export class WorksController {
  constructor(
    private readonly createWorkUseCase: CreateWorkUseCase,
    private readonly listWorksUseCase: ListWorksUseCase,
    private readonly getWorkUseCase: GetWorkUseCase,
    private readonly updateWorkUseCase: UpdateWorkUseCase,
    private readonly deleteWorkUseCase: DeleteWorkUseCase,
  ) { }

  @Get('debug-auth')
  @Unprotected()
  debugAuth(@AuthenticatedUser() user: any) {
    return {
      message: 'Debug Auth',
      user: user,
      roles: user?.realm_access?.roles,
    };
  }

  @Post()
  @Roles({ roles: ['ADMIN', 'admin', 'realm:ADMIN', 'realm:admin'] })
  @ApiCreatedResponse({ type: WorkOutput })
  create(@Body() dto: CreateWorkDto) {
    console.log('--- WorksController.create called ---');
    console.log('DTO:', JSON.stringify(dto));
    return this.createWorkUseCase.execute(dto);
  }

  @Get()
  @Roles({
    roles: [
      'ADMIN', 'admin', 'realm:ADMIN', 'realm:admin',
      'MANAGER', 'manager', 'realm:MANAGER', 'realm:manager',
      'USER', 'user', 'realm:USER', 'realm:user'
    ]
  })
  @ApiOkResponse({ type: WorksListResponseDto })
  list(@Query() query: ListWorksQueryDto, @AuthenticatedUser() user: any) {
    return this.listWorksUseCase.execute(query, user);
  }


  @Get(':id')
  // ...
  async get(@Param('id') id: string) {
    console.log(`--- WorksController.get called with id: ${id} ---`);
    return this.getWorkUseCase.execute(id);
  }

  @Put(':id')
  @Roles({
    roles: [
      'ADMIN', 'admin', 'realm:ADMIN', 'realm:admin',
      'MANAGER', 'manager', 'realm:MANAGER', 'realm:manager',
      'USER', 'user', 'realm:USER', 'realm:user'
    ]
  })
  @UseGuards(WorkOwnershipGuard)
  @ApiOkResponse({ type: WorkOutput })
  update(@Param('id') id: string, @Body() dto: UpdateWorkDto, @AuthenticatedUser() user: any) {
    return this._update(id, dto, user);
  }

  @Patch(':id')
  @Roles({
    roles: [
      'ADMIN', 'admin', 'realm:ADMIN', 'realm:admin',
      'MANAGER', 'manager', 'realm:MANAGER', 'realm:manager',
      'USER', 'user', 'realm:USER', 'realm:user'
    ]
  })
  @UseGuards(WorkOwnershipGuard)
  @ApiOkResponse({ type: WorkOutput })
  updatePatch(@Param('id') id: string, @Body() dto: UpdateWorkDto, @AuthenticatedUser() user: any) {
    return this._update(id, dto, user);
  }

  private _update(id: string, dto: UpdateWorkDto, user: any) {
    console.log(`--- WorksController.update called with id: ${id} ---`);
    return this.updateWorkUseCase.execute(id, dto);
  }

  @Delete(':id')
  @Roles({ roles: ['ADMIN', 'admin', 'realm:ADMIN', 'realm:admin'] })
  @ApiOkResponse()
  delete(@Param('id') id: string) {
    return this.deleteWorkUseCase.execute(id);
  }
}
