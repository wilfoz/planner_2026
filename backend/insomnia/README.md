# LT-PLANNER - Guia do Insomnia

Este guia explica como importar e usar a coleção de requests para testar a API do LT-PLANNER.

---

## 1. Importar a Coleção

1. Abra o **Insomnia**
2. Clique em **Create** → **Import**
3. Selecione **File** e navegue até:
   ```
   lt-budget/backend/insomnia/LT-PLANNER.insomnia.json
   ```
4. Clique em **Scan** e depois **Import**
5. A coleção **"LT - PLANNER"** aparecerá na sidebar

---

## 2. Configurar o Environment

1. No canto superior esquerdo, clique em **No Environment** → **Manage Environments**
2. Selecione **Base Environment** para ver as variáveis:

| Variável | Descrição | Valor Padrão |
|----------|-----------|--------------|
| `baseUrl` | URL da API | `http://localhost:3000` |
| `accessToken` | Token JWT (preenchido automaticamente após login) | - |
| `userEmail` | Email do usuário (gerado automaticamente no signup) | - |
| `userPassword` | Senha padrão para testes | `123456` |
| `workId` | ID da obra atual | - |
| `towerId` | ID da torre atual | - |
| `productionId` | ID da produção atual | - |

3. Se sua API estiver em outra porta, altere o `baseUrl`
4. Clique em **Done**

---

## 3. Selecionar Environment

1. No dropdown de environments (canto superior esquerdo)
2. Selecione **Local** (sub-environment do Base Environment)

---

## 4. Ordem de Execução dos Requests

> ⚠️ **IMPORTANTE**: Siga esta ordem para evitar erros de dependência!

### Passo 1: Autenticação
```
Users → Signup (POST /users)      # Cria usuário e gera email automático
Users → Login (POST /users/login) # Obtém access token
```

### Passo 2: Criar Dados Base
```
Employees  → Create (POST /employees)
Equipments → Create (POST /equipments)
Teams      → Create (POST /teams)      # Usa employeeId e equipmentId
Foundations → Create (POST /foundation)
```

### Passo 3: Criar Work (Obra)
```
Works → Create (POST /works)           # OBRIGATÓRIO antes de Towers e Productions
```

### Passo 4: Criar Dependentes de Work
```
Towers     → Create (POST /tower)      # Requer workId e foundationId
Task       → Create (POST /task)
Production → Create (POST /production) # Requer workId e taskId
```

### Passo 5: Testar Operações
```
- List (GET) para listar todos
- Get (GET /:id) para buscar por ID
- Update (PUT /:id) para atualizar
```

---

## 5. Executar Requests

### Executar Manualmente
1. Clique no request desejado na sidebar
2. Clique em **Send**
3. Veja a resposta no painel direito

### Ver Testes Automáticos
Cada request tem scripts de teste que validam:
- Status code esperado (201 para criação, 200 para sucesso, 204 para delete)
- Estrutura da resposta

Para ver resultados dos testes:
1. Após enviar o request, clique na aba **Timeline**
2. Ou veja o painel de **Tests** para resultados pass/fail

---

## 6. Variáveis Automáticas

Os scripts salvam IDs automaticamente no environment:

| Após executar | Variável salva |
|---------------|----------------|
| Signup | `userId` |
| Login | `accessToken` |
| Create Employee | `employeeId` |
| Create Equipment | `equipmentId` |
| Create Team | `teamId` |
| Create Foundation | `foundationId` |
| Create Tower | `towerId` |
| Create Task | `taskId` |
| Create Production | `productionId` |
| Create Work | `workId` |

---

## 7. Limpar Dados de Teste

Use o grupo **Cleanup** para deletar os recursos criados:

```
Cleanup → Delete Production
Cleanup → Delete Tower
Cleanup → Delete Foundation
Cleanup → Delete Task
Cleanup → Delete Work
Cleanup → Delete Team
Cleanup → Delete Equipment
Cleanup → Delete Employee
Cleanup → Delete User
```

> ⚠️ Delete na ordem inversa da criação para evitar erros de foreign key!

---

## 8. Dicas

- **Token expirado?** Execute Login novamente
- **IDs vazios?** Execute os requests Create na ordem correta
- **Resetar tudo?** Execute Signup para limpar todas as variáveis

---

## Troubleshooting

| Erro | Solução |
|------|---------|
| `401 Unauthorized` | Execute Login para obter novo token |
| `400 Bad Request - work_id required` | Execute "Works → Create" primeiro |
| `404 Not Found` | Verifique se o ID existe no environment |
| `Connection refused` | Verifique se o backend está rodando (`npm run start:dev`) |
