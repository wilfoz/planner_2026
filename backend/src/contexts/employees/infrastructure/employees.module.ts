import { Module } from '@nestjs/common';

import { CreateEmployeeUseCase } from '@/contexts/employees/application/usecases/create-employee.usecase';
import { DeleteEmployeeUseCase } from '@/contexts/employees/application/usecases/delete-employee.usecase';
import { GetEmployeeUseCase } from '@/contexts/employees/application/usecases/get-employee.usecase';
import { ListEmployeesUseCase } from '@/contexts/employees/application/usecases/list-employees.usecase';
import { UpdateEmployeeUseCase } from '@/contexts/employees/application/usecases/update-employee.usecase';
import { EMPLOYEES_REPOSITORY } from '@/contexts/employees/domain/employees.repository';
import { PrismaEmployeesRepository } from '@/contexts/employees/infrastructure/database/prisma/prisma-employees.repository';
import { EmployeesController } from '@/contexts/employees/infrastructure/employees.controller';
import { PrismaService } from '@/shared/infrastructure/database/prisma/prisma.service';

@Module({
  controllers: [EmployeesController],
  providers: [
    {
      provide: EMPLOYEES_REPOSITORY,
      inject: [PrismaService],
      useFactory: (prisma: PrismaService) => new PrismaEmployeesRepository(prisma),
    },
    {
      provide: CreateEmployeeUseCase,
      inject: [EMPLOYEES_REPOSITORY],
      useFactory: (repo) => new CreateEmployeeUseCase(repo),
    },
    {
      provide: ListEmployeesUseCase,
      inject: [EMPLOYEES_REPOSITORY],
      useFactory: (repo) => new ListEmployeesUseCase(repo),
    },
    {
      provide: GetEmployeeUseCase,
      inject: [EMPLOYEES_REPOSITORY],
      useFactory: (repo) => new GetEmployeeUseCase(repo),
    },
    {
      provide: UpdateEmployeeUseCase,
      inject: [EMPLOYEES_REPOSITORY],
      useFactory: (repo) => new UpdateEmployeeUseCase(repo),
    },
    {
      provide: DeleteEmployeeUseCase,
      inject: [EMPLOYEES_REPOSITORY],
      useFactory: (repo) => new DeleteEmployeeUseCase(repo),
    },
  ],
})
export class EmployeesModule {}

