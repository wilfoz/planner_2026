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
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { STATUS_EMPLOYEE } from '@prisma/client';

import { CreateEmployeeUseCase } from '@/contexts/employees/application/usecases/create-employee.usecase';
import { DeleteEmployeeUseCase } from '@/contexts/employees/application/usecases/delete-employee.usecase';
import { GetEmployeeUseCase } from '@/contexts/employees/application/usecases/get-employee.usecase';
import { ListEmployeesUseCase } from '@/contexts/employees/application/usecases/list-employees.usecase';
import { UpdateEmployeeUseCase } from '@/contexts/employees/application/usecases/update-employee.usecase';
import { CreateEmployeeDto } from '@/contexts/employees/infrastructure/dto/create-employee.dto';
import { ListEmployeesQueryDto } from '@/contexts/employees/infrastructure/dto/list-employees.query.dto';
import { UpdateEmployeeDto } from '@/contexts/employees/infrastructure/dto/update-employee.dto';
import { EmployeePresenter } from '@/contexts/employees/infrastructure/presenters/employee.presenter';
import { AuthGuard } from '@/shared/infrastructure/auth/auth.guard';
import { CollectionPresenter } from '@/shared/presenters/collection.presenter';

@ApiTags('Employees')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('employees')
export class EmployeesController {
  constructor(
    private readonly createEmployee: CreateEmployeeUseCase,
    private readonly listEmployees: ListEmployeesUseCase,
    private readonly getEmployee: GetEmployeeUseCase,
    private readonly updateEmployee: UpdateEmployeeUseCase,
    private readonly deleteEmployee: DeleteEmployeeUseCase,
  ) {}

  @Post()
  async create(@Body() dto: CreateEmployeeDto) {
    const output = await this.createEmployee.execute({
      registration: dto.registration,
      full_name: dto.full_name,
      occupation: dto.occupation,
      leadership: dto.leadership,
      status: dto.status ?? STATUS_EMPLOYEE.ACTIVE,
      team_id: dto.team_id ?? null,
    });
    return new EmployeePresenter(output);
  }

  @Get()
  async list(@Query() query: ListEmployeesQueryDto) {
    const result = await this.listEmployees.execute(query);
    return new CollectionPresenter({
      meta: result.meta,
      data: result.data.map((e) => new EmployeePresenter(e)),
    });
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const output = await this.getEmployee.execute({ id });
    return new EmployeePresenter(output);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateEmployeeDto) {
    const output = await this.updateEmployee.execute({ id, ...dto });
    return new EmployeePresenter(output);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string) {
    await this.deleteEmployee.execute({ id });
  }
}

