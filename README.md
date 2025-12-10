# Freelancer Website

A comprehensive freelancer marketplace platform built with Node.js, Express, and PostgreSQL using a clean layered architecture.

## Features

### Core Features
- 🔐 **User Authentication & Authorization** - JWT-based authentication with role-based access control
- 👤 **User Management** - Complete user registration, login, profile management
- 💼 **Freelancer Profiles** - Detailed profiles with skills, hourly rates, and portfolios
- 📋 **Project Management** - Clients can post and manage projects
- 📝 **Proposal System** - Freelancers can submit proposals for projects
- 📄 **Contract Management** - Automated contract creation and management
- 🎯 **Milestone Tracking** - Break projects into milestones with payment tracking
- 💳 **Payment Integration** - Razorpay integration for secure payments
- 🛡️ **Rate Limiting** - Built-in rate limiting for login and registration endpoints
- 🔍 **Advanced Search & Filtering** - Powerful search capabilities across all resources

## Tech Stack

- **Backend**: Node.js (ES6+), Express
- **Database**: PostgreSQL with Sequelize ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Payment**: Razorpay
- **Architecture**: Layered Architecture (Repository → Service → Controller → Routes)

## Architecture

The application follows a clean **layered architecture** pattern:

```
┌─────────────────────────────────────────┐
│            Routes Layer                 │
│  (HTTP routing & middleware)            │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│         Controller Layer                │
│  (Business logic, validation,           │
│   authorization, transactions)          │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│          Service Layer                  │
│  (Thin wrapper, orchestration)          │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│        Repository Layer                 │
│  (Database operations, Sequelize)       │
└─────────────────────────────────────────┘
```

### Layer Responsibilities

- **Routes**: Define endpoints, apply middleware (auth, rate limiting)
- **Controller**: Handle business logic, validation, error handling, transactions
- **Service**: Thin coordination layer between controller and repository
- **Repository**: Direct database operations using Sequelize

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn
- Razorpay account (for payment features)

## Installation

1. **Clone the repository:**
```bash
git clone <your-repo-url>
cd Freelancer_website
```

2. **Install dependencies:**
```bash
npm install
```

3. **Create a `.env` file in the root directory:**
```bash
cp .env.example .env
```

4. **Update the `.env` file with your configuration:**
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=freelancer_website
DB_USER=your_db_user
DB_PASS=your_db_password

# Server
NODE_ENV=development
PORT=5000

# JWT
JWT_SECRET=your_jwt_secret_key_here

# Razorpay (optional, for payment features)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

5. **Create the PostgreSQL database:**
```bash
createdb freelancer_website
```

## Running the Application

### Development mode (with auto-reload):
```bash
npm run dev
```

### Production mode:
```bash
npm start
```

The server will start on `http://localhost:5000` (or the PORT specified in your .env file).

## Project Structure

