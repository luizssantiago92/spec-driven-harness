#!/usr/bin/env node

import { install } from "./lib/install.js";

const [, , command] = process.argv;

if (command === "install") {
  try {
    await install();
    console.log(
      "✨ Configuração concluída! Seu agente agora é um Engenheiro de IA 2026.",
    );
  } catch (err) {
    console.error(`❌ ${err.message}`);
    process.exit(1);
  }
} else {
  console.error("Usage: agentic-harness install");
  process.exit(1);
}
