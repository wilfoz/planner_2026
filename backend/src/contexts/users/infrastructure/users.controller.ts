import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Public, Roles } from 'nest-keycloak-connect';

import { CreateUserUseCase } from '@/contexts/users/application/usecases/create-user.usecase';
import { DeleteUserUseCase } from '@/contexts/users/application/usecases/delete-user.usecase';
import { GetUserUseCase } from '@/contexts/users/application/usecases/get-user.usecase';
import { ListUsersUseCase } from '@/contexts/users/application/usecases/list-users.usecase';
import { LoginUseCase } from '@/contexts/users/application/usecases/login.usecase';
import { UpdateUserPasswordUseCase } from '@/contexts/users/application/usecases/update-user-password.usecase';
import { UpdateUserUseCase } from '@/contexts/users/application/usecases/update-user.usecase';
import { CreateUserDto } from '@/contexts/users/infrastructure/dto/create-user.dto';
import { ListUsersQueryDto } from '@/contexts/users/infrastructure/dto/list-users.query.dto';
import { LoginDto } from '@/contexts/users/infrastructure/dto/login.dto';
import { UpdateUserPasswordDto } from '@/contexts/users/infrastructure/dto/update-user-password.dto';
import { UpdateUserDto } from '@/contexts/users/infrastructure/dto/update-user.dto';
import { UserPresenter } from '@/contexts/users/infrastructure/presenters/user.presenter';
import { CollectionPresenter } from '@/shared/presenters/collection.presenter';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@Roles({
  roles: [
    'ADMIN', 'admin', 'realm:ADMIN', 'realm:admin',
    'MANAGER', 'manager', 'realm:MANAGER', 'realm:manager',
    'USER', 'user', 'realm:USER', 'realm:user'
  ]
})
export class UsersController {
  constructor(
    private readonly createUser: CreateUserUseCase,
    private readonly login: LoginUseCase,
    private readonly listUsers: ListUsersUseCase,
    private readonly getUser: GetUserUseCase,
    private readonly updateUser: UpdateUserUseCase,
    private readonly updatePassword: UpdateUserPasswordUseCase,
    private readonly deleteUser: DeleteUserUseCase,
  ) { }

  @Public()
  @Post()
  async signup(@Body() dto: CreateUserDto) {
    const output = await this.createUser.execute(dto);
    return new UserPresenter(output);
  }

  @Public()
  @Post('login')
  async loginUser(@Body() dto: LoginDto) {
    return await this.login.execute(dto);
  }

  @Get()
  async list(@Query() query: ListUsersQueryDto) {
    const result = await this.listUsers.execute(query);
    return new CollectionPresenter({
      meta: result.meta,
      data: result.data.map((u) => new UserPresenter(u)),
    });
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const output = await this.getUser.execute({ id });
    return new UserPresenter(output);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    const output = await this.updateUser.execute({ id, ...dto });
    return new UserPresenter(output);
  }

  @Patch(':id')
  async updateUserPassword(@Param('id') id: string, @Body() dto: UpdateUserPasswordDto) {
    const output = await this.updatePassword.execute({ id, ...dto });
    return new UserPresenter(output);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string) {
    await this.deleteUser.execute({ id });
  }
}

