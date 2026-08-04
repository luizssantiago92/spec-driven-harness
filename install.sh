#!/bin/bash

# 1. Definição de Variáveis com seu repositório específico
TARGET_DIRS=(".cursor/skills" ".claude/skills")
REPO_RAW_URL="https://raw.githubusercontent.com/luizssantiago92/spec-driven-harness/main"

echo "🚀 Instalando o Harness de Arquitetura Agêntica..."

# 2. Instalação da Skill principal
for DIR in "${TARGET_DIRS[@]}"; do
    echo "📂 Configurando diretório: $DIR"
    mkdir -p "$DIR"
    # Baixa a skill configurada para SDD e Loops
    curl -sSL "$REPO_RAW_URL/skills/agent-architecture.md" -o "$DIR/agent-architecture.md"
    echo "✅ Skill instalada em $DIR"
done

# 3. Inicialização do Harness de Memória e Sensores
echo "🧠 Configurando persistência em .specs/..."
mkdir -p .specs/features

# STATE.md: Log de decisões e snapshot para evitar amnésia entre sessões
if [ ! -f ".specs/STATE.md" ]; then
    echo "# 📝 Project State & Decisions" > .specs/STATE.md
    echo "✅ Arquivo STATE.md inicializado [Feed Forward]"
fi

# LESSONS.md: Repositório de lições aprendidas para aprendizado contínuo
if [ ! -f ".specs/LESSONS.md" ]; then
    echo "# 📚 Lessons Learned" > .specs/LESSONS.md
    echo "✅ Arquivo LESSONS.md inicializado [Feedback Loop]"
fi

echo "✨ Configuração concluída! Seu agente agora é um Engenheiro de IA 2026."
