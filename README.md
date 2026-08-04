# 🤖 Spec-Driven Harness (2026)
**Arquitetura Agêntica focada em Precisão, Autonomia e Qualidade.**

Este repositório implementa um **Harness Engineering** avançado para o desenvolvimento de software assistido por IA. Ele substitui o "Vibe Coding" por um fluxo estruturado de **Spec-Driven Development (SDD)** e **Loop Engineering**.

## 🚀 Instalação Instantânea (Zero Ceremony)

Com um único comando `npx`, configure skills, memória persistente e contrato de execução:

```bash
npx @luizsantiago/agentic-harness install
```

Alternativa legada via bash:

```bash
curl -sSL https://raw.githubusercontent.com/luizssantiago92/spec-driven-harness/main/install.sh | bash
```

### O que o instalador cria

| Artefato | Propósito |
| --- | --- |
| `.cursor/skills/agent-architecture.md` | Skill principal (Cursor) |
| `.claude/skills/agent-architecture.md` | Skill principal (Claude) |
| `.specs/STATE.md` | Decisões e handoff entre sessões |
| `.specs/LESSONS.md` | Playbook de aprendizado contínuo |
| `.specs/features/` | Specs por feature (spec, design, tasks, validation) |
| `.cursorrules` | Contrato de execução (Progressive Disclosure) |


## 🏗️ O Fluxo Spec-Driven

Um pipeline que se ajusta automaticamente à complexidade do projeto:

SPECIFY → DESIGN (opcional) → TASKS (opcional) → EXECUTE (LOOP) → VERIFY

SPECIFY (Obrigatório): Mapeia requisitos em IDs únicos e define o que está fora de escopo.
DESIGN: Define arquitetura, reúso e riscos. Ignorado em mudanças simples.
TASKS: Quebra atômica com critérios binários de sucesso e paralelismo.
EXECUTE: Implementação em loops guiada por testes e commits atômicos.
VERIFY (Obrigatório): Validação independente por um subagente especializado.

## ⚠️ Regras Críticas (Contrato de Execução)

Test-First Imperative: Nenhum código é escrito antes que a spec e os testes derivados dos critérios de aceite sejam aprovados.
Autor ≠ Verificador: Após a última tarefa, um Verificador Independente (contexto limpo) deve validar a entrega. Ele nunca é o autor do código.
Discrimination Sensor: O verificador deve injetar falhas propositais (mutantes) para confirmar se os testes realmente detectam erros.
Evidence-or-Zero: Um requisito só é considerado "pronto" se houver evidência (arquivo e linha) de um teste assertivo passando.

## 🧠 Persistência e Memória (.specs/)
Para combater a "amnésia entre sessões", a skill mantém os seguintes artefatos:
STATE.md: Registro de decisões técnicas e snapshot do progresso para passagens de bastão (handoff).
LESSONS.md: Playbook de aprendizado contínuo. Falhas de verificação tornam-se lições locais para evitar repetição de erros.
features/[feature]/: Contém a spec.md, design.md, tasks.md e o relatório final de validation.md.

## 🔁 Loop Engineering & Harness
Diferente do prompt isolado, esta skill opera em loops autônomos:
Loop de Correção: Se o sensor (Harness) falhar, o agente deve corrigir o código e retestar até 3 vezes antes de chamar um humano.
Harness Operacional: O controle é feito por ferramentas externas (test runners, linters, compiladores como Rust) e não por autodeclaração da IA.

## 🛠️ Comandos Disponíveis

/specify: Define requisitos e IDs de spec.

/plan: Cria o design técnico e arquitetura.

/tasks: Breakdown atômico em tarefas paralelas ou sequenciais.

/loop: Inicia a implementação autônoma em loop.

/verify: Aciona a validação técnica independente.

## ⛓️ Cadeia de Verificação de Conhecimento

Ao tomar qualquer decisão técnica, siga esta ordem estritamente:

Codebase: Verifique convenções e padrões já em uso.
Docs: Leia o README e o STATE.md (Decisões).
MCP/Context: Consulte documentações atualizadas via ferramentas externas.
Web Search: Busque padrões de comunidade e fontes oficiais.
Incerteza: Se não encontrar, diga "Eu não sei". Jamais invente APIs ou comportamentos.
Nota: Esta skill é otimizada para modelos de alto raciocínio (Opus, GPT-4o) durante o planejamento e modelos rápidos/baratos (Sonnet, Composer) durante a execução do loop

## 📦 Publicação no npm

### Pré-requisitos

1. Conta npm com username `luizsantiago` (scope `@luizsantiago`)
2. Secret `NPM_TOKEN` configurado no GitHub (Settings → Secrets → Actions)

### Publicar via GitHub Actions (recomendado)

1. Token npm criado em https://www.npmjs.com/settings/luizsantiago/tokens (Packages: Read and Write)
2. Secret `NPM_TOKEN` configurado no GitHub (Settings → Secrets → Actions)
3. Vá em **Actions → Publish to npm → Run workflow**
4. Escolha o tipo de bump (`patch`, `minor`, `major`)

Alternativamente, crie um **GitHub Release** — o workflow publica automaticamente na versão do tag.

### Publicar manualmente

```bash
npm login
npm test
npm publish --access public
```

### Desenvolvimento local

```bash
npm test                              # roda testes
node index.js install                 # instala harness no cwd
HARNESS_SKILL_URL=http://127.0.0.1:.../skill.md node index.js install  # URL customizada
```
