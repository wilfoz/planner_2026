import { Module } from '@nestjs/common';

import { CreateUserUseCase } from '@/contexts/users/application/usecases/create-user.usecase';
import { DeleteUserUseCase } from '@/contexts/users/application/usecases/delete-user.usecase';
import { GetUserUseCase } from '@/contexts/users/application/usecases/get-user.usecase';
import { ListUsersUseCase } from '@/contexts/users/application/usecases/list-users.usecase';
import { LoginUseCase } from '@/contexts/users/application/usecases/login.usecase';
import { UpdateUserPasswordUseCase } from '@/contexts/users/application/usecases/update-user-password.usecase';
import { UpdateUserUseCase } from '@/contexts/users/application/usecases/update-user.usecase';
import { USERS_REPOSITORY } from '@/contexts/users/domain/users.repository';
import { PrismaUsersRepository } from '@/contexts/users/infrastructure/database/prisma/prisma-users.repository';
import { UsersController } from '@/contexts/users/infrastructure/users.controller';
import { AuthService } from '@/shared/infrastructure/auth/auth.service';
import { PrismaService } from '@/shared/infrastructure/database/prisma/prisma.service';

@Module({
  controllers: [UsersController],
  providers: [
    {
      provide: USERS_REPOSITORY,
      inject: [PrismaService],
      useFactory: (prisma: PrismaService) => new PrismaUsersRepository(prisma),
    },
    {
      provide: CreateUserUseCase,
      inject: [USERS_REPOSITORY],
      useFactory: (usersRepo) => new CreateUserUseCase(usersRepo),
    },
    {
      provide: LoginUseCase,
      inject: [USERS_REPOSITORY, AuthService],
      useFactory: (usersRepo, auth: AuthService) => new LoginUseCase(usersRepo, auth),
    },
    {
      provide: ListUsersUseCase,
      inject: [USERS_REPOSITORY],
      useFactory: (usersRepo) => new ListUsersUseCase(usersRepo),
    },
    {
      provide: GetUserUseCase,
      inject: [USERS_REPOSITORY],
      useFactory: (usersRepo) => new GetUserUseCase(usersRepo),
    },
    {
      provide: UpdateUserUseCase,
      inject: [USERS_REPOSITORY],
      useFactory: (usersRepo) => new UpdateUserUseCase(usersRepo),
    },
    {
      provide: UpdateUserPasswordUseCase,
      inject: [USERS_REPOSITORY],
      useFactory: (usersRepo) => new UpdateUserPasswordUseCase(usersRepo),
    },
    {
      provide: DeleteUserUseCase,
      inject: [USERS_REPOSITORY],
      useFactory: (usersRepo) => new DeleteUserUseCase(usersRepo),
    },
  ],
})
export class UsersModule {}

