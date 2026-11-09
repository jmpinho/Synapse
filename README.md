<div align="center">

# Synapse

**Aplicação web de produtividade para estudantes: organize tarefas, foque com Pomodoro, guarde anotações e acompanhe seu progresso em um só lugar.**

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFCA28?logo=firebase&logoColor=black)
![Status](https://img.shields.io/badge/status-em%20desenvolvimento-blue)

</div>

---

## Sobre o projeto

O **Synapse** nasceu como Trabalho de Conclusão de Curso (TCC) em Ciência da Computação, com a proposta de reunir em uma única interface as ferramentas que um estudante usa no dia a dia: lista de tarefas com prioridade automática, temporizador de foco, calendário de provas e entregas, repositório de anotações e métricas de estudo.

A ideia central é reduzir a fricção de organizar os estudos. Em vez de decidir manualmente o que fazer primeiro, o Synapse calcula a prioridade de cada tarefa a partir do prazo, da dificuldade e do volume de conteúdo.

## Funcionalidades

| Módulo | O que faz |
| --- | --- |
| **Home** | Painel com resumo do dia, tarefas prioritárias, próximos eventos da semana, minutos estudados e frases motivacionais. |
| **Pomodoro** | Temporizador de foco (25 min), descanso curto (5 min) e descanso longo (15 min, a cada 4 ciclos). Pode ser vinculado a uma tarefa ativa, e cada sessão concluída é registrada. |
| **Tarefas** | CRUD de tarefas com três visualizações: **lista**, **Kanban** e **Matriz de Eisenhower** (fazer, planejar, delegar, eliminar). |
| **Conteúdo** | Anotações por disciplina e categoria (Resumo, Exercício, Revisão, Dúvida), com link útil e filtro por disciplina. |
| **Cronograma** | Calendário mensal para provas, trabalhos, cursos e outros eventos, com marcação de concluído e situação (atrasado, hoje, futuro). |
| **Progresso** | Estatísticas dos últimos 7 dias, meta diária de estudo (120 min) e sequência de dias estudando. |

Outros detalhes:

- Tema claro e escuro, alternável pela barra lateral.
- Cache local persistente do Firestore, permitindo uso com conexão instável e sincronização entre abas.
- Interface em português do Brasil.

### Como a prioridade é calculada

A pontuação de cada tarefa (0 a 10) é uma média ponderada de três fatores:

| Fator | Peso | Como entra no cálculo |
| --- | --- | --- |
| Urgência | 50% | Quanto mais próximo o prazo, maior a nota. A urgência chega a zero com 10 ou mais dias de folga. |
| Dificuldade | 25% | Escala de 1 a 5 convertida para 0 a 10. |
| Quantidade de conteúdo | 25% | Escala de 1 a 5 convertida para 0 a 10. |

O resultado classifica a tarefa como prioridade **baixa** (abaixo de 4), **média** (de 4 a 7) ou **alta** (7 ou mais). A Matriz de Eisenhower usa a mesma urgência, combinada com a média entre dificuldade e conteúdo como "importância".

## Tecnologias

- [React 19](https://react.dev/)
- [Vite](https://vite.dev/)
- [Firebase Firestore](https://firebase.google.com/docs/firestore) (banco de dados)
- CSS puro com variáveis de tema
- ESLint e Oxlint para análise estática

## Estrutura do projeto

```
Synapse/
├── public/                  # Logo e ícones
├── src/
│   ├── components/
│   │   ├── Home/
│   │   ├── Pomodoro/
│   │   ├── Tarefas/         # Lista, Kanban e Matriz de Eisenhower
│   │   ├── Conteudo/
│   │   ├── Cronograma/
│   │   ├── Progresso/
│   │   ├── Sidebar/
│   │   └── icons/
│   ├── context/             # Contexto da tarefa ativa (Pomodoro ↔ Tarefas)
│   ├── services/            # Acesso ao Firestore (tarefas, eventos, conteúdos, sessões)
│   ├── styles/              # Tema claro/escuro
│   ├── utils/               # Prioridade, calendário e agrupamento de eventos
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── vite.config.js
└── package.json
```

## Como executar

### Pré-requisitos

- [Node.js](https://nodejs.org/) 20 ou superior
- Um projeto no [Firebase](https://console.firebase.google.com/) com o **Firestore** habilitado

### Instalação

```bash
# 1. Clone o repositório
git clone https://github.com/jmpinho/Synapse.git
cd Synapse

# 2. Instale as dependências
npm install
```

### Configuração do Firebase

Crie um arquivo `.env.local` na raiz do projeto com as credenciais do seu app web do Firebase:

```env
VITE_FIREBASE_API_KEY=sua_api_key
VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu-projeto
VITE_FIREBASE_STORAGE_BUCKET=seu-projeto.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=000000000000
VITE_FIREBASE_APP_ID=1:000000000000:web:xxxxxxxxxxxxxxxx
```

O Firestore usa quatro coleções, criadas automaticamente no primeiro uso:

| Coleção | Conteúdo |
| --- | --- |
| `tarefas` | Título, data de entrega, dificuldade, quantidade de conteúdo e status |
| `eventos` | Título, tipo, data, descrição e se foi concluído |
| `conteudos` | Anotações por disciplina e categoria |
| `sessoesEstudo` | Sessões de Pomodoro concluídas (tarefa e minutos) |

> **Atenção:** nunca publique o `.env.local` no repositório. Antes de colocar o app em produção, configure também as [regras de segurança do Firestore](https://firebase.google.com/docs/firestore/security/get-started).

### Executando

```bash
npm run dev
```

A aplicação ficará disponível em `http://localhost:5173`.

### Scripts disponíveis

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Inicia o servidor de desenvolvimento |
| `npm run build` | Gera o build de produção em `dist/` |
| `npm run preview` | Serve localmente o build de produção |
| `npm run lint` | Executa o ESLint |

## Roadmap

- [ ] Autenticação de usuários (hoje o app usa um único espaço de dados)
- [ ] Botão de logoff funcional
- [ ] Regras de segurança do Firestore por usuário
- [ ] Notificações de prazos e fim de ciclos do Pomodoro

## Autor

**João Mateus Pinho da Silva**
Bacharel em Ciência da Computação

[![GitHub](https://img.shields.io/badge/GitHub-jmpinho-181717?logo=github)](https://github.com/jmpinho)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-joao--mateus--pinho-0A66C2?logo=linkedin&logoColor=white)](https://www.linkedin.com/in/joao-mateus-pinho)
