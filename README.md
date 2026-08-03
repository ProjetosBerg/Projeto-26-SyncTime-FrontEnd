# SyncTime Front-End

Interface web do SyncTime, uma aplicação para gestão de rotina, registros, categorias, relatórios e acompanhamento de produtividade. O projeto centraliza autenticação, calendário de anotações, dashboards analíticos, exportações e configurações visuais em uma experiência React protegida por sessão.

![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react&logoColor=111)
![Vite](https://img.shields.io/badge/Vite-5.4.8-646CFF?logo=vite&logoColor=fff)
![Node](https://img.shields.io/badge/Node.js-20-339933?logo=node.js&logoColor=fff)
![License](https://img.shields.io/badge/license-private-lightgrey)

## Sumário

- [Sobre o projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Pré-requisitos](#pré-requisitos)
- [Configuração do ambiente](#configuração-do-ambiente)
- [Scripts disponíveis](#scripts-disponíveis)
- [Estrutura de pastas](#estrutura-de-pastas)
- [Rotas principais](#rotas-principais)
- [Integrações](#integrações)
- [Padrões do projeto](#padrões-do-projeto)

## Sobre o projeto

O SyncTime Front-End é uma SPA construída com React e Vite. A aplicação consome uma API REST para autenticação, usuários, categorias, relatórios, transações, rotinas, notas, notificações e dashboards.

O sistema utiliza rotas públicas para login, cadastro e recuperação de senha, além de rotas protegidas que exigem token salvo no `localStorage`. Após autenticação, o usuário acessa um layout com sidebar, header, rodapé, notificações em tempo real e páginas internas.

## Funcionalidades

- Autenticação de usuários com login, cadastro, logout, validação de sessão e recuperação de senha.
- Proteção de rotas com redirecionamento automático para usuários não autenticados.
- Home com saudação personalizada, clima por geolocalização, caixa de entrada e gráfico de presença.
- Dashboard de categorias com filtros por categoria, período e agrupamento.
- Visualizações analíticas com Recharts, incluindo gráficos de pizza, barras, linha, área, dispersão e radar.
- Customização de gráficos e resumos no dashboard.
- Exportação do dashboard em PDF.
- Gestão de categorias, tipos de registro e campos personalizados.
- Relatórios mensais por categoria.
- Gestão de transações com filtros, ordenação, seleção de colunas e exportação em CSV, XLSX e PDF.
- Calendário de anotações com rotinas por data, períodos do dia e resumo diário.
- Consulta de feriados nacionais do Brasil com fallback local para 2025.
- Notificações em tempo real via Socket.IO.
- Ranking, streak/ofensiva e acompanhamento de presença.
- Configurações de perfil, privacidade, conta, tema, cor de destaque e aparência.
- Componentes reutilizáveis para tabelas, filtros, paginação, modais, inputs, selects, badges e mensagens.

## Tecnologias

### Base

- React 18
- Vite 5
- JavaScript com módulos ES
- React Router DOM v5
- CSS Modules
- Bootstrap/Reactstrap

### Formulários e validação

- React Hook Form
- Yup
- `@hookform/resolvers`
- `@hookform/error-message`

### Dados, gráficos e exportações

- Axios
- Recharts
- jsPDF
- html-to-image
- recharts-to-png

### Experiência de usuário

- Lucide React
- React Icons
- React Select
- React Markdown
- Socket.IO Client

### Qualidade

- ESLint
- Prettier

## Pré-requisitos

- Node.js 20, conforme definido em `.tool-versions`.
- npm, incluído na instalação do Node.
- Backend do SyncTime disponível para as chamadas REST.
- Servidor Socket.IO disponível quando as notificações em tempo real forem usadas.

## Configuração do ambiente

1. Instale as dependências:

```bash
npm install
```

2. Configure as variáveis de ambiente em um arquivo `.env` na raiz do projeto:

```env
VITE_KEY_API_OPENWEATHER=sua_chave_openweather
VITE_KEY_API_HOLIDAY=sua_chave_abstractapi_holidays
```

3. Confirme as URLs de integração:

- API REST: configurada em `src/services/api.js`.
- Socket.IO: configurado em `src/hooks/useSocket.js`.

Atualmente o front-end aponta para:

- `https://projeto-26-synctime-backend.onrender.com/api/` para a API REST.
- `http://localhost:3000` para o servidor Socket.IO.

## Scripts disponíveis

```bash
npm run dev
```

Inicia o servidor de desenvolvimento do Vite.

```bash
npm run build
```

Gera a versão de produção em `dist/`.

```bash
npm run preview
```

Executa uma prévia local da build de produção.

```bash
npm run lint
```

Executa a análise estática com ESLint.

## Estrutura de pastas

```text
src/
  assets/                  # Imagens e arquivos visuais da aplicação
  components/              # Componentes reutilizáveis de UI
  context/                 # Contextos globais, como autenticação do usuário
  hooks/                   # Hooks customizados de autenticação, tema, socket e memória local
  services/                # Cliente Axios e serviços compartilhados
  utils/                   # Utilitários gerais
  views/                   # Páginas e módulos principais da aplicação
    auth/                  # Login, cadastro, recuperação de senha e termos
    dashboard/             # Dashboard analítico por categoria
    home/                  # Página inicial autenticada
    loading/               # Tela de carregamento inicial
    notes/                 # Calendário, rotinas e anotações
    report/                # Relatórios mensais e transações
    sectionConfigSystem/   # Configurações gerais, conta, categorias e campos
```

## Rotas principais

| Rota | Acesso | Descrição |
| --- | --- | --- |
| `/` | Público | Tela inicial de acesso |
| `/login` | Público | Autenticação do usuário |
| `/register` | Público | Cadastro de usuário |
| `/esqueceu-senha` | Público | Recuperação de senha |
| `/inicio` | Protegido | Home com clima, inbox e presença |
| `/dashboard/categoria` | Protegido | Dashboard analítico de categorias |
| `/anotacoes` | Protegido | Calendário de rotinas e anotações |
| `/configuracoes` | Protegido | Central de configurações |
| `/categoria` | Protegido | Listagem de categorias |
| `/categoria/form` | Protegido | Criação de categoria |
| `/categoria/form/:id` | Protegido | Edição de categoria |
| `/record-type` | Protegido | Listagem de tipos de registro |
| `/record-type/form` | Protegido | Criação de tipo de registro |
| `/record-type/form/:id` | Protegido | Edição de tipo de registro |
| `/custom-fields` | Protegido | Listagem de campos personalizados |
| `/custom-fields/form` | Protegido | Criação de campo personalizado |
| `/custom-fields/form/:id` | Protegido | Edição de campo personalizado |
| `/relatorios/categoria/relatorio-mesal/:id` | Protegido | Relatório mensal de uma categoria |
| `/relatorios/categoria/relatorio-mesal/form` | Protegido | Criação de relatório mensal |
| `/relatorios/categoria/relatorio-mesal/form/:id` | Protegido | Edição de relatório mensal |
| `/relatorios/categoria/transações` | Protegido | Listagem de transações |
| `/relatorios/categoria/transações/form` | Protegido | Criação de transação |
| `/relatorios/categoria/transações/form/:id` | Protegido | Edição de transação |

## Integrações

### Backend SyncTime

O cliente HTTP está centralizado em `src/services/api.js` por meio do Axios. Os serviços da aplicação encapsulam chamadas para recursos como:

- `/user`
- `/auth`
- `/category`
- `/record-types`
- `/custom-fields`
- `/monthly-record`
- `/transactions`
- `/dashboard`
- `/notes`
- `/routines`
- `/notification`

### OpenWeather

A home usa a API do OpenWeather para buscar clima por geolocalização do navegador. Quando a localização não está disponível, a aplicação usa coordenadas fallback.

### Abstract API Holidays

O calendário usa a Abstract API Holidays para carregar feriados nacionais do Brasil. Se a chave não estiver configurada ou a API falhar, o sistema aplica um fallback local para feriados de 2025.

### Socket.IO

As notificações em tempo real usam Socket.IO. O hook `useSocket` autentica a conexão com o `userId` e escuta eventos como `newNotification`.

## Padrões do projeto

- Componentes React funcionais com hooks.
- Rotas públicas e protegidas declaradas em `src/App.jsx`.
- Estado de autenticação disponibilizado por `UserContext`.
- Token JWT salvo em `localStorage`.
- Configurações de usuário e sistema persistidas no `localStorage`.
- Estilização modular com arquivos `*.module.css`.
- Formulários controlados com React Hook Form e validações Yup.
- Serviços organizados por domínio para isolar chamadas HTTP.
- Tabelas reutilizáveis com paginação, ordenação, filtros, seleção de colunas e ações.

## Build e deploy

Para gerar os arquivos estáticos de produção:

```bash
npm run build
```

O resultado será criado em `dist/` e pode ser hospedado em qualquer serviço de arquivos estáticos compatível com SPAs. Em produção, configure o servidor para redirecionar rotas internas para `index.html`, garantindo o funcionamento do React Router.

## Observações importantes

- Não versione chaves reais de API em repositórios públicos.
- O arquivo `.env` deve conter apenas variáveis locais de desenvolvimento.
- A URL da API REST está fixa no código; para múltiplos ambientes, considere migrá-la para uma variável `VITE_API_BASE_URL`.
- A URL do Socket.IO também está fixa no código; para produção, considere configurá-la via variável de ambiente.
- A rota `relatorio-mesal` aparece dessa forma no código e foi documentada exatamente como implementada.