```
Freelancer_website/
├── app.js                           # Application entry point
├── src/
│   ├── config/                      # Configuration files
│   │   ├── config.js                # Environment configuration
│   │   └── database.js              # Database connection & Sequelize setup
│   │
│   ├── model/                       # Sequelize models
│   │   ├── User.js                  # User model
│   │   ├── Profile.js               # Profile model
│   │   ├── Project.js               # Project model
│   │   ├── Proposal.js              # Proposal model
│   │   ├── Contract.js              # Contract model
│   │   ├── Milestone.js             # Milestone model
│   │   ├── PaymentOrder.js          # Payment order model
│   │   ├── Skill.js                 # Skill model
│   │   ├── ProfileSkill.js          # Profile-Skill junction model
│   │   ├── PortfolioItem.js         # Portfolio item model
│   │   └── index.js                 # Model exports & associations
│   │
│   ├── data-access/                 # Repository layer
│   │   └── concrete/
│   │       ├── UserRepository.js
│   │       ├── ProfileRepository.js
│   │       ├── ProjectRepository.js
│   │       ├── ProposalRepository.js
│   │       ├── ContractRepository.js
│   │       ├── MilestoneRepository.js
│   │       ├── PaymentOrderRepository.js
│   │       ├── SkillRepository.js
│   │       └── PortfolioItemRepository.js
│   │
│   ├── service/                     # Service layer
│   │   ├── abstract/                # Service interfaces
│   │   │   ├── IUserService.js
│   │   │   ├── IProfileService.js
│   │   │   ├── IProjectService.js
│   │   │   ├── IProposalService.js
│   │   │   ├── IContractService.js
│   │   │   ├── IMilestoneService.js
│   │   │   ├── IPaymentOrderService.js
│   │   │   ├── ISkillService.js
│   │   │   └── IPortfolioItemService.js
│   │   └── concrete/                # Service implementations
│   │       ├── UserService.js
│   │       ├── ProfileService.js
│   │       ├── ProjectService.js
│   │       ├── ProposalService.js
│   │       ├── ContractService.js
│   │       ├── MilestoneService.js
│   │       ├── PaymentOrderService.js
│   │       ├── SkillService.js
│   │       └── PortfolioItemService.js
│   │
│   ├── controller/                  # Controller layer (business logic)
│   │   ├── UserController.js
│   │   ├── ProfileController.js
│   │   ├── ProjectController.js
│   │   ├── ProposalController.js
│   │   ├── ContractController.js
│   │   ├── MilestoneController.js
│   │   ├── PaymentOrderController.js
│   │   ├── SkillController.js
│   │   └── PortfolioItemController.js
│   │
│   ├── routes/                      # Route definitions
│   │   ├── index.js                 # Main router
│   │   ├── UserRoutes.js
│   │   ├── ProfileRoutes.js
│   │   ├── ProjectRoutes.js
│   │   ├── ProposalRoutes.js
│   │   ├── ContractRoutes.js
│   │   ├── MilestoneRoutes.js
│   │   ├── PaymentOrderRoutes.js
│   │   ├── SkillRoutes.js
│   │   └── PortfolioItemRoutes.js
│   │
│   └── middlewares/                 # Custom middlewares
│       ├── jwt.js                   # JWT authentication middleware
│       └── rateLimiter.js           # Rate limiting middleware
│
├── package.json
├── .env.example
└── README.md
```

## Database Models

### Core Models

- **User**: User accounts (clients, freelancers, admins)
  - Fields: name, email, password, role, status, phone
  - Relations: hasOne Profile, hasMany Projects (as client), hasMany Proposals (as freelancer)

- **Profile**: Detailed user profiles for freelancers
  - Fields: displayName, bio, hourlyRate, location, experienceLevel, profilePhoto, isVerified
  - Relations: belongsTo User, belongsToMany Skills, hasMany PortfolioItems

- **Skill**: Available skills in the platform
  - Fields: name
  - Relations: belongsToMany Profiles

- **PortfolioItem**: Portfolio work samples
  - Fields: title, description, imageUrl, projectUrl
  - Relations: belongsTo Profile

- **Project**: Client posted projects
  - Fields: title, description, budgetMin, budgetMax, status
  - Relations: belongsTo User (client), hasMany Proposals, hasOne Contract

- **Proposal**: Freelancer proposals for projects
  - Fields: coverLetter, bidAmount, durationInDays, status
  - Relations: belongsTo Project, belongsTo User (freelancer)

- **Contract**: Active contracts
  - Fields: projectId, clientId, freelancerId, status
  - Relations: belongsTo Project, hasMany Milestones

- **Milestone**: Contract milestones
  - Fields: title, amount, dueDate, status
  - Relations: belongsTo Contract, hasOne PaymentOrder

- **PaymentOrder**: Payment transactions
  - Fields: razorpayOrderId, amount, currency, status
  - Relations: belongsTo Milestone, belongsTo User

