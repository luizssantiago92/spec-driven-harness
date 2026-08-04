# 🤖 Agentic Architecture 2026: SDD & Loop Engineering


Este repositório contém a infraestrutura e as **AI Skills** necessárias para transformar agentes de IA (Cursor, Claude Code, Copilot) em parceiros de engenharia de alta performance. 


## 🏗️ Filosofia do Projeto
Baseado no conceito de **Harness Engineering**, este repositório inverte a pirâmide tradicional: aqui, **o código serve à especificação**.


1. **Spec-Driven Development (SDD):** Todo trabalho começa com uma Spec robusta e um Design técnico antes de tocar no código.
2. **Loop Engineering:** Automação em ciclos de execução, teste e correção até atingir o objetivo.
3. **Independent Verifier:** Garantia de qualidade onde o autor do código nunca é o seu verificador.


## 🚀 Instalação Rápida
Para instalar esta skill em seu projeto local, execute o comando abaixo no terminal:


```bash

curl -sSL https://raw.githubusercontent.com/SEU_USUARIO/SEU_REPO/main/install.sh | bash

🛠️ Comandos de Ativação

Uma vez instalada, você pode comandar o agente utilizando:
/specify: Cria o spec.md com requisitos e IDs únicos.
/plan: Gera o design.md e decisões de arquitetura.
/tasks: Faz o breakdown atômico em tasks.md.
/loop: Inicia a execução autônoma das tarefas.
/verify: Aciona o Verificador Independente para validação final.
📂 Estrutura de Memória (.specs/)
O sistema mantém a continuidade e evita a "amnésia" entre sessões através de:
STATE.md: Log de decisões e snapshot para passagem de bastão (handoff).
LESSONS.md: Aprendizado contínuo onde falhas passadas viram regras para o futuro.


---


### 2. Script de Instalação (`install.sh`)


Este script facilita o uso da sua skill em diferentes projetos, seguindo o padrão de instalação de diretórios de skills.


```bash
#!/bin/bash


# Define os diretórios de destino comuns para editores agênticos
TARGET_DIRS=(".cursor/skills" ".claude/skills")


echo "📦 Instalando Agentic Architecture 2026 Skills..."


for DIR in "${TARGET_DIRS[@]}"; do
    mkdir -p "$DIR"
    # Baixa a Skill principal do seu repositório
    curl -o "$DIR/agent-architecture.md" https://raw.githubusercontent.com/SEU_USUARIO/SEU_REPO/main/skills/agent-architecture.md
    echo "✅ Skill instalada em $DIR"
done


# Cria a estrutura de pastas .specs para memória persistente
mkdir -p .specs/features


if [ ! -f ".specs/STATE.md" ]; then
    echo "# Project State & Decisions" > .specs/STATE.md
    echo "✅ Arquivo STATE.md inicializado"
fi


echo "🚀 Instalação concluída! Use '/specify' para começar uma nova funcionalidade."
3. O Arquivo de Skill (skills/agent-architecture.md)
Este é o arquivo que a IA lerá como instrução de sistema.
# SKILL: AGENTIC-ARCHITECTURE-2026


## CONTRATO DE EXECUÇÃO (Não-Negociável)
1. **Tests-First:** Nenhum código é escrito sem antes derivar testes da especificação.
2. **Harness de Sensores:** A validação final é feita por ferramentas (test runners, linters) e não por autodeclaração da IA.
3. **Verificador Independente:** Após a última task, um sub-agente com contexto limpo deve validar a entrega contra a spec.
4. **Discrimination Sensor:** O verificador deve injetar falhas propositais para confirmar se os testes as detectam.


## WORKFLOW DE 5 FASES
- **Fase 1: SPECIFY** -> Requisitos testáveis e tabela de Out-of-Scope.
- **Fase 2: DESIGN** -> Arquitetura modular e decisões de reuso.
- **Fase 3: TASKS** -> Quebra atômica com critérios binários de sucesso.
- **Fase 4: EXECUTE** -> Loops de implementação gated por testes e commits atômicos.
- **Fase 5: VERIFY** -> Relatório final `validation.md` e destilação de lições em `LESSONS.md`.
