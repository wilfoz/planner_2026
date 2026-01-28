# Feature Design Doc (FDD) - Gestão de Produções

## 1. Contexto
O lançamento de produções é a atividade core do sistema. Diariamente, as equipes em campo reportam o que foi executado (ex: montagem de torre, lançamento de cabo). A precisão desses dados alimenta os dashboards gerenciais.

## 2. Objetivos Técnicos
*   Criar fluxo de lançamento robusto e validado.
*   Garantir integridade referencial (Torre, Equipe, Atividade).
*   Evitar lançamentos duplicados ou inconsistentes (ex: data fim < data início).
*   Permitir edição e exclusão auditáveis.

## 3. Fluxos Detalhados

### 3.1 Criação de Produção
1.  **Usuário** acessa formulário "Nova Produção".
2.  **Sistema** carrega listas de Obras, Equipes e Atividades ativas.
3.  **Usuário** seleciona Obra -> Sistema filtra Torres dessa obra.
4.  **Usuário** preenche:
    *   Torres (Multi-select)
    *   Equipe
    *   Atividade
    *   Data/Hora Início e Fim
    *   Comentários (Opcional)
5.  **Frontend** valida:
    *   Campos obrigatórios.
    *   Data Fim >= Data Início.
6.  **Backend** valida:
    *   Se a torre já tem essa atividade concluída (regra de negócio opcional).
    *   Existência dos IDs referenciados.
7.  **Sistema** salva e retorna confirmação.

## 4. Contratos de API

### POST /productions
**Request Body:**
```json
{
  "workId": "uuid",
  "teamId": "uuid",
  "activityId": "uuid",
  "towerIds": ["uuid-1", "uuid-2"], // Suporte a lançamento em lote
  "startDate": "2024-01-24T08:00:00Z",
  "endDate": "2024-01-24T17:00:00Z",
  "comments": "Montagem finalizada com sucesso."
}
```

**Response (201 Created):**
```json
{
  "id": "uuid-production",
  "status": "SUCCESS",
  "created_at": "..."
}
```

### Validações de Erro (400 Bad Request)
*   "Data final não pode ser anterior à inicial"
*   "Torre não pertence à obra selecionada"
*   "Equipe inativa"

## 5. Modelo de Dados (Schema)
*   **Production**
    *   `id`: UUID
    *   `work_id`: FK
    *   `team_id`: FK
    *   `activity_id`: FK
    *   `tower_id`: FK
    *   `start_date`: DateTime
    *   `end_date`: DateTime
    *   `status`: Enum (DRAFT, PUBLISHED)

## 6. Critérios de Aceite
1.  Formulário carrega dependências (combos) corretamente.
2.  Validação de data impede envio incorreto.
3.  Lançamento persiste no banco com relacionamentos corretos.
4.  Painel de listagem atualiza imediatamente após lançamento.
