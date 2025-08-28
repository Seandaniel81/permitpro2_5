# File: /home/archie/codebase/permitpro/INSTALL.md

```markdown
# PermitPro Installation Guide

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Quick Start](#quick-start)
3. [Detailed Installation](#detailed-installation)
4. [Database Setup](#database-setup)
5. [Environment Configuration](#environment-configuration)
6. [Development Setup](#development-setup)
7. [Production Deployment](#production-deployment)
8. [Troubleshooting](#troubleshooting)
9. [Verification](#verification)

## System Requirements

### Minimum Requirements
- **Node.js**: 16.x or higher
- **npm**: 8.x or higher (or yarn 1.22+)
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 2GB free space
- **OS**: Windows 10+, macOS 10.15+, or Linux (Ubuntu 18.04+)

### Database Requirements
- **SQLite**: Included (for development)
- **PostgreSQL**: 12+ (for production)
- **MySQL**: 8.0+ (alternative for production)

### Browser Support
- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+

## Quick Start

For developers who want to get up and running quickly:

```bash
# Clone the repository
git clone https://github.com/your-org/permitpro.git
cd permitpro

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Initialize database
npm run db:setup

# Start development servers
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

**Default Login Credentials:**
- Email: `admin@permitpro.com`
- Password: `password123`

## Detailed Installation

### Step 1: Clone the Repository

```bash
git clone https://github.com/your-org/permitpro.git
cd permitpro
```

### Step 2: Install Node.js Dependencies

#### For the entire project:
```bash
npm install
```

#### Or install client and server separately:
```bash
# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

### Step 3: Verify Installation

```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Verify dependencies
npm list --depth=0
```

## Database Setup

### Development (SQLite)

SQLite is used by default for development and requires no additional setup:

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed the database (optional)
npx prisma db seed
```

### Production (PostgreSQL)

#### Install PostgreSQL:

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

**macOS (using Homebrew):**
```bash
brew install postgresql
brew services start postgresql
```

