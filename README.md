# 📦 Product Catalog Microservice

A prototype microservice that lists products with support for searching, filtering, pagination, caching, and rate limiting. Built with MERN stack and Express-based gateway.

## 📁 Project Structure

## 🚀 Features

* 🔍 Product listing with search, filter, pagination

* 🔒 Rate limiting on public product endpoints

* ⚡ Redis caching for most-viewed products

* 🧩 API Gateway as single entry point

* 🧾 Clean, RESTful endpoints

## 📦 Tech Stack

* **Frontend**: React + React Query

* **Backend**: Node.js, Express, MongoDB

* **Gateway**: Node.js + Express + Rate Limiter

* **Cache**: Redis

* **Infra**: Docker + Docker Compose

## 🔧 Installation

To get started, clone the repository and navigate into the project directory:

```
# Clone the repo
git clone [https://github.com/yourusername/product-catalog-app.git](https://github.com/yourusername/product-catalog-app.git)
cd product-catalog-app

```

### Environment Variables Setup

Before running the backend, you need to create `.env` files based on the `.env.template` files in the following locations:

1. **Root Directory (`./`)**: For MongoDB credentials.

2. **`./services/product/`**: For product service configuration.

**Root Directory (`.env`)**:

```
# mongo
MONGO_INITDB_ROOT_USERNAME=xxx
MONGO_INITDB_ROOT_PASSWORD=xxx
MONGO_INITDB_DATABASE=xxx

```

**Product Service Directory (`./services/product/.env`)**:

```
PORT=xxx
IS_DOCKERIZED=xxx
LOCAL_MONGO_URI=xxx
DOCKERIZED_MONGO_URI=xxx
ENABLE_CORS=[can be left blank]
CLIENT_IP=[can be left blank]
REDIS_HOST=xxx
REDIS_PORT=xxx

```

*To access the required secrets (values for `xxx`), please head over to the `plattech-secrets` Discord text channel.*

### Running the Services

This project uses `pnpm` as its package manager. Ensure you have it installed.

> ⚠️ **IMPORTANT NOTE**: Before proceeding, ensure you have **Docker Desktop** open and running.

First, start the database services:

```
pnpm run db

```

Then, run the backend service:

```
pnpm run backend

```

To bring down the database services when you're finished:

```
pnpm run dbdown

```