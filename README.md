# Synapse

## Rodando o projeto

Este projeto tem duas partes que precisam rodar **ao mesmo tempo**, em dois terminais separados:

```bash
# Terminal 1 — a aplicação React
npm run dev

# Terminal 2 — a API fake (simula um banco de dados)
npm run api
```

A API fake usa o [json-server](https://github.com/typicode/json-server) lendo o arquivo `db.json` na raiz do projeto, e sobe em `http://localhost:3001`. O componente de Tarefas (`src/components/Tarefas`) busca e salva os dados nela via `fetch`, através das funções em `src/services/tarefasApi.js`.

Se a tela de Tarefas mostrar "Não foi possível carregar as tarefas", o motivo quase sempre é esse: o `npm run api` não está rodando.

Qualquer alteração feita pela interface (cadastrar, mudar status, remover) é salva de verdade no `db.json` — é só abrir o arquivo depois pra conferir.

---

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
