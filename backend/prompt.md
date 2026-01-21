# Prompt para Desenvolvimento Backend - Sistema de Controle de Custos de Projetos com Arquitetura Hexagonal

## Contexto do Projeto
Você é um desenvolvedor backend sênior especializado em NestJS, TypeScript, Prisma e Arquitetura Hexagonal. Precisa desenvolver um backend robusto para um sistema de controle de custos de projetos de construção/engenharia, focado na gestão de equipes, membros, equipamentos e custos operacionais, seguindo as melhores práticas de arquitetura limpa, DDD (Domain-Driven Design) e padrões SOLID.

## Especificações Técnicas

### Stack Tecnológica
- **Framework**: NestJS com TypeScript
- **ORM**: Prisma com PostgreSQL
- **Arquitetura**: Hexagonal (Ports & Adapters) + DDD
- **Testes**: Jest (unitários, integração, e2e)
- **Documentação**: Swagger/OpenAPI
- **Conteinerização**: Docker
- **Mensageria**: RabbitMQ (para cálculos assíncronos e relatórios)

### Estrutura de Arquitetura Hexagonal

```
src/
├── domain/                     # Núcleo da aplicação (regras de negócio)
│   ├── entities/              # Entidades de domínio
│   │   ├── project.entity.ts
│   │   ├── team.entity.ts
│   │   ├── member.entity.ts
│   │   ├── equipment.entity.ts
│   │   └── cost.entity.ts
│   ├── value-objects/         # Objetos de valor
│   │   ├── money.vo.ts
│   │   ├── date-range.vo.ts
│   │   ├── frequency.vo.ts
│   │   └── project-id.vo.ts
│   ├── repositories/          # Interfaces de repositórios (ports)
│   ├── services/              # Serviços de domínio
│   │   ├── cost-calculation.service.ts
│   │   ├── project-timeline.service.ts
│   │   └── budget-validation.service.ts
│   └── events/                # Eventos de domínio
├── application/               # Casos de uso da aplicação
│   ├── use-cases/            # Implementação dos casos de uso
│   │   ├── project/          # Casos de uso de projetos
│   │   ├── team/             # Casos de uso de equipes
│   │   ├── member/           # Casos de uso de membros
│   │   ├── equipment/        # Casos de uso de equipamentos
│   │   └── cost/             # Casos de uso de custos
│   ├── ports/                # Interfaces de entrada (ports primários)
│   └── handlers/             # Handlers de eventos/comandos
├── infrastructure/           # Adaptadores (implementação externa)
│   ├── database/             # Adaptadores de banco de dados
│   │   ├── prisma/          # Configuração Prisma
│   │   └── repositories/    # Implementação de repositórios
│   ├── messaging/           # Adaptadores de mensageria
│   ├── external/            # Serviços externos (APIs de câmbio, etc.)
│   └── config/              # Configurações
├── presentation/            # Camada de apresentação (adaptadores primários)
│   ├── controllers/         # Controllers REST
│   ├── dtos/               # Data Transfer Objects
│   ├── guards/             # Guards de autenticação/autorização
│   ├── filters/            # Exception filters
│   └── interceptors/       # Interceptors personalizados
└── shared/                 # Código compartilhado
    ├── decorators/         # Decorators customizados
    ├── validators/         # Validadores
    └── utils/              # Utilitários
```

## Schema Prisma - Análise das Entidades

### Entidades Principais e Relacionamentos:

1. **Project** (Projetos)
   - Entidade raiz do agregado
   - Contém múltiples equipes (teams)
   - Controla cronograma e escopo geral

2. **Team** (Equipes)
   - Agregado próprio com membros e equipamentos
   - Possui custos fixos associados
   - Vinculada a um projeto específico

3. **Member** (Membros da Equipe)
   - Funcionários/colaboradores das equipes
   - Possuem custos trabalhistas associados

4. **Equipment** (Equipamentos)
   - Equipamentos utilizados pelas equipes
   - Custos de amortização e aluguel

5. **Cost Models** (Modelos de Custos)
   - LaborCost, EquipmentCost, FixedCost
   - BasicBenefits, Costs
   - Cálculos complexos de custos

6. **Calendar** (Calendário)
   - Controle de dias úteis e feriados
   - Base para cálculos temporais

