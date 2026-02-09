# Banking Microservices System

A production-grade, event-driven microservices-based banking application built with Node.js, MongoDB, RabbitMQ, and Redis.

## 🏗️ Architecture Overview

This system follows **microservices architecture** with **event-driven communication** patterns:

- **API Gateway**: Entry point with JWT validation, rate limiting, and request routing
- **Auth Service**: User authentication and authorization with JWT tokens
- **Wallet Service**: Wallet management with credit/debit operations
- **Notification Service**: Email and SMS notifications based on system events
- **Event Broker**: RabbitMQ for asynchronous inter-service communication
- **Cache & Coordination**: Redis for rate limiting, caching, and idempotency

## 🚀 Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB (database per service)
- **Message Broker**: RabbitMQ
- **Cache**: Redis
- **Authentication**: JWT (access + refresh tokens)

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Reverse Proxy**: NGINX
- **Cloud Ready**: AWS (ECS/EC2/Fargate)

### Frontend (Testing)
- **Framework**: React 18+
- **HTTP Client**: Axios

## 📁 Project Structure

```
banking-microservices/
├── gateway/                    # API Gateway service
├── services/
│   ├── auth-service/          # Authentication service
│   ├── wallet-service/        # Wallet management service
│   └── notification-service/  # Notification service
├── frontend/                  # React testing UI
├── nginx/                     # NGINX configuration
├── docker-compose.yml         # Docker orchestration
├── .env.example              # Environment variables template
└── README.md                 # This file
```

## 🔧 Prerequisites

- **Docker**: Version 20.x or higher
- **Docker Compose**: Version 2.x or higher
- **Node.js**: Version 18+ (for local development)
- **npm**: Version 8+ (for local development)

## 🏃 Quick Start

### 1. Clone and Setup

```bash
cd d:\MicroServices\banking-microservices
cp .env.example .env
# Edit .env with your configuration
```

### 2. Start All Services

```bash
docker-compose up -d
```

This will start:
- API Gateway (Port 3000)
- Auth Service (Port 3001)
- Wallet Service (Port 3002)
- Notification Service (Port 3003)
- MongoDB instances (3)
- RabbitMQ (Port 5672, Management UI: 15672)
- Redis (Port 6379)
- NGINX (Port 80)

### 3. Access Services

- **Frontend**: http://localhost
- **API Gateway**: http://localhost/api
- **RabbitMQ Management**: http://localhost:15672 (guest/guest)

### 4. Health Check

```bash
curl http://localhost/health
```

## 📡 API Endpoints

### Auth Service

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | User login | No |
| POST | `/api/auth/refresh` | Refresh access token | No |
| GET | `/api/auth/me` | Get current user | Yes |

### Wallet Service

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/wallet` | Get wallet details | Yes |
| POST | `/api/wallet/credit` | Credit amount | Yes |
| POST | `/api/wallet/debit` | Debit amount | Yes |
| GET | `/api/wallet/transactions` | Get transaction history | Yes |

## 🔄 Event Flow

### User Registration Flow

```
User → API Gateway → Auth Service
                     ├─ Create User in DB
                     └─ Publish: USER_REGISTERED
                           ├─ Wallet Service → Create Wallet → Publish: WALLET_CREATED
                           │                                     └─ Notification Service → Email/SMS
                           └─ Notification Service → Welcome Email/SMS
```

### Wallet Transaction Flow

```
User → API Gateway → Wallet Service
                     ├─ Check Idempotency (Redis)
                     ├─ Update Balance (MongoDB)
                     ├─ Invalidate Cache (Redis)
                     └─ Publish: WALLET_CREDITED/DEBITED
                           └─ Notification Service → Transaction Email/SMS
```

## 🎯 Event Schema

### Events Published

- `USER_REGISTERED`: When a new user signs up
- `USER_LOGGED_IN`: When a user logs in
- `WALLET_CREATED`: When a wallet is created
- `WALLET_CREDITED`: When wallet is credited
- `WALLET_DEBITED`: When wallet is debited
- `INSUFFICIENT_BALANCE`: When debit fails due to insufficient balance

## 🔐 Security Features

- **JWT Authentication**: Access tokens (15 min) + Refresh tokens (7 days)
- **Password Hashing**: bcrypt with configurable rounds
- **Rate Limiting**: Redis-based (100 requests/15 min per IP)
- **Idempotency**: Transaction safety with idempotency keys
- **Input Validation**: Request validation on all endpoints
- **Service Isolation**: Database per service pattern

## 🧪 Testing

### Run Tests (Individual Service)

```bash
cd services/auth-service
npm test
npm run test:coverage
```

### Manual Testing with Frontend

1. Start all services: `docker-compose up -d`
2. Open browser: http://localhost
3. Test registration, login, and wallet operations

## 📊 Monitoring & Debugging

### View Service Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f auth-service
docker-compose logs -f wallet-service
```

### RabbitMQ Management Console

- URL: http://localhost:15672
- Username: `guest`
- Password: `guest`

Monitor exchanges, queues, messages, and consumer status.

### Redis CLI

```bash
docker exec -it banking-redis redis-cli
# Check rate limits
KEYS rate:*
# Check cache
KEYS wallet:balance:*
# Check idempotency
KEYS idempotency:*
```

## 🛑 Stop Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (clean state)
docker-compose down -v
```

## 🚀 Production Deployment

### AWS Deployment Path

1. **Container Registry**: Push images to ECR
2. **Compute**: Deploy to ECS (Fargate or EC2)
3. **Database**: Use DocumentDB or MongoDB Atlas
4. **Message Broker**: Amazon MQ (RabbitMQ) or self-hosted
5. **Cache**: ElastiCache (Redis)
6. **Load Balancer**: Application Load Balancer
7. **Secrets**: AWS Secrets Manager / Systems Manager Parameter Store

### Environment Variables

See `.env.example` for all required environment variables. Update for production:

- Strong JWT secrets
- Production database URLs
- SMTP/SMS provider credentials
- Appropriate rate limits
- Enable HTTPS

## 📈 Scalability Considerations

- **Horizontal Scaling**: Each service can scale independently
- **Database Sharding**: Supported by MongoDB
- **Event Processing**: RabbitMQ supports multiple consumers
- **Caching**: Redis reduces database load
- **Load Balancing**: NGINX + ALB ready

## 🔄 Future Enhancements

- Payment Gateway Integration
- KYC Service
- Ledger Service
- Report Generation Service
- Transaction Disputes
- Multi-currency Support
- Advanced Analytics

## 📝 License

This project is for educational and interview preparation purposes.

## 👥 Contributing

This is a demonstration project. For suggestions or improvements, please open an issue.

---

**Built with ❤️ for production-grade microservices learning**
