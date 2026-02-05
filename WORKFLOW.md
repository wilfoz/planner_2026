Atue como um **Senior DevOps & IDE Configuration Specialist**.
Sua tarefa é fazer o "Bootstrap" do ambiente de desenvolvimento autônomo neste repositório.

Siga estas instruções passo a passo para configurar os Workflows de Agentes:

### Passo 1: Estrutura de Pastas
Verifique se existe uma pasta chamada `.antigravity` na raiz do projeto. Se não existir, crie-a.

### Passo 2: Criação dos Arquivos de Configuração
Crie os seguintes arquivos dentro da pasta `.antigravity/` com o conteúdo exato fornecido abaixo.

#### Arquivo 1: `.antigravity/project.rules`
(Este arquivo define as regras globais para todos os agentes)
```markdown
# Regras de Engenharia e Tech Stack
1. **Stack:** TypeScript, Angular 19+ (Standalone Components), NestJS.
2. **Estilo:** Clean Code, SOLID, Arquitetura Hexagonal (DDD).
3. **Backend Structure:** Use a estrutura de `contexts` (Application, Domain, Infrastructure).
4. **Banco de Dados:** Use **Prisma** para ORM e gerenciamento de banco de dados.
    - Schema location: `backend/src/shared/infrastructure/database/prisma/schema.prisma`
5. **Testes:** Todo código novo DEVE ter testes unitários.
6. **Segurança:** Nunca exponha secrets no código. Valide todos os inputs.
7. **UI Components:** Considere componentes no frontend existentes como base.
    - Use Signals para gerenciamento de estado.
    - Componentes são Standalone por padrão (`standalone: true` é default, não adicione explicitamente).
8. **Versionamento:** Use Git para controlar versões do código.
9. **Documentação:** Use Swagger para documentar APIs.
10. **Deploy:** Use Docker para containerização.
11. **CI/CD:** Use GitHub Actions para CI/CD.

### Arquivo 2: .antigravity/workflow-repo-refactor.yaml
### (Workflow para modernização e refatoração de legado)

name: "Repo-Wide Modernization"
description: "Refatora código legado para padrões modernos com segurança de testes."
agents:
  - id: tech-lead
    name: "Tech Lead"
    model: "gemini-3.0-pro-exp"
    skills: ["file-search", "git-branch"]
    system_prompt: "Analise a estrutura de contextos, crie branch de refatoração e liste arquivos críticos em backend/src/contexts ou frontend/src/app."
  - id: qa-guardian
    name: "Guardian (QA)"
    model: "gemini-3.0-flash"
    skills: ["terminal", "test-runner"]
    system_prompt: "Crie testes para código legado antes de qualquer mudança. Garanta o 'Green State'."
  - id: code-architect
    name: "Architect"
    model: "gemini-3.0-flash"
    skills: ["file-edit"]
    system_prompt: "Refatore para TypeScript/Clean Code seguindo Hexagonal Arch. Se quebrar testes, corrija imediatamente."
pipeline:
  trigger: manual
  steps:
    - id: setup
      agent: tech-lead
      action: "Criar branch 'refactor/modernization' e listar arquivos .js/.ts antigos."
    - id: process-loop
      type: foreach
      items: "{{setup.output_files}}"
      steps:
        - agent: qa-guardian
          action: "Criar testes de segurança para {{item}}"
        - agent: code-architect
          action: "Refatorar {{item}} mantendo compatibilidade com testes."
        - agent: qa-guardian
          action: "Validar refatoração."

Arquivo 3: .antigravity/workflow-new-feature.yaml
(Workflow para criar novas funcionalidades do zero)

YAML
name: "Create New Feature"
description: "Cria features novas: Planejamento -> Código -> Testes."
inputs:
  feature_request: { type: string, description: "O que vamos construir?" }
agents:
  - id: tech-architect
    name: "Architect"
    model: "gemini-2.0-pro-exp"
    system_prompt: "Planeje os arquivos necessários baseando-se no @project.rules e na estrutura de Contextos (Backend) e Features (Frontend). Não code, apenas planeje."
  - id: feature-builder
    name: "Builder"
    model: "gemini-2.0-flash"
    skills: ["file-create", "file-edit"]
    system_prompt: "Implemente o plano do arquiteto. Crie arquivos e lógica usando Prisma e Angular Signals."
  - id: qa-guardian
    name: "QA"
    model: "gemini-2.0-flash"
    system_prompt: "Crie testes para a nova feature. Garanta cobertura de 90%."
pipeline:
  trigger: manual
  steps:
    - id: plan
      agent: tech-architect
      action: "Criar plano de arquivos para: {{feature_request}}"
    - id: build
      agent: feature-builder
      action: "Executar plano de criação."
    - id: verify
      agent: qa-guardian
      action: "Criar e rodar testes."
Arquivo 4: .antigravity/workflow-pr-gen.yaml
(Workflow para gerar o Pull Request)

YAML
name: "Generate Perfect PR"
description: "Gera descrição de PR baseada em git diff."
agents:
  - id: pr-writer
    name: "PR Bot"
    model: "gemini-2.0-pro-exp"
    skills: ["git-diff", "github-cli"]
    system_prompt: "Escreva um PR semântico (Conventional Commits). Liste mudanças técnicas e breaking changes. Mencione migrações de banco (Prisma) se houver."
pipeline:
  trigger: manual
  steps:
    - id: analyze
      agent: pr-writer
      action: "Analisar git diff main...HEAD e gerar texto Markdown."
    - id: create
      agent: pr-writer
      action: "Salvar como PR_DRAFT.md"

Passo 3: Finalização
Após criar todos os arquivos, liste o conteúdo da pasta .antigravity no terminal para confirmar que tudo foi criado corretamente e me avise: "Configuração Antigravity concluída com sucesso 🚀".