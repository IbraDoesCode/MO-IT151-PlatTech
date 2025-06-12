# 📦 Product Catalog Microservice

A prototype microservice that lists products with support for searching, filtering, pagination, caching, and rate limiting. Built with MERN stack and Express-based gateway.

---

## 📁 Project Structure

---

## 🚀 Features

- 🔍 Product listing with search, filter, pagination
- 🔒 Rate limiting on public product endpoints
- ⚡ Redis caching for most-viewed products
- 🧩 API Gateway as single entry point
- 🧾 Clean, RESTful endpoints

---

## 📦 Tech Stack

- **Frontend**: React + React Query
- **Backend**: Node.js, Express, MongoDB
- **Gateway**: Node.js + Express + Rate Limiter
- **Cache**: Redis
- **Infra**: Docker + Docker Compose

---

## 🔧 Installation (Docker)

```bash
# Clone the repo
git clone https://github.com/yourusername/product-catalog-app.git
cd product-catalog-app

# Start all services
docker-compose up --build
```
