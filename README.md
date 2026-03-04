# Detalhes do Projeto - Teste Técnico DG

## 🛠️ Como Inicializar o Projeto (Rápido)

Para rodar o projeto completo utilizando Docker (recomendado), execute os seguintes comandos na raiz:

```bash
# 1. Copie o arquivo de variáveis de ambiente (ajuste se necessário)
cp .env.example ./backend/.env

# 2. Suba os containers (isso fará o build, migrações e seed automaticamente)
docker compose up -d --build
```

Aguarde alguns instantes e acesse:
- **Frontend:** [http://localhost](http://localhost)
- **Documentação da API:** [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

---

Este projeto é uma implementação full-stack de um **Sistema de Gerenciamento de Usuários (CRUD)** com Autenticação e Controle de Acesso Baseado em Regras (RBAC).
Na primeira execução ao menos um usuário administrador deve ser criado automaticamente, com as seguintes credenciais:

- **E-mail:** admin@admin.com
- **Senha:** password123

## 🚀 Estrutura do Projeto

O repositório é um monorepo gerenciado pelo **Bun** e possui a seguinte estrutura:

- `/backend`: API construída com **ElysiaJS**, **Drizzle ORM** (PostgreSQL) e **Better Auth**.
- `/frontend`: Aplicação SPA construída com **React 19**, **Vite** e **TanStack Router**.

### 🛠️ Tecnologias Principais

#### Backend
- **Bun**: Runtime e gerenciador de pacotes extremamente rápido.
- **ElysiaJS**: Framework web de alta performance para Bun com suporte nativo a TypeScript.
  - **OpenAPI/Swagger**: Documentação automática acessível em `/api/docs`.
- **Better Auth**: Solução de autenticação completa e segura para aplicações Bun.
- **Drizzle ORM**: ORM leve e tipado para interações seguras com o PostgreSQL.
- **PostgreSQL**: Banco de dados relacional.
- **Redis**: Utilizado pelo Better Auth para armazenamento de sessões secundárias.

#### Frontend
- **React 19**: Versão mais recente da biblioteca.
- **Vite**: Bundler rápido para desenvolvimento moderno.
- **TanStack Router**: Roteamento baseado em arquivos com tipagem estática rigorosa.
- **TanStack Form**: Gerenciamento de formulários typesafe.
- **Elysia Eden**: Cliente fetch typesafe que compartilha os tipos diretamente do backend.
- **shadcn/ui**: Componentes de UI modernos e acessíveis baseados em Tailwind CSS.
- **Tailwind CSS v4**: Estilização utilitária.
- **Zod**: Validação de dados.

## ⚙️ Decisões Técnicas Importantes

### 🏗️ Experiência do Desenvolvedor (DX)
- **Elysia + Eden**: Ao utilizar o Elysia no backend e o Eden no frontend, garantimos que toda a comunicação via rede seja 100% tipada. Se uma rota mudar no backend, o frontend acusará erro de compilação imediatamente, eliminando erros comuns de integração.
- **OpenAPI Nativo**: O Elysia gera automaticamente a especificação OpenAPI com interface do Scalar. Isso não apenas documenta a API, mas também permite testes rápidos sem a necessidade de ferramentas externas como Postman.

### 🛣️ Roteamento e Formulários
- **TanStack Router**: Escolhido por ser o padrão ouro atual para roteamento em React, oferecendo carregamento de dados (loaders), tratamento de erros e tipagem de parâmetros de URL nativamente.
- **TanStack Form**: Permite validação complexa (como CPF/CNPJ) de forma performática e totalmente integrada com o ecossistema TanStack.

### 🔐 Segurança
- **Better Auth**: Implementado para gerenciar sessões de forma segura, suportando RBAC (Admin vs Simple users).

## 📦 Como rodar em Produção

### Variáveis de Ambiente
Copie o arquivo `.env.example` para `.env` na raiz e preencha os valores:
```bash
cp .env.example .env
```

### Docker
Foram criados Dockerfiles específicos para cada parte da aplicação.

#### Rodando com Docker Compose (Completo)
O Docker Compose já está configurado para subir o banco de dados, o redis, aplicar as migrações e realizar o seed do usuário administrador automaticamente antes de iniciar o backend e o frontend.

Para subir tudo:
```bash
docker-compose up -d
```
Isso disponibilizará:
- Frontend: `http://localhost:80`
- Backend: `http://localhost:3000`
- API Docs: `http://localhost:3000/api/docs`

#### Backend separadamente:
```bash
cd backend
docker build -t dg-backend .
docker run -p 3000:3000 --env-file ../.env dg-backend
```

#### Frontend separadamente:
```bash
cd frontend
docker build -t dg-frontend .
docker run -p 80:80 dg-frontend
```

## 🌱 Seed do Banco de Dados
O seed do usuário administrador inicial obrigatório (**admin@admin.com** / **password123**) é feito automaticamente pelo Docker ao subir o ambiente. Caso queira rodar manualmente em um ambiente de desenvolvimento local:

```bash
# Na raiz do projeto
bun run db:seed
```
*Ou, se estiver dentro da pasta /backend:* `bun run db:seed`

## 📡 Integrações Externas
O backend atua como um proxy para as APIs da **ViaCEP** e **ReceitaWS**, evitando problemas de CORS e protegendo a lógica de integração no servidor.
