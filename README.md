# Spec-Driven Harness (2026)

[![npm version](https://img.shields.io/npm/v/@luizsantiago/agentic-harness.svg)](https://www.npmjs.com/package/@luizsantiago/agentic-harness)
[![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

**Framework agêntico que une Spec-Driven Development, Loop e Harness Engineering.** Zero Ceremony via npx: skills SDD, engenharia, segurança, regras pt-BR/EN e memória `.specs/`. Fluxo Specify→Verify com Verificador Independente, `STATE.md` e `LESSONS.md`.

## Instalação (Zero Ceremony)

Com um único comando `npx`, configure skills, memória persistente e contrato de execução em qualquer projeto:

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
| `.cursor/skills/agent-architecture.md` | SDD workflow (Specify → Verify) |
| `.cursor/skills/engineering-standards.md` | Locale, segurança e qualidade de código |
| `.cursor/skills/security-review.md` | Checklist OWASP para `/verify` |
| `.cursor/rules/locale-and-standards.mdc` | Regra global Cursor (pt-BR chat, artefatos em inglês) |
| `.claude/skills/*.md` | Mesmas skills para Claude |
| `.specs/STATE.md` | Decisões e handoff entre sessões |
| `.specs/LESSONS.md` | Playbook de aprendizado contínuo |
| `.specs/features/` | Specs por feature (spec, design, tasks, validation) |
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
| **Specify** | Sim | Requisitos em IDs únicos; define out-of-scope |
| **Design** | Não | Arquitetura, reúso e riscos |
| **Tasks** | Não | Quebra atômica com critérios binários |
| **Execute** | Sim | Loops guiados por testes e commits atômicos |
| **Verify** | Sim | Validação independente por subagente |

## Regras críticas (Contrato de Execução)

- **Test-First Imperative** — Nenhum código antes da spec e testes derivados dos critérios de aceite.
- **Autor ≠ Verificador** — Verificador com contexto limpo; nunca o autor do código.
- **Discrimination Sensor** — Verificador injeta mutantes para validar sensibilidade dos testes.
- **Evidence-or-Zero** — Requisito "pronto" só com evidência (arquivo + linha) de teste passando.

## Persistência e memória (`.specs/`)

| Arquivo | Função |
| --- | --- |
| `STATE.md` | Decisões técnicas e snapshot de progresso (handoff) |
| `LESSONS.md` | Lições aprendidas — falhas viram playbook local |
| `features/[feature]/spec.md` | Requisitos e critérios de aceite |
| `features/[feature]/design.md` | Arquitetura (quando aplicável) |
| `features/[feature]/tasks.md` | Breakdown atômico de tarefas |
| `features/[feature]/validation.md` | Relatório de verificação independente |

## Loop Engineering & Harness

- **Loop de Correção** — Se o harness falhar, corrigir e retestar até 3 vezes antes de escalar.
- **Harness Operacional** — Qualidade garantida por test runners, linters e compiladores — não por autodeclaração da IA.

## Comandos disponíveis

| Comando | Ação |
| --- | --- |
| `/specify` | Define requisitos e IDs de spec |
| `/plan` | Cria design técnico e arquitetura |
| `/tasks` | Breakdown atômico em tarefas |
| `/loop` | Inicia implementação autônoma em loop |
| `/verify` | Aciona validação técnica independente |

## Cadeia de verificação de conhecimento

1. **Codebase** — Convenções e padrões já em uso
2. **Docs** — README e `.specs/STATE.md`
3. **MCP/Context** — Documentação via ferramentas externas
4. **Web Search** — Padrões de comunidade e fontes oficiais
5. **Incerteza** — Se não encontrar, diga "Eu não sei". Nunca invente APIs.

> Otimizado para modelos de alto raciocínio (Opus, GPT-4o) no planejamento e modelos rápidos (Sonnet, Composer) na execução.

---

## Estrutura do repositório

```
spec-driven-harness/
├── index.js                  # CLI entrypoint
├── lib/                      # Lógica do instalador
├── skills/
│   ├── agent-architecture.md   # SDD workflow
│   ├── engineering-standards.md
│   └── security-review.md
├── rules/
│   └── locale-and-standards.mdc
├── test/                     # Testes de integração
├── install.sh                # Instalador legado (bash)
└── .github/workflows/
    ├── ci.yml                # Testes (Node 18/20/22)
    └── publish.yml           # Publicação no npm
```

Pacote npm: [@luizsantiago/agentic-harness](https://www.npmjs.com/package/@luizsantiago/agentic-harness)

---

## Desenvolvimento

### Local

```bash
git clone https://github.com/luizssantiago92/spec-driven-harness.git
cd spec-driven-harness
npm test
node index.js install
```

### Publicar no npm (mantenedores)

1. Token em [npmjs.com/settings/luizsantiago/tokens](https://www.npmjs.com/settings/luizsantiago/tokens) (Packages: Read and Write)
2. Secret `NPM_TOKEN` no GitHub (Settings → Secrets → Actions)
3. **Actions → Publish to npm → Run workflow** → escolha `patch`, `minor` ou `major`

Ou crie um **GitHub Release** para publicação automática.

```bash
npm login
npm test
npm publish --access public
```

## Licença

MIT