## API Endpoints

Base URL: `http://localhost:5000/api`

### Health Check
- `GET /api/health` - API health check

### User Management
- `POST /api/users/register` - Register new user (with rate limiting)
- `POST /api/users/login` - Login user (with rate limiting)
- `GET /api/users/profile` - Get current user profile (authenticated)
- `PUT /api/users/profile` - Update user profile (authenticated)
- `POST /api/users/change-password` - Change password (authenticated)
- `GET /api/users` - Get all users (authenticated, admin)
- `GET /api/users/:id` - Get user by ID (authenticated)
- `PUT /api/users/:id` - Update user (authenticated, admin)
- `DELETE /api/users/:id` - Delete user (authenticated, admin)

### Profile Management
- `POST /api/profiles` - Create profile (authenticated)
- `GET /api/profiles` - Get all profiles (authenticated)
- `GET /api/profiles/:id` - Get profile by ID (authenticated)
- `GET /api/profiles/user/:userId` - Get profile by user ID (authenticated)
- `GET /api/profiles/dropdown` - Get profiles for dropdown (authenticated)
- `PUT /api/profiles/:id` - Update profile (authenticated, owner/admin)
- `DELETE /api/profiles/:id` - Delete profile (authenticated, owner/admin)
- `POST /api/profiles/skills/add` - Add skill to profile (authenticated)
- `POST /api/profiles/skills/remove` - Remove skill from profile (authenticated)

### Project Management
- `POST /api/projects` - Create project (authenticated)
- `GET /api/projects` - Get all projects (authenticated)
- `GET /api/projects/:id` - Get project by ID (authenticated)
- `GET /api/projects/client/:clientId` - Get projects by client (authenticated)
- `GET /api/projects/status/:status` - Get projects by status (authenticated)
- `GET /api/projects/dropdown` - Get projects for dropdown (authenticated)
- `PUT /api/projects/:id` - Update project (authenticated, owner/admin)
- `PUT /api/projects/:id/status` - Update project status (authenticated, owner/admin)
- `DELETE /api/projects/:id` - Delete project (authenticated, owner/admin)

### Proposal Management
- `POST /api/proposals` - Create proposal (authenticated)
- `GET /api/proposals` - Get all proposals (authenticated)
- `GET /api/proposals/:id` - Get proposal by ID (authenticated)
- `GET /api/proposals/project/:projectId` - Get proposals by project (authenticated)
- `GET /api/proposals/freelancer/:freelancerId` - Get proposals by freelancer (authenticated)
- `PUT /api/proposals/:id` - Update proposal (authenticated, owner/admin)
- `PUT /api/proposals/:id/status` - Update proposal status (authenticated, project owner/admin)
- `DELETE /api/proposals/:id` - Delete proposal (authenticated, owner/admin)

### Contract Management
- `POST /api/contracts` - Create contract (authenticated, project owner)
- `GET /api/contracts` - Get all contracts (authenticated)
- `GET /api/contracts/:id` - Get contract by ID (authenticated)
- `GET /api/contracts/project/:projectId` - Get contract by project (authenticated)
- `GET /api/contracts/client/:clientId` - Get contracts by client (authenticated)
- `GET /api/contracts/freelancer/:freelancerId` - Get contracts by freelancer (authenticated)
- `PUT /api/contracts/:id` - Update contract (authenticated, involved parties)
- `PUT /api/contracts/:id/status` - Update contract status (authenticated, involved parties)
- `DELETE /api/contracts/:id` - Delete contract (authenticated, admin only)

### Milestone Management
- `POST /api/milestones` - Create milestone (authenticated, contract parties)
- `GET /api/milestones` - Get all milestones (authenticated)
- `GET /api/milestones/:id` - Get milestone by ID (authenticated)
- `GET /api/milestones/contract/:contractId` - Get milestones by contract (authenticated)
- `PUT /api/milestones/:id` - Update milestone (authenticated, contract parties)
- `PUT /api/milestones/:id/status` - Update milestone status (authenticated, client)
- `DELETE /api/milestones/:id` - Delete milestone (authenticated, client/admin)

