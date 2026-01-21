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
import { AuthGuard } from '@/shared/infrastructure/auth/auth.guard';
import { CollectionPresenter } from '@/shared/presenters/collection.presenter';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly createUser: CreateUserUseCase,
    private readonly login: LoginUseCase,
    private readonly listUsers: ListUsersUseCase,
    private readonly getUser: GetUserUseCase,
    private readonly updateUser: UpdateUserUseCase,
    private readonly updatePassword: UpdateUserPasswordUseCase,
    private readonly deleteUser: DeleteUserUseCase,
  ) {}

  @Post()
  async signup(@Body() dto: CreateUserDto) {
    const output = await this.createUser.execute(dto);
    return new UserPresenter(output);
  }

  @Post('login')
  async loginUser(@Body() dto: LoginDto) {
    return await this.login.execute(dto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get()
  async list(@Query() query: ListUsersQueryDto) {
    const result = await this.listUsers.execute(query);
    return new CollectionPresenter({
      meta: result.meta,
      data: result.data.map((u) => new UserPresenter(u)),
    });
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get(':id')
  async getById(@Param('id') id: string) {
    const output = await this.getUser.execute({ id });
    return new UserPresenter(output);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    const output = await this.updateUser.execute({ id, ...dto });
    return new UserPresenter(output);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Patch(':id')
  async updateUserPassword(@Param('id') id: string, @Body() dto: UpdateUserPasswordDto) {
    const output = await this.updatePassword.execute({ id, ...dto });
    return new UserPresenter(output);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string) {
    await this.deleteUser.execute({ id });
  }
}

