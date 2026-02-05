export interface Task {
  id: string;
  code: number;
  stage: string;
  group: string;
  name: string;
  unit: string;
}

export interface CreateTaskDto {
  code: number;
  stage: string;
  group: string;
  name: string;
  unit: string;
  work_id: string;
}

export interface UpdateTaskDto extends Partial<CreateTaskDto> { }

export interface TaskDefinition {
  name: string;
}

export interface GroupDefinition {
  name: string;
  tasks: TaskDefinition[];
}

export interface StageDefinition {
  name: string;
  groups?: GroupDefinition[];
  tasks?: TaskDefinition[]; // For stages without groups
}

export const TASK_HIERARCHY: StageDefinition[] = [
  {
    name: 'TOPOGRAFIA',
    tasks: [
      { name: 'Rede Basica Geodésica' },
      { name: 'Implantação de Vértices' },
      { name: 'Implantação de Bandeiras' },
      { name: 'Levantamento de Interferências' },
      { name: 'Conferência de Locação' },
      { name: 'Conferência de Perfil' },
      { name: 'Conferência de Ponto Crítico' },
      { name: 'Locação de Piquete Central' },
      { name: 'Seção Diagonal (PLDV)' },
      { name: 'Locação de Cavas' }
    ]
  },
  {
    name: 'ESTUDOS DO SOLO',
    tasks: [
      { name: 'Sondagem' },
      { name: 'Medição de Resistividade do Solo' }
    ]
  },
  {
    name: 'ACESSO PARA CONSTRUÇÃO',
    tasks: [
      { name: 'Croqui de Acesso' },
      { name: 'Abertura de Acesso' },
      { name: 'Placas de Acesso' },
      { name: 'Recuperação de Acessos' },
      { name: 'Instalação de Bueiros' }
    ]
  },
  {
    name: 'SUPRESSÃO',
    tasks: [
      { name: 'Limpeza de Faixa (Vão da Torre)' },
      { name: 'Limpeza de Área de Torre' },
      { name: 'Corte Seletivo' },
      { name: 'Instalação de Colchetes / Porteiras' },
      { name: 'Retirada Madeira da Faixa' }
    ]
  },
  {
    name: 'BLOCOS PRÉ-MOLDADOS',
    tasks: [
      { name: 'Fabricação' },
      { name: 'Transporte' },
      { name: 'Instalação' }
    ]
  },
  {
    name: 'ARMAÇÃO CORTE E DOBRA',
    tasks: [
      { name: 'Fabricação' },
      { name: 'Transporte' },
      { name: 'Instalação' }
    ]
  },
  {
    name: 'OBRA CIVIL',
    groups: [
      {
        name: 'Escavação',
        tasks: [
          { name: 'Escavação Torres Estaiadas' },
          { name: 'Escavação Torres Autoportantes' }
        ]
      },
      {
        name: 'Nivelamento',
        tasks: [
          { name: 'Nivelamento Torres Estaiadas' },
          { name: 'Nivelamento Torres Autoportantes' }
        ]
      },
      {
        name: 'Concretagem',
        tasks: [
          { name: 'Concretagem Torres Estaiadas' },
          { name: 'Concretagem Torres Autoportantes' }
        ]
      },
      {
        name: 'Outros',
        tasks: [
          { name: 'Ancoragem em Rocha' },
          { name: 'Reaterro' },
          { name: 'Fundação Estaiada 100%' },
          { name: 'Fundação Autoportante 100%' }
        ]
      }
    ]
  },
  {
    name: 'ATERRAMENTO',
    tasks: [
      { name: 'Instalação de Fio Contrapeso' },
      { name: 'Medição de Resistência' },
      { name: 'Seccionamento de Cercas' }
    ]
  },
  {
    name: 'PÁTIO',
    tasks: [
      { name: 'Escalonamento de Estrutura' },
      { name: 'Corte Cabos dos Estais' },
      { name: 'Transporte de Estrutura' }
    ]
  },
  {
    name: 'MONTAGEM',
    groups: [
      {
        name: 'Montagem Torres Estaiadas',
        tasks: [
          { name: 'Montagem no Solo' },
          { name: 'Revisão no Solo' },
          { name: 'Içamento' },
          { name: 'Giro e Prumo / Flambagem' },
          { name: 'Retensionamento dos Estais' },
          { name: 'Revisão Final' }
        ]
      },
      {
        name: 'Montagem Torres Autoportantes',
        tasks: [
          { name: 'Pré-Montagem' },
          { name: 'Montagem' },
          { name: 'Revisão' }
        ]
      }
    ]
  },
  {
    name: 'LANÇAMENTO',
    groups: [
      {
        name: 'Lançamento Cabos Para-raios',
        tasks: [
          { name: 'Lançamento' },
          { name: 'Nivelamento' },
          { name: 'Grampeamento / Ancoragem' },
          { name: 'Emendas' }
        ]
      },
      {
        name: 'Lançamento Cabos OPGW',
        tasks: [
          { name: 'Instalação de Bandolas' },
          { name: 'Piloto' },
          { name: 'Lançamento' },
          { name: 'Nivelamento' },
          { name: 'Grampeamento / Ancoragem' },
          { name: 'Emendas' }
        ]
      },
      {
        name: 'Lançamento Cabos Condutores',
        tasks: [
          { name: 'Cavaletes de Proteção' },
          { name: 'Instalação de Bandolas' },
          { name: 'Piloto' },
          { name: 'Lançamento' },
          { name: 'Nivelamento' },
          { name: 'Grampeamento' },
          { name: 'Espaçadores / Amortecedores' },
          { name: 'Ancoragem' },
          { name: 'Jumper' }
        ]
      }
    ]
  },
  {
    name: 'COMISSIONAMENTO',
    tasks: [
      { name: 'Revisão Final de Solo' },
      { name: 'Revisão Final de Torre' },
      { name: 'Entrega da LT' }
    ]
  }
];
