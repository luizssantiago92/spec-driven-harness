# Spec-Driven Harness (2026)

[![npm version](https://img.shields.io/npm/v/@luizsantiago/agentic-harness.svg)](https://www.npmjs.com/package/@luizsantiago/agentic-harness)
[![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Framework agêntico que une **Spec-Driven Development**, **Loop** e **Harness Engineering**. **5 skills irmãs** (SDD, task graphs, engenharia, segurança, git handoff), regras pt-BR/EN, memória `.specs/`, contrato `.cursorrules`. Fluxo **Specify→Verify** com verificador independente, test-first, `STATE.md` e `LESSONS.md`.

Instalação Zero Ceremony via npx — skills baixadas do GitHub na hora do install; o pacote npm contém apenas o CLI.

## Instalação

```bash
npx @luizsantiago/agentic-harness install
```

Reinstalar atualiza skills e faz **upgrade** do bloco harness em `.cursorrules` sem sobrescrever `STATE.md`, `LESSONS.md` ou regras customizadas.

Alternativa legada:

```bash
curl -sSL https://raw.githubusercontent.com/luizssantiago92/spec-driven-harness/main/install.sh | bash
```

### O que o instalador cria

| Artefato | Propósito |
| --- | --- |
| `.cursor/skills/agent-architecture.md` | SDD workflow, roteador de complexidade, retomada de sessão |
| `.cursor/skills/task-graph-engineering.md` | Task DAG, paralelismo, stop rule, diamond verify |
| `.cursor/skills/engineering-standards.md` | Locale, secure coding, one-writer-per-file |
| `.cursor/skills/security-review.md` | Checklist OWASP para `/verify` |
| `.cursor/skills/git-handoff.md` | Git sync, template STATE, handoff de sessão |
| `.claude/skills/*.md` | Mesmas 5 skills para Claude |
| `.cursor/rules/locale-and-standards.mdc` | Regra global Cursor (pt-BR chat, artefatos em inglês) |
| `.specs/STATE.md` | Decisões e handoff entre sessões |
| `.specs/LESSONS.md` | Playbook de aprendizado contínuo |
| `.specs/features/` | Specs por feature |
| `.cursorrules` | Contrato de execução (Progressive Disclosure) |

### Cursor User Rules (opcional)

Para preferência pessoal em **todos** os projetos, adicione em **Cursor → Settings → Rules**:

> Always respond to me in Brazilian Portuguese (pt-BR). Project artifacts remain in English.

As regras do projeto (`.cursor/rules/`) são versionadas e compartilhadas com o time via git.

## Fluxo Spec-Driven (5 fases)

```
SPECIFY → DESIGN (opcional) → TASKS (opcional) → EXECUTE (loop) → VERIFY
```

| Fase | Obrigatória | Descrição |
| --- | --- | --- |
| **Specify** | Sim | Requisitos em IDs únicos (`REQ-001`); define out-of-scope |
| **Design** | Não | Arquitetura, reúso e riscos |
| **Tasks** | Não | Quebra atômica; fake edges e stop rule |
| **Execute** | Sim | Loops test-first, commits atômicos |
| **Verify** | Sim | Validação independente (diamond pattern) |

### Roteador de complexidade

Nem toda mudança precisa de todas as fases:

| Tier | Exemplos | Caminho |
| --- | --- | --- |
| **Trivial** | Typo, copy, bug de 1 arquivo | Specify mínimo → Execute → Verify |
| **Simples** | 2–5 arquivos | Specify → Execute → Verify |
| **Médio** | Feature nova, vários módulos | Specify → Tasks → Execute → Verify |
| **Complexo** | Arquitetura, API, infra | Specify → Design → Tasks → Execute → Verify |
| **Paralelo** | Trabalho divisível, multi-agente | Acima + `/task-graph` |

### Retomada de sessão

1. Ler `.specs/STATE.md` (feature, fase, next step)
2. Rodar harness (test/lint) antes de codar
3. Confirmar next step com o owner se ambíguo
4. Ao encerrar: `/handoff` (commit `.specs/`, sem push automático)

## Regras críticas (Contrato de Execução)

- **Test-First Imperative** — Nenhum código antes da spec e testes derivados dos critérios de aceite.
- **Autor ≠ Verificador** — Verificador com contexto limpo; nunca o autor do código.
- **Discrimination Sensor** — Verificador injeta mutantes para validar sensibilidade dos testes.
- **Evidence-or-Zero** — Requisito "pronto" só com evidência (arquivo + linha) de teste passando.
- **Change control** — Requisito mudou no meio do loop? Parar, atualizar spec, re-derivar testes, aprovar com o owner.

## Task Graph Engineering

A skill `task-graph-engineering.md` define a **topologia** do trabalho — como jobs se conectam dentro de Execute e Verify:

| Conceito | O que faz |
| --- | --- |
| **Stop rule** | Paralelizar só trabalho divisível; sequencial fica com 1 agente |
| **Fake edges** | Remover dependências inventadas entre tarefas |
| **Diamond pattern** | Workers paralelos → verify separado → merge |
| **Human gate** | Deploy, push, delete — aprovação humana explícita |
| **One writer per file** | Dois agentes não editam o mesmo arquivo na mesma rodada |

Artefato opcional: `.specs/features/[feature]/task-graph.md` (DAG em mermaid).

## Persistência e memória (`.specs/`)

| Arquivo | Função |
| --- | --- |
| `STATE.md` | Snapshot de progresso e handoff (template estruturado) |
| `LESSONS.md` | Lições aprendidas — falhas viram playbook local |
| `features/[feature]/spec.md` | Requisitos e critérios de aceite |
| `features/[feature]/design.md` | Arquitetura (quando aplicável) |
| `features/[feature]/tasks.md` | Breakdown atômico de tarefas |
| `features/[feature]/task-graph.md` | DAG de jobs e paralelismo (quando aplicável) |
| `features/[feature]/validation.md` | Relatório de verificação independente |

Template de `STATE.md`:

```markdown
## Active Feature
- Feature: [name]
- Phase: [Specify|Design|Tasks|Execute|Verify]
- Branch: [branch-name]

## Decisions (this session)
- [decision and rationale]

## Next Step (single item)
- [ ] [one concrete action]

## Blockers
- [open questions or dependencies]
```

## Loop Engineering & Harness

- **Loop de Correção** — Se o harness falhar, corrigir e retestar até 3 vezes antes de escalar ao humano.
- **Harness Operacional** — Qualidade garantida por test runners, linters e compiladores — não por autodeclaração da IA.

## Comandos disponíveis

| Comando | Ação |
| --- | --- |
| `/specify` | Define requisitos e IDs de spec |
| `/plan` | Cria design técnico e arquitetura |
| `/tasks` | Breakdown atômico em tarefas |
| `/task-graph` | Desenha ou revisa o DAG em `task-graph.md` |
| `/loop` | Inicia implementação autônoma em loop |
| `/verify` | Aciona validação técnica independente |
| `/handoff` | Atualiza STATE, commita `.specs/` no git (sem push) |
| `/sync-spec` | Commita artefatos da feature atual (sem handoff completo) |

## Skills irmãs (use juntas)

As cinco skills formam um **conjunto complementar** — cada uma cobre uma camada do fluxo agêntico:

| Skill | Camada | Papel |
| --- | --- | --- |
| `agent-architecture.md` | **Processo** | Workflow SDD, roteador de complexidade, change control |
| `task-graph-engineering.md` | **Topologia** | Task DAG, stop rule, fake edges, diamond verify |
| `engineering-standards.md` | **Qualidade** | Locale pt-BR/EN, secure coding, one-writer-per-file |
| `security-review.md` | **Verificação** | OWASP para `/verify`; caminho leve para mudanças sem auth/API |
| `git-handoff.md` | **Persistência** | Git sync, template STATE, handoff de sessão |

```
agent-architecture       →  O QUE fazer e QUANDO (fases SDD)
task-graph-engineering →  COMO conectar jobs (DAG, paralelismo)
engineering-standards  →  COMO escrever código e commits
security-review        →  segurança na verificação
git-handoff            →  persistir memória e specs no git
```

Cada skill referencia as outras. O contrato em `.cursorrules` aponta para todas — o agente carrega o conjunto ao planejar ou executar features.

## Locale

| Contexto | Idioma |
| --- | --- |
| Chat com o owner | Português brasileiro (pt-BR) |
| Código, testes, commits, PRs, `.specs/` | Inglês |

## Cadeia de verificação de conhecimento

1. **Codebase** — Convenções e padrões já em uso
2. **Docs** — README e `.specs/STATE.md`
3. **MCP/Context** — Documentação via ferramentas externas
4. **Web Search** — Padrões de comunidade e fontes oficiais
5. **Incerteza** — Se não encontrar, diga "Eu não sei". Nunca invente APIs.

> Planejamento: modelos de alto raciocínio (Opus, GPT-4o). Execução: modelos rápidos (Sonnet, Composer).

---

## Estrutura do repositório

```
spec-driven-harness/
├── index.js                      # CLI entrypoint
├── lib/                          # Instalador (download, memory, cursorrules)
├── skills/
│   ├── agent-architecture.md
│   ├── task-graph-engineering.md
│   ├── engineering-standards.md
│   ├── security-review.md
│   └── git-handoff.md
├── rules/
│   └── locale-and-standards.mdc
├── test/
├── install.sh
└── .github/workflows/
    ├── ci.yml
    └── publish.yml
```

Pacote npm: [@luizsantiago/agentic-harness](https://www.npmjs.com/package/@luizsantiago/agentic-harness)

---

## Desenvolvimento

```bash
git clone https://github.com/luizssantiago92/spec-driven-harness.git
cd spec-driven-harness
npm test
node index.js install
```

### Publicar no npm (mantenedores)

1. Token em [npmjs.com/settings/luizsantiago/tokens](https://www.npmjs.com/settings/luizsantiago/tokens)
2. Secret `NPM_TOKEN` no GitHub (Settings → Secrets → Actions)
3. **Actions → Publish to npm → Run workflow** → `patch`, `minor` ou `major`

Ou crie um **GitHub Release** para publicação automática.

## Licença

MIT