## Implementação Detalhada Requerida

### 1. Camada de Domínio (Domain Layer)

#### Entidades de Domínio
```typescript
// Project Entity
export class Project {
  constructor(
    private readonly id: ProjectId,
    private name: string,
    private description: string | null,
    private timeline: DateRange,
    private teams: Team[] = []
  ) {}

  public addTeam(team: Team): void {
    if (this.teams.some(existingTeam => existingTeam.getName() === team.getName())) {
      throw new TeamAlreadyExistsError('Equipe com este nome já existe no projeto');
    }
    this.teams.push(team);
  }

  public calculateTotalBudget(): Money {
    return this.teams.reduce(
      (total, team) => total.add(team.calculateTotalCost()),
      Money.zero()
    );
  }

  public isActive(): boolean {
    const now = new Date();
    return this.timeline.contains(now);
  }

  public getProjectDuration(): number {
    return this.timeline.getDurationInDays();
  }
}

// Team Entity
export class Team {
  constructor(
    private readonly id: TeamId,
    private name: string,
    private projectId: ProjectId,
    private members: Member[] = [],
    private equipment: Equipment[] = [],
    private fixedCosts: FixedCost[] = []
  ) {}

  public addMember(member: Member): void {
    this.members.push(member);
  }

  public addEquipment(equipment: Equipment): void {
    this.equipment.push(equipment);
  }

  public calculateTotalCost(): Money {
    const laborCost = this.calculateLaborCost();
    const equipmentCost = this.calculateEquipmentCost();
    const fixedCost = this.calculateFixedCost();
    
    return laborCost.add(equipmentCost).add(fixedCost);
  }

  private calculateLaborCost(): Money {
    return this.members.reduce(
      (total, member) => total.add(member.calculateMonthlyCost()),
      Money.zero()
    );
  }

  private calculateEquipmentCost(): Money {
    return this.equipment.reduce(
      (total, equipment) => total.add(equipment.calculateMonthlyCost()),
      Money.zero()
    );
  }

  private calculateFixedCost(): Money {
    return this.fixedCosts.reduce(
      (total, cost) => total.add(cost.getMonthlyCost()),
      Money.zero()
    );
  }
}

// Member Entity
export class Member {
  constructor(
    private readonly id: MemberId,
    private name: string,
    private role: string,
    private description: string,
    private teamId: TeamId,
    private laborCost: LaborCost | null = null
  ) {}

  public assignLaborCost(laborCost: LaborCost): void {
    this.laborCost = laborCost;
  }

  public calculateMonthlyCost(): Money {
    if (!this.laborCost) {
      return Money.zero();
    }
    return this.laborCost.calculateMonthlyCost();
  }

  public isActive(): boolean {
    return this.laborCost !== null;
  }
}

// Equipment Entity
export class Equipment {
  constructor(
    private readonly id: EquipmentId,
    private name: string,
    private description: string | null,
    private type: EquipmentType,
    private amortizationYears: number,
    private globalConsumption: Decimal,
    private teamId: TeamId,
    private equipmentCost: EquipmentCost | null = null
  ) {}

  public calculateMonthlyCost(): Money {
    if (!this.equipmentCost) {
      return Money.zero();
    }
    return this.equipmentCost.calculateMonthlyCost();
  }

  public calculateAmortization(): Money {
    if (!this.equipmentCost) {
      return Money.zero();
    }
    const monthlyAmortization = this.equipmentCost.getUnitPrice()
      .divide(this.amortizationYears * 12);
    return monthlyAmortization;
  }
}
```