**Windows:**
Download and install from [PostgreSQL official website](https://www.postgresql.org/download/windows/)

#### Create Database:
```bash
# Connect to PostgreSQL
sudo -u postgres psql

# Create database and user
CREATE DATABASE permitpro;
CREATE USER permitpro_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE permitpro TO permitpro_user;
\q
```

#### Update Environment Variables:
```bash
# In your .env file
DATABASE_URL="postgresql://permitpro_user:your_secure_password@localhost:5432/permitpro"
```

#### Run Migrations:
```bash
npx prisma migrate deploy
```

## Environment Configuration

### Create Environment File

```bash
cp .env.example .env
```

### Configure Environment Variables

Edit the `.env` file with your specific settings:

```bash
# File: /home/archie/codebase/permitpro/.env.example
# Database Configuration
DATABASE_URL="file:./dev.db"  # SQLite for development
# DATABASE_URL="postgresql://user:password@localhost:5432/permitpro"  # PostgreSQL for production

# JWT Configuration
JWT_SECRET="your-super-secure-jwt-secret-key-here"
JWT_EXPIRES_IN="7d"

# Server Configuration
PORT=3001
NODE_ENV="development"

# Client Configuration
REACT_APP_API_URL="http://localhost:3001/api"

# File Upload Configuration
MAX_FILE_SIZE="10485760"  # 10MB in bytes
UPLOAD_DIR="./uploads"

# Email Configuration (optional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Logging
LOG_LEVEL="info"
```

### Security Configuration

For production, ensure you:

1. **Generate a secure JWT secret:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

2. **Set strong database passwords**
3. **Configure HTTPS certificates**
4. **Set up proper CORS origins**

## Development Setup

### Start Development Servers

#### Option 1: Concurrent Development (Recommended)
```bash
# Install concurrently if not already installed
npm install -g concurrently

# Start both client and server
npm run dev
```

#### Option 2: Separate Terminals
```bash
# Terminal 1: Start the server
cd server
npm run dev

# Terminal 2: Start the client
cd client
npm start
```

### Development URLs
- **Client**: http://localhost:3000
- **Server API**: http://localhost:3001
- **Database Admin** (if using Prisma Studio): http://localhost:5555

### Development Tools

#### Prisma Studio (Database GUI)
```bash
npx prisma studio
```

#### API Testing
```bash
# Install HTTPie for API testing
pip install httpie

# Test API endpoints
http GET localhost:3001/api/packages Authorization:"Bearer YOUR_JWT_TOKEN"
```

## Production Deployment

### Build for Production

```bash
# Build client
cd client
npm run build

# The build folder contains optimized static files
```

### Server Deployment Options

#### Option 1: PM2 (Process Manager)
```bash
# Install PM2 globally
npm install -g pm2

# Start the application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save
pm2 startup
```

#### Option 2: Docker Deployment
```bash
# Build Docker image
docker build -t permitpro .

# Run container
docker run -d -p 3000:3000 --env-file .env permitpro
```

#### Option 3: Traditional Server
```bash
# Set production environment
export NODE_ENV=production

# Start server
npm start
```

### Nginx Configuration

```nginx
# File: /etc/nginx/sites-available/permitpro
server {
    listen 80;
    server_name your-domain.com;

    # Serve static files
    location / {
        root /path/to/permitpro/client/build;
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### SSL Configuration (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## Troubleshooting

### Common Installation Issues

#### Node.js Version Conflicts
```bash
# Install Node Version Manager (nvm)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Install and use correct Node.js version
nvm install 18
nvm use 18
```

#### Permission Errors (Linux/macOS)
```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules
```

#### Port Already in Use
```bash
# Find process using port 3000
lsof -ti:3000

# Kill the process
kill -9 $(lsof -ti:3000)
```

#### Database Connection Issues
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Restart PostgreSQL
sudo systemctl restart postgresql

# Check database connectivity
psql -h localhost -U permitpro_user -d permitpro
```

### Build Issues

#### Clear npm cache
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

#### Prisma Issues
```bash
# Reset Prisma
npx prisma migrate reset
npx prisma generate
npx prisma db push
```

### Runtime Issues

#### Check logs
```bash
# Server logs
tail -f server/logs/app.log

# PM2 logs
pm2 logs

# Docker logs
docker logs container_name
```

## Verification

### Verify Installation

Run the verification script to ensure everything is working:

```bash
# File: /home/archie/codebase/permitpro/scripts/verify-install.js
const http = require('http');
const fs = require('fs');

console.log('🔍 Verifying PermitPro Installation...\n');

// Check Node.js version
const nodeVersion = process.version;
console.log(`✅ Node.js version: ${nodeVersion}`);

// Check if required files exist
const requiredFiles = [
  'package.json',
  'client/package.json',
  'server/package.json',
  '.env'
];

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} exists`);
  } else {
    console.log(`❌ ${file} missing`);
  }
});

// Check server connectivity
const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/health',
  method: 'GET'
};

const req = http.request(options, (res) => {
  if (res.statusCode === 200) {
    console.log('✅ Server is responding');
  } else {
    console.log(`❌ Server returned status: ${res.statusCode}`);
  }
});

req.on('error', (err) => {
  console.log(`❌ Server connection failed: ${err.message}`);
});

req.end();

console.log('\n🎉 Installation verification complete!');
```

Run verification:
```bash
node scripts/verify-install.js
```

### Test Basic Functionality

1. **Login Test:**
   - Navigate to http://localhost:3000
   - Login with default credentials
   - Verify dashboard loads

2. **API Test:**
   ```bash
   curl -X GET http://localhost:3001/api/health
   ```

3. **Database Test:**
   ```bash
   npx prisma studio
   # Verify tables are created and accessible
   ```

### Performance Check

```bash
# Install lighthouse CLI
npm install -g lighthouse

# Run performance audit
lighthouse http://localhost:3000 --output html --output-path ./lighthouse-report.html
```

## Next Steps

After successful installation:

1. **Read the [Documentation](README.md)** for detailed usage instructions
2. **Configure your environment** for your specific needs
3. **Set up monitoring** and logging for production
4. **Create backups** of your database
5. **Set up CI/CD pipelines** for automated deployments

## Support

If you encounter issues during installation:

1. **Check the [Troubleshooting](#troubleshooting)** section above
2. **Review the logs** for error messages
3. **Search existing issues** in the project repository
4. **Create a new issue** with detailed error information

### Getting Help

- **Documentation**: [README.md](README.