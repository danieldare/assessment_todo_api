
# Todo List API

## Description

The Todo List API is a simple and efficient API for managing a todo list. It allows users to create, read, update, and delete tasks. The API is built using the NestJS framework, which is a progressive Node.js framework for building efficient and scalable server-side applications.

## Technology Used

- [NestJS](https://nestjs.com/) - A progressive Node.js framework
- [TypeScript](https://www.typescriptlang.org/) - A typed superset of JavaScript
- [MySQL](https://www.mysql.com/) - A relational database
- [Swagger](https://swagger.io/) - API documentation

## Prerequisites

Before you begin, ensure you have met the following requirements:

- You have installed [Node.js](https://nodejs.org/) and [pnpm](https://pnpm.io/).
- You have a running instance of MySQL.
- You have cloned the repository and navigated to the project directory.
- You have created a `.env` file in the root directory. An `env.example` file is provided for reference.

## Installation

```bash
$ pnpm install
```

## Setting Up the Environment

Create a `.env` file in the root directory and add the following environment variables:

```env
DBHOST=localhost
DBPORT=3306
DBUSER=root
DBPASSWORD=root
DBDATABASE=todo_db
TEST_DBDATABASE=todo_db_test
JWT_SECRET=jwt_secret
```

## Running the App

```bash
# development
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## API Documentation

The API documentation is available at `/docs` endpoint. It is generated using Swagger.

## Running Tests

```bash
# e2e tests
$ pnpm run test:e2e
```