#### Value Objects
```typescript
export class Money {
  constructor(private readonly amount: Decimal) {
    if (amount.isNegative()) {
      throw new Error('Valor monetário não pode ser negativo');
    }
  }

  public static zero(): Money {
    return new Money(new Decimal(0));
  }

  public static fromNumber(value: number): Money {
    return new Money(new Decimal(value));
  }

  public add(other: Money): Money {
    return new Money(this.amount.add(other.amount));
  }

  public subtract(other: Money): Money {
    const result = this.amount.sub(other.amount);
    if (result.isNegative()) {
      throw new Error('Resultado não pode ser negativo');
    }
    return new Money(result);
  }

  public multiply(factor: number): Money {
    return new Money(this.amount.mul(factor));
  }

  public divide(divisor: number): Money {
    if (divisor === 0) {
      throw new Error('Divisão por zero não é permitida');
    }
    return new Money(this.amount.div(divisor));
  }

  public getValue(): Decimal {
    return this.amount;
  }

  public equals(other: Money): boolean {
    return this.amount.equals(other.amount);
  }
}

export class DateRange {
  constructor(
    private readonly startDate: Date,
    private readonly endDate: Date | null = null
  ) {
    if (endDate && startDate > endDate) {
      throw new Error('Data de início deve ser anterior à data de fim');
    }
  }

  public contains(date: Date): boolean {
    if (this.endDate) {
      return date >= this.startDate && date <= this.endDate;
    }
    return date >= this.startDate;
  }

  public getDurationInDays(): number {
    if (!this.endDate) {
      return Infinity;
    }
    const diffTime = this.endDate.getTime() - this.startDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  public getStartDate(): Date {
    return this.startDate;
  }

  public getEndDate(): Date | null {
    return this.endDate;
  }
}

export class Frequency {
  private static readonly VALID_VALUES = ['daily', 'weekly', 'monthly'] as const;
  
  constructor(private readonly value: typeof Frequency.VALID_VALUES[number]) {
    if (!Frequency.VALID_VALUES.includes(value)) {
      throw new Error(`Frequência inválida: ${value}`);
    }
  }

  public getValue(): string {
    return this.value;
  }

  public getMonthlyMultiplier(): number {
    switch (this.value) {
      case 'daily': return 30;
      case 'weekly': return 4;
      case 'monthly': return 1;
      default: throw new Error(`Frequência não suportada: ${this.value}`);
    }
  }
}
```

#### Repository Interfaces (Ports)
```typescript
export interface IProjectRepository {
  save(project: Project): Promise<void>;
  findById(id: ProjectId): Promise<Project | null>;
  findAll(page: number, limit: number): Promise<Project[]>;
  findByDateRange(startDate: Date, endDate: Date): Promise<Project[]>;
  delete(id: ProjectId): Promise<void>;
}

export interface ITeamRepository {
  save(team: Team): Promise<void>;
  findById(id: TeamId): Promise<Team | null>;
  findByProjectId(projectId: ProjectId): Promise<Team[]>;
  findWithMembers(id: TeamId): Promise<Team | null>;
  delete(id: TeamId): Promise<void>;
}

export interface IMemberRepository {
  save(member: Member): Promise<void>;
  findById(id: MemberId): Promise<Member | null>;
  findByTeamId(teamId: TeamId): Promise<Member[]>;
  findByRole(role: string): Promise<Member[]>;
  delete(id: MemberId): Promise<void>;
}

export interface IEquipmentRepository {
  save(equipment: Equipment): Promise<void>;
  findById(id: EquipmentId): Promise<Equipment | null>;
  findByTeamId(teamId: TeamId): Promise<Equipment[]>;
  findByType(type: string): Promise<Equipment[]>;
  delete(id: EquipmentId): Promise<void>;
}

export interface ICostCalculationRepository {
  saveLaborCost(laborCost: LaborCost): Promise<void>;
  saveEquipmentCost(equipmentCost: EquipmentCost): Promise<void>;
  saveFixedCost(fixedCost: FixedCost): Promise<void>;
  findBasicBenefitsByState(state: string): Promise<BasicBenefits | null>;
  findCostsByType(type: string): Promise<Costs[]>;
}
```