### Payment Management
- `POST /api/payments` - Create payment order (authenticated, client)
- `GET /api/payments` - Get all payment orders (authenticated)
- `GET /api/payments/:id` - Get payment order by ID (authenticated)
- `GET /api/payments/user/:userId` - Get payment orders by user (authenticated)
- `PUT /api/payments/status` - Update payment status (webhook)
- `DELETE /api/payments/:id` - Delete payment order (authenticated, admin only)

### Skill Management
- `POST /api/skills` - Create skill (authenticated)
- `GET /api/skills` - Get all skills (authenticated)
- `GET /api/skills/:id` - Get skill by ID (authenticated)
- `GET /api/skills/dropdown` - Get skills for dropdown (authenticated)
- `PUT /api/skills/:id` - Update skill (authenticated)
- `DELETE /api/skills/:id` - Delete skill (authenticated, admin only)

### Portfolio Management
- `POST /api/portfolio` - Create portfolio item (authenticated)
- `POST /api/portfolio/bulk` - Bulk create portfolio items (authenticated)
- `GET /api/portfolio` - Get all portfolio items (authenticated)
- `GET /api/portfolio/:id` - Get portfolio item by ID (authenticated)
- `GET /api/portfolio/profile/:profileId` - Get portfolio items by profile (authenticated)
- `PUT /api/portfolio/:id` - Update portfolio item (authenticated, owner/admin)
- `DELETE /api/portfolio/:id` - Delete portfolio item (authenticated, owner/admin)

## Authentication

The API uses JWT (JSON Web Tokens) for authentication.

### Getting Started

1. **Register a new account:**
```bash
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePassword123",
    "role": "freelancer"
  }'
```

2. **Login to get JWT token:**
```bash
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePassword123"
  }'
```

3. **Use the token in subsequent requests:**
```bash
curl -X GET http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Security Features

- **Password Hashing**: All passwords are hashed using bcrypt
- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: 
  - Login: 5 attempts per 15 minutes
  - Registration: 3 attempts per 15 minutes
- **Role-based Access Control**: Admin, Client, Freelancer roles
- **Input Validation**: Comprehensive validation on all endpoints
- **Transaction Management**: Database transactions for data consistency

## Development

### Database Synchronization

In development mode, the application uses Sequelize's `sync({ alter: true })` to automatically update the database schema:

```javascript
await sequelize.sync({ alter: true });
```

For production, consider using migrations:

```bash
npx sequelize-cli migration:generate --name your-migration-name
```

### Adding a New Module

To add a new module following the architecture:

1. **Create Model** in `src/model/`
2. **Create Repository** in `src/data-access/concrete/`
3. **Create Service Interface** in `src/service/abstract/`
4. **Create Service** in `src/service/concrete/`
5. **Create Controller** in `src/controller/`
6. **Create Routes** in `src/routes/`
7. **Register Routes** in `src/routes/index.js`

## Environment Variables

Create a `.env` file with the following variables:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=freelancer_website
DB_USER=your_database_user
DB_PASS=your_database_password

# Server Configuration
NODE_ENV=development
PORT=5000

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production

# Razorpay Configuration (for payments)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

## Testing

```bash
# Run tests (when test suite is set up)
npm test
```

## Deployment

### Production Considerations

1. Set `NODE_ENV=production` in your environment
2. Use strong `JWT_SECRET`
3. Enable HTTPS
4. Set up proper database backups
5. Use migrations instead of `sync({ alter: true })`
6. Set up monitoring and logging
7. Configure CORS for your frontend domain

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

ISC

## Contact

For questions or support, please contact the development team.

---

**Built with ❤️ using Node.js and Express**
