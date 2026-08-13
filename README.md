# Spec-Driven Harness (2026)

[![npm version](https://img.shields.io/npm/v/@luizsantiago/agentic-harness.svg)](https://www.npmjs.com/package/@luizsantiago/agentic-harness)
[![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Framework agêntico que une **Spec-Driven Development**, **Loop** e **Harness Engineering**. Hub SDD + **5 skills irmãs** + **references por fase** + **gates determinísticos em Python**, regras pt-BR/EN, memória `.specs/` e contrato `.cursorrules`. Fluxo **Specify→Verify** com verificador independente, test-first, `STATE.md` e `LESSONS.md`.

A diferença em relação a um conjunto de instruções: os **gates rodam como código**. Spec incompleta, task sem critério ou feature sem evidência de teste **não passam** — o script sai com código ≠ 0 e o agente para.

## Requisitos

| Runtime | Para quê | Obrigatório |
| --- | --- | --- |
| Node.js 18+ | `npx` install e CLI | Sim |
| Python 3.10+ | Gates estruturais | Recomendado |

Sem Python o harness entra em **modo degradado**: as skills continuam funcionando e o agente executa as mesmas checagens manualmente contra o checklist da reference. O padrão não cai — só muda quem verifica.

## Instalação

```bash
npx @luizsantiago/agentic-harness install
```

Reinstalar atualiza skills, references e scripts, e faz **upgrade** do bloco harness em `.cursorrules` sem sobrescrever `STATE.md`, `LESSONS.md` ou regras customizadas.

### O que o instalador cria

| Artefato | Propósito |
| --- | --- |
| `.cursor/skills/agent-architecture.md` | **Hub** — contrato, fases, gates, roteador de complexidade |
| `.cursor/skills/references/*.md` | Procedimentos por fase (8 arquivos) |
| `.cursor/skills/task-graph-engineering.md` | Task DAG, paralelismo, diamond verify, sub-agentes |
| `.cursor/skills/engineering-standards.md` | Locale, secure coding, one-writer-per-file |
| `.cursor/skills/security-review.md` | Checklist OWASP para `/verify` |
| `.cursor/skills/git-handoff.md` | Git sync, reconcile, handoff de sessão |
| `.claude/skills/**` | Mesmas skills e references para Claude |
| `.cursor/rules/locale-and-standards.mdc` | Regra global Cursor (pt-BR chat, artefatos em inglês) |
| `.specs/harness/scripts/*.py` | **Gates determinísticos** |
| `.specs/STATE.md` | Decisões (`AD-NNN`) e handoff |
| `.specs/LESSONS.md` | Lições destiladas de falhas de verificação |
| `.cursorrules` | Contrato de execução (Progressive Disclosure) |

## Gates determinísticos

| Momento | Comando |
| --- | --- |
| Antes de confirmar a spec | `python3 .specs/harness/scripts/validate_spec.py .specs/features/X/spec.md` |
| Antes de aprovar as tasks | `python3 .specs/harness/scripts/validate_tasks.py .specs/features/X/tasks.md` |
| A cada commit | `python3 .specs/harness/scripts/check_commit.py --message "feat: ..."` |
| Antes de fechar a feature | `python3 .specs/harness/scripts/validate_state.py .specs/features/X` |

Ou via CLI, sem decorar caminhos:

```bash
npx @luizsantiago/agentic-harness validate-spec .specs/features/auth/spec.md
npx @luizsantiago/agentic-harness validate-tasks .specs/features/auth/tasks.md
npx @luizsantiago/agentic-harness validate-state .specs/features/auth
npx @luizsantiago/agentic-harness check-commit --message "feat(auth): add token refresh"
```

O que cada gate bloqueia:

| Gate | Bloqueia |
| --- | --- |
| `validate_spec` | Seções faltando, IDs malformados, requisito sem critério de aceite, placeholders (`TBD`, `TODO`) |
| `validate_tasks` | Campo obrigatório ausente, dependência inexistente, dependência para frente, ciclo, task vaga |
| `check_commit` | Fora do Conventional Commits, tipo desconhecido, header > 72 chars, ponto final |
| `validate_state` | `validation.md` ausente, verdict != PASS, sem evidência `file:line`, task em aberto |

Saída ≠ 0 significa **STOP**: corrigir o artefato e rodar o gate de novo.

Opcional — travar o formato de commit sem depender do agente:

```bash
# .git/hooks/commit-msg
#!/bin/sh
python3 .specs/harness/scripts/check_commit.py --file "$1"
```

## Fluxo Spec-Driven

```
SPECIFY → DISCUSS (condicional) → DESIGN (opcional) → TASKS (opcional) → EXECUTE (loop) → VERIFY
```

| Fase | Reference | Skill irmã | Gate |
| --- | --- | --- | --- |
| **Specify** | `references/specify.md` | — | `validate_spec.py` |
| **Discuss** | `references/discuss.md` | — | — |
| **Design** | `references/design.md` | — | — |
| **Tasks** | `references/tasks.md` | `task-graph-engineering` | `validate_tasks.py` |
| **Execute** | `references/implement.md` | `engineering-standards` | `check_commit.py` |
| **Verify** | `references/validate.md` | `security-review` | `validate_state.py` |
| **Handoff** | `references/memory.md` | `git-handoff` | — |
| **Quick** | `references/quick-mode.md` | — | `check_commit.py` |

### Roteador de complexidade

| Tier | Escopo | Caminho |
| --- | --- | --- |
| **Quick** | ≤3 arquivos, sem decisão de design | `quick-mode` — descrever, implementar, verificar, commitar |
| **Simples** | 2–5 arquivos | Specify → Execute → Verify |
| **Médio** | Feature nova, <10 tasks | Specify → Tasks → Execute → Verify |
| **Complexo** | Arquitetura, API, infra | Specify → Discuss → Design → Tasks → Execute → Verify |
| **Paralelo** | Trabalho divisível, multi-agente | Acima + `/task-graph` |

**Safety valve** — mesmo pulando Tasks, o Execute começa listando os passos atômicos. Se aparecerem mais de 5 passos ou dependências reais, para e cria `tasks.md`.

## Contrato de Execução

1. **Test-First Imperative** — Testes derivam dos critérios de aceite e afirmam o resultado da spec, nunca a implementação.
2. **Gate antes de "pronto"** — Quem decide é o test runner, não a autoavaliação.
3. **Um commit atômico por task** — Inclui código, testes e o check da task no `tasks.md`.
4. **Autor ≠ Verificador** — Após a última task, `/verify` roda com contexto limpo. Obrigatório, nunca solicitado.
5. **Blast radius** — Aprovar spec/tasks autoriza implementação e commit **locais**. `git push`, deploy e operações destrutivas exigem OK explícito.

## Persistência e memória (`.specs/`)

| Caminho | Função |
| --- | --- |
| `STATE.md` | Feature ativa, próximo passo, blockers, ideias adiadas, decisões `AD-NNN` |
| `LESSONS.md` | Lições de falhas fundamentadas (mutante sobrevivente, critério impreciso) |
| `project/PROJECT.md` · `project/ROADMAP.md` | Visão, stack, milestones |
| `quick/NNN-slug/` | Tasks de quick mode |
| `features/[feature]/spec.md` | Requisitos e critérios de aceite |
| `features/[feature]/context.md` | Decisões do owner para gray areas |
| `features/[feature]/design.md` | Arquitetura (tier Complexo) |
| `features/[feature]/tasks.md` | Breakdown atômico |
| `features/[feature]/task-graph.md` | DAG de jobs e grupos paralelos |
| `features/[feature]/validation.md` | Relatório do verificador independente |
| `harness/scripts/` | Gates determinísticos |

**Artefatos lazy** — nunca criar `design.md`, `tasks.md` ou `context.md` vazios. Arquivo vazio finge que uma fase rodou; ausência é o estado correto de uma fase pulada.

### Retomada de sessão

`STATE.md` pode estar desatualizado. No início da sessão, reconcilie contra o git — **evidência vence**:

```bash
git branch --show-current
git status --porcelain
git log --oneline -10
```

## Verificação independente

- **Spec-anchored check** — cada critério tem teste que afirma o resultado definido na spec
- **Discrimination sensor** — mutantes injetados em cópia isolada (worktree temporário), nunca `git stash`
- **Security review** — checklist OWASP, com caminho leve justificado para mudanças sem auth/API
- **Evidence-or-zero** — requisito só é "pronto" com `file:line` de teste assertivo passando
- **Loop limitado** — fix → re-verify no máximo 3 vezes antes de escalar

## Comandos

| Comando | Reference | Ação |
| --- | --- | --- |
| `/specify` | `specify.md` | Requisitos e IDs de spec |
| `/discuss` | `discuss.md` | Resolver gray areas em `context.md` |
| `/plan` | `design.md` | Design técnico |
| `/tasks` | `tasks.md` | Breakdown atômico |
| `/task-graph` | `task-graph-engineering.md` | Desenhar o DAG de jobs |
| `/loop` | `implement.md` | Implementação autônoma |
| `/verify` | `validate.md` | Validação independente |
| `/quick` | `quick-mode.md` | Express lane para ≤3 arquivos |
| `/handoff` | `memory.md` | Atualiza STATE, commita `.specs/`, sem push |
| `/sync-spec` | `git-handoff.md` | Commita artefatos da feature atual |

## Skills irmãs (use juntas)

| Skill | Camada | Papel |
| --- | --- | --- |
| `agent-architecture.md` | **Processo** | Hub — contrato, fases, gates, roteador |
| `task-graph-engineering.md` | **Topologia** | Task DAG, stop rule, diamond verify, batches de sub-agentes |
| `engineering-standards.md` | **Qualidade** | Locale, secure coding, one-writer-per-file, surgical changes |
| `security-review.md` | **Verificação** | Checklist OWASP para `/verify` |
| `git-handoff.md` | **Persistência** | Git sync, reconcile, template STATE |

```
agent-architecture       →  O QUE fazer e QUANDO (fases + contrato)
task-graph-engineering →  COMO conectar jobs (DAG, paralelismo)
engineering-standards  →  COMO escrever código e commits
security-review        →  segurança na verificação
git-handoff            →  persistir memória e specs no git
```

## Locale

| Contexto | Idioma |
| --- | --- |
| Chat com o owner | Português brasileiro (pt-BR) |
| Código, testes, commits, PRs, `.specs/` | Inglês |

Para preferência pessoal em todos os projetos, adicione em **Cursor → Settings → Rules**:

> Always respond to me in Brazilian Portuguese (pt-BR). Project artifacts remain in English.

## Cadeia de verificação de conhecimento

1. **Codebase** — Convenções e padrões já em uso
2. **Docs** — README, `docs/`, `.specs/STATE.md`
3. **MCP/Context** — Documentação via ferramentas externas
4. **Web Search** — Fontes oficiais e padrões de comunidade
5. **Incerteza** — Se não encontrar, diga "Eu não sei". Nunca invente APIs.

> Planejamento: modelos de alto raciocínio. Execução: modelos rápidos. Verificador: tier médio-alto (raciocínio adversarial).

## Migração 0.1.x → 0.2.0

| Mudança | Impacto |
| --- | --- |
| Hub + `references/` | `agent-architecture.md` virou índice; procedimentos estão em `references/` |
| Gates Python | Novo diretório `.specs/harness/scripts/` — commite junto com `.specs/` |
| Novo template `STATE.md` | **Não sobrescreve** arquivos existentes; migre manualmente se quiser as seções novas |
| Novos artefatos | `context.md`, `project/`, `quick/` — criados sob demanda |
| Python | Opcional; sem ele o harness roda em modo degradado |

Basta rodar `npx @luizsantiago/agentic-harness install` novamente.

---

## Estrutura do repositório

```
spec-driven-harness/
├── index.js                        # CLI: install + gates
├── lib/                            # Instalador e ponte com Python
├── skills/
│   ├── agent-architecture.md       # Hub
│   ├── references/                 # 8 procedimentos de fase
│   ├── task-graph-engineering.md
│   ├── engineering-standards.md
│   ├── security-review.md
│   └── git-handoff.md
├── rules/locale-and-standards.mdc
├── scripts/                        # Gates determinísticos (Python)
├── test/
│   ├── install.test.js             # Testes do instalador (Node)
│   └── test_gates.py               # Testes dos gates (Python)
└── .github/workflows/
```

Pacote npm: [@luizsantiago/agentic-harness](https://www.npmjs.com/package/@luizsantiago/agentic-harness)

## Desenvolvimento

```bash
git clone https://github.com/luizssantiago92/spec-driven-harness.git
cd spec-driven-harness
npm test              # instalador + gates
npm run test:node
npm run test:gates
node index.js install
```

### Publicar no npm (mantenedores)

1. Token em [npmjs.com/settings/luizsantiago/tokens](https://www.npmjs.com/settings/luizsantiago/tokens)
2. Secret `NPM_TOKEN` no GitHub (Settings → Secrets → Actions)
3. **Actions → Publish to npm → Run workflow** → `patch`, `minor` ou `major`

## Créditos

Padrões de task graph adaptados de [graph-engineering](https://github.com/codejunkie99/graph-engineering) (MIT).

## Licença

MIT