#### Domain Services
```typescript
@Injectable()
export class CostCalculationService {
  constructor(
    private readonly calendarService: CalendarService,
    private readonly basicBenefitsRepository: IBasicBenefitsRepository
  ) {}

  public async calculateLaborCost(
    member: Member,
    workDaysOff: number,
    state: string
  ): Promise<LaborCost> {
    const basicBenefits = await this.basicBenefitsRepository.findByState(state);
    if (!basicBenefits) {
      throw new BasicBenefitsNotFoundError(`Benefícios não encontrados para o estado: ${state}`);
    }

    const workingDays = await this.calendarService.getWorkingDaysInMonth();
    const adjustedWorkingDays = workingDays - workDaysOff;
    
    const dailySalary = basicBenefits.getSalary().divide(workingDays);
    const totalSalary = dailySalary.multiply(adjustedWorkingDays);
    
    return new LaborCost(
      member.getId(),
      member.getRole(),
      workDaysOff,
      basicBenefits,
      totalSalary
    );
  }

  public calculateEquipmentCost(
    equipment: Equipment,
    unitPrice: Money,
    externalRental: Money,
    internalRental: Money,
    monthlyConsumption: Decimal
  ): EquipmentCost {
    const amortizationCost = unitPrice.divide(equipment.getAmortizationYears() * 12);
    const rentalCost = externalRental.add(internalRental);
    const consumptionCost = Money.fromNumber(monthlyConsumption.toNumber());
    
    const finalCost = amortizationCost.add(rentalCost).add(consumptionCost);
    
    return new EquipmentCost(
      equipment.getId(),
      unitPrice,
      externalRental,
      internalRental,
      monthlyConsumption,
      finalCost
    );
  }
}

@Injectable()
export class ProjectBudgetService {
  public validateBudget(project: Project, maxBudget: Money): boolean {
    const totalCost = project.calculateTotalBudget();
    return totalCost.getValue().lte(maxBudget.getValue());
  }

  public calculateBudgetUtilization(project: Project, maxBudget: Money): number {
    const totalCost = project.calculateTotalBudget();
    return totalCost.getValue().div(maxBudget.getValue()).mul(100).toNumber();
  }

  public generateBudgetBreakdown(project: Project): BudgetBreakdown {
    const teams = project.getTeams();
    const breakdown = teams.map(team => ({
      teamName: team.getName(),
      laborCost: team.calculateLaborCost(),
      equipmentCost: team.calculateEquipmentCost(),
      fixedCost: team.calculateFixedCost(),
      totalCost: team.calculateTotalCost()
    }));

    return new BudgetBreakdown(breakdown);
  }
}
```

### 2. Camada de Aplicação (Application Layer)

#### Use Cases
```typescript
@Injectable()
export class CreateProjectUseCase {
  constructor(
    private readonly projectRepository: IProjectRepository,
    private readonly eventBus: EventBus
  ) {}

  async execute(command: CreateProjectCommand): Promise<void> {
    const projectId = ProjectId.generate();
    const timeline = new DateRange(command.startDate, command.endDate);
    
    const project = new Project(
      projectId,
      command.name,
      command.description,
      timeline
    );

    await this.projectRepository.save(project);
    
    await this.eventBus.publish(
      new ProjectCreatedEvent(projectId.getValue(), command.name)
    );
  }
}

@Injectable()
export class AddTeamToProjectUseCase {
  constructor(
    private readonly projectRepository: IProjectRepository,
    private readonly teamRepository: ITeamRepository,
    private readonly eventBus: EventBus
  ) {}

  async execute(command: AddTeamToProjectCommand): Promise<void> {
    const project = await this.projectRepository.findById(
      new ProjectId(command.projectId)
    );
    
    if (!project) {
      throw new ProjectNotFoundError('Projeto não encontrado');
    }

    const teamId = TeamId.generate();
    const team = new Team(
      teamId,
      command.teamName,
      new ProjectId(command.projectId)
    );

    project.addTeam(team);
    
    await this.teamRepository.save(team);
    await this.projectRepository.save(project);
    
    await this.eventBus.publish(
      new TeamAddedToProjectEvent(teamId.getValue(), command.projectId)
    );
  }
}

@Injectable()
export class CalculateProjectBudgetUseCase {
  constructor(
    private readonly projectRepository: IProjectRepository,
    private readonly budgetService: ProjectBudgetService
  ) {}

  async execute(query: CalculateProjectBudgetQuery): Promise<ProjectBudgetResponse> {
    const project = await this.projectRepository.findById(
      new ProjectId(query.projectId)
    );
    
    if (!project) {
      throw new ProjectNotFoundError('Projeto não encontrado');
    }

    const totalBudget = project.calculateTotalBudget();
    const breakdown = this.budgetService.generateBudgetBreakdown(project);
    
    return new ProjectBudgetResponse(
      query.projectId,
      totalBudget.getValue(),
      breakdown.getTeamBreakdowns()
    );
  }
}
```

