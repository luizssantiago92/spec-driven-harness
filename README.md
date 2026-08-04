# Spec-Driven Harness (2026)

Framework agêntico que une **Spec-Driven Development**, **Loop Engineering** e **Harness Engineering**. Substitui o "Vibe Coding" por um fluxo estruturado com verificação independente, memória persistente e sensores operacionais.

## Instalação (Zero Ceremony)

Com um único comando `npx`, configure skills, memória persistente e contrato de execução em qualquer projeto:

```bash
npx @luizssantiago92/agentic-harness install
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

## Fluxo Spec-Driven (5 fases)

```
SPECIFY → DESIGN (opcional) → TASKS (opcional) → EXECUTE (loop) → VERIFY
```

| Fase | Obrigatória | Descrição |
| --- | --- | --- |
| **Specify** | Sim | Mapeia requisitos em IDs únicos; define out-of-scope |
| **Design** | Não | Arquitetura, reúso e riscos — ignorado em mudanças simples |
| **Tasks** | Não | Quebra atômica com critérios binários e paralelismo |
| **Execute** | Sim | Implementação em loops guiada por testes e commits atômicos |
| **Verify** | Sim | Validação independente por subagente especializado |

## Regras críticas (Contrato de Execução)

- **Test-First Imperative** — Nenhum código antes da spec e testes derivados dos critérios de aceite.
- **Autor ≠ Verificador** — O verificador tem contexto limpo e nunca é o autor do código.
- **Discrimination Sensor** — O verificador injeta falhas propositais (mutantes) para validar os testes.
- **Evidence-or-Zero** — Requisito "pronto" só com evidência (arquivo + linha) de teste assertivo passando.

## Persistência e memória (`.specs/`)

| Arquivo | Função |
| --- | --- |
| `STATE.md` | Decisões técnicas e snapshot de progresso (handoff) |
| `LESSONS.md` | Lições aprendidas — falhas de verificação viram playbook local |
| `features/[feature]/spec.md` | Requisitos e critérios de aceite |
| `features/[feature]/design.md` | Arquitetura (quando aplicável) |
| `features/[feature]/tasks.md` | Breakdown atômico de tarefas |
| `features/[feature]/validation.md` | Relatório de verificação independente |

## Loop Engineering & Harness

- **Loop de Correção** — Se o sensor (Harness) falhar, corrigir e retestar até 3 vezes antes de escalar para humano.
- **Harness Operacional** — Qualidade garantida por ferramentas externas (test runners, linters, compiladores), não por autodeclaração da IA.

## Comandos disponíveis

| Comando | Ação |
| --- | --- |
| `/specify` | Define requisitos e IDs de spec |
| `/plan` | Cria design técnico e arquitetura |
| `/tasks` | Breakdown atômico em tarefas |
| `/loop` | Inicia implementação autônoma em loop |
| `/verify` | Aciona validação técnica independente |

## Cadeia de verificação de conhecimento

Ao tomar decisões técnicas, siga esta ordem:

1. **Codebase** — Convenções e padrões já em uso
2. **Docs** — README e `.specs/STATE.md`
3. **MCP/Context** — Documentação atualizada via ferramentas externas
4. **Web Search** — Padrões de comunidade e fontes oficiais
5. **Incerteza** — Se não encontrar, diga "Eu não sei". Nunca invente APIs.

> Otimizado para modelos de alto raciocínio (Opus, GPT-4o) no planejamento e modelos rápidos (Sonnet, Composer) na execução do loop.

---

## Estrutura do repositório

```
spec-driven-harness/
├── index.js                  # CLI entrypoint (agentic-harness)
├── lib/                      # Lógica do instalador
├── skills/
│   └── agent-architecture.md # Skill fonte (baixada pelo instalador)
├── test/                     # Testes de integração
├── install.sh                # Instalador legado (bash)
└── .github/workflows/
    ├── ci.yml                # Testes automáticos (Node 18/20/22)
    └── publish.yml           # Publicação no npm
```

O pacote npm [`@luizssantiago92/agentic-harness`](https://www.npmjs.com/package/@luizssantiago92/agentic-harness) é publicado a partir deste repositório.

---

## Desenvolvimento e publicação (mantenedores)

### Desenvolvimento local

```bash
git clone https://github.com/luizssantiago92/spec-driven-harness.git
cd spec-driven-harness
npm test
node index.js install
```

### Publicar no npm via GitHub Actions

1. Configure o secret `NPM_TOKEN` em **Settings → Secrets → Actions**
2. Vá em **Actions → `.github/workflows/publish.yml`**
3. Clique em **Run workflow** → branch `main` → version `patch` → **Run workflow**

Alternativa: crie um **GitHub Release** — o workflow publica automaticamente.

### Publicar manualmente

```bash
npm login
npm test
npm publish --access public
```

## Licença

MIT
