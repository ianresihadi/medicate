# Medicate Backend Application

## Description
Backend application for medicate app

## Installation

```bash
$ cp .env.example .env
$ npm install
$ npm run migration:up
$ npm run db:seed
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod

# force
npm install --legacy-peer-deps
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Migration

```bash
# create new migration 
$ npm run typeorm migration:create src/database/migrations/alter_table_medical_check_results


# running migration
$ npm run migrate:up
```