#### Commands and Queries
```typescript
export class CreateProjectCommand {
  constructor(
    public readonly name: string,
    public readonly description: string | null,
    public readonly startDate: Date,
    public readonly endDate: Date | null
  ) {}
}

export class AddTeamToProjectCommand {
  constructor(
    public readonly projectId: string,
    public readonly teamName: string
  ) {}
}

export class AddMemberToTeamCommand {
  constructor(
    public readonly teamId: string,
    public readonly name: string,
    public readonly role: string,
    public readonly description: string
  ) {}
}

export class CalculateProjectBudgetQuery {
  constructor(public readonly projectId: string) {}
}

export class GetProjectsByDateRangeQuery {
  constructor(
    public readonly startDate: Date,
    public readonly endDate: Date,
    public readonly page: number = 1,
    public readonly limit: number = 10
  ) {}
}
```

### 3. Camada de Infraestrutura (Infrastructure Layer)

#### Repository Implementations
```typescript
@Injectable()
export class PrismaProjectRepository implements IProjectRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(project: Project): Promise<void> {
    const data = this.toPrismaData(project);
    await this.prisma.project.upsert({
      where: { id: data.id },
      create: data,
      update: {
        name: data.name,
        description: data.description,
        startDate: data.startDate,
        endDate: data.endDate,
        updatedAt: new Date()
      }
    });
  }

  async findById(id: ProjectId): Promise<Project | null> {
    const projectData = await this.prisma.project.findUnique({
      where: { id: id.getValue() },
      include: {
        teams: {
          include: {
            members: {
              include: {
                laborCost: {
                  include: {
                    basicBenefits: true,
                    costs: true
                  }
                }
              }
            },
            equipment: {
              include: {
                equipmentCosts: {
                  include: {
                    costs: true
                  }
                }
              }
            },
            fixedCosts: true
          }
        }
      }
    });
    
    return projectData ? this.toDomainEntity(projectData) : null;
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Project[]> {
    const projectsData = await this.prisma.project.findMany({
      where: {
        OR: [
          {
            startDate: {
              gte: startDate,
              lte: endDate
            }
          },
          {
            endDate: {
              gte: startDate,
              lte: endDate
            }
          },
          {
            AND: [
              { startDate: { lte: startDate } },
              { endDate: { gte: endDate } }
            ]
          }
        ]
      },
      include: {
        teams: {
          include: {
            members: true,
            equipment: true,
            fixedCosts: true
          }
        }
      }
    });

    return projectsData.map(data => this.toDomainEntity(data));
  }

  private toDomainEntity(data: any): Project {
    const timeline = new DateRange(data.startDate, data.endDate);
    const project = new Project(
      new ProjectId(data.id),
      data.name,
      data.description,
      timeline
    );

    // Carregar teams
    const teams = data.teams?.map(teamData => this.mapTeam(teamData)) || [];
    teams.forEach(team => project.addTeam(team));

    return project;
  }

  private mapTeam(teamData: any): Team {
    const team = new Team(
      new TeamId(teamData.id),
      teamData.name,
      new ProjectId(teamData.projectId)
    );

    // Carregar members
    teamData.members?.forEach(memberData => {
      const member = new Member(
        new MemberId(memberData.id),
        memberData.name,
        memberData.role,
        memberData.description,
        new TeamId(teamData.id)
      );
      
      if (memberData.laborCost) {
        const laborCost = this.mapLaborCost(memberData.laborCost);
        member.assignLaborCost(laborCost);
      }
      
      team.addMember(member);
    });

    // Carregar equipment
    teamData.equipment?.forEach(equipmentData => {
      const equipment = new Equipment(
        new EquipmentId(equipmentData.id),
        equipmentData.name,
        equipmentData.description,
        new EquipmentType(equipmentData.type),
        equipmentData.amortizationYears,
        new Decimal(equipmentData.globalConsumption),
        new TeamId(teamData.id)
      );
      
      team.addEquipment(equipment);
    });

    return team;
  }

  private toPrismaData(project: Project): any {
    return {
      id: project.getId().getValue(),
      name: project.getName(),
      description: project.getDescription(),
      startDate: project.getTimeline().getStartDate(),
      endDate: project.getTimeline().getEndDate()
    };
  }
}
```

### 4. Camada de Apresentação (Presentation Layer)

#### Controllers
```typescript
@Controller('projects')
@ApiTags('Projects')
export class ProjectController {
  constructor(
    private readonly createProjectUseCase: CreateProjectUseCase,
    private readonly getProjectUseCase: GetProjectUseCase,
    private readonly calculateBudgetUseCase: CalculateProjectBudgetUseCase,
    private readonly listProjectsUseCase: ListProjectsUseCase
  ) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo projeto' })
  @ApiResponse({ status: 201, description: 'Projeto criado com sucesso' })
  async create(@Body() dto: CreateProjectDto): Promise<void> {
    const command = new CreateProjectCommand(
      dto.name,
      dto.description,
      dto.startDate,
      dto.endDate
    );
    
    await this.createProjectUseCase.execute(command);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar projeto por ID' })
  async getById(@Param('id') id: string): Promise<ProjectResponseDto> {
    const query = new GetProjectByIdQuery(id);
    return await this.getProjectUseCase.execute(query);
  }

  @Get(':id/budget')
  @ApiOperation({ summary: 'Calcular orçamento do projeto' })
  async calculateBudget(@Param('id') id: string): Promise<ProjectBudgetResponseDto> {
    const query = new CalculateProjectBudgetQuery(id);
    return await this.calculateBudgetUseCase.execute(query);
  }

  @Get()
  @ApiOperation({ summary: 'Listar projetos com filtros' })
  async list(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('active') active?: boolean
  ): Promise<ListProjectsResponseDto> {
    const query = new ListProjectsQuery(
      page,
      limit,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
      active
    );
    
    return await this.listProjectsUseCase.execute(query);
  }
}

@Controller('teams')
@ApiTags('Teams')
export class TeamController {
  constructor(
    private readonly addTeamUseCase: AddTeamToProjectUseCase,
    private readonly addMemberUseCase: AddMemberToTeamUseCase,
    private readonly addEquipmentUseCase: AddEquipmentToTeamUseCase,
    private readonly calculateTeamCostUseCase: CalculateTeamCostUseCase
  ) {}

  @Post()
  @ApiOperation({ summary: 'Adicionar equipe ao projeto' })
  async addToProject(@Body() dto: AddTeamToProjectDto): Promise<void> {
    const command = new AddTeamToProjectCommand(dto.projectId, dto.name);
    await this.addTeamUseCase.execute(command);
  }

  @Post(':id/members')
  @ApiOperation({ summary: 'Adicionar membro à equipe' })
  async addMember(
    @Param('id') teamId: string,
    @Body() dto: AddMemberToTeamDto
  ): Promise<void> {
    const command = new AddMemberToTeamCommand(
      teamId,
      dto.name,
      dto.role,
      dto.description
    );
    await this.addMemberUseCase.execute(command);
  }

  @Post(':id/equipment')
  @ApiOperation({ summary: 'Adicionar equipamento à equipe' })
  async addEquipment(
    @Param('id') teamId: string,
    @Body() dto: AddEquipmentToTeamDto
  ): Promise<void> {
    const command = new AddEquipmentToTeamCommand(
      teamId,
      dto.name,
      dto.description,
      dto.type,
      dto.amortizationYears,
      dto.globalConsumption
    );
    await this.addEquipmentUseCase.execute(command);
  }

  @Get(':id/costs')
  @ApiOperation({ summary: 'Calcular custos da equipe' })
  async calculateCosts(@Param('id') teamId: string): Promise<TeamCostResponseDto> {
    const query = new CalculateTeamCostQuery(teamId);
    return await this.calculateTeamCostUseCase.execute(query);
  }
}
```

#### DTOs
```typescript
export class CreateProjectDto {
  @ApiProperty({ description: 'Nome do projeto' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Descrição do projeto', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Data de início do projeto' })
  @IsDateString()
  startDate: Date;

  @ApiProperty({ description: 'Data de fim do projeto', required: false })
  @IsOptional()
  @IsDateString()
  endDate?: Date;
}

export class AddTeamToProjectDto {
  @ApiProperty({ description: 'ID do projeto' })
  @IsString()
  @IsNotEmpty()
  projectId: string;

  @ApiProperty({ description: 'Nome da equipe' })
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class AddMemberToTeamDto {
  @ApiProperty({ description: 'Nome do membro' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Função/cargo do membro' })
  @IsString()
  @IsNotEmpty()
  role: string;