# Port PR Chart - Backend/Frontend Separation

![Port PR Chart Example](https://github.com/port-experimental/oss-images/blob/main/example-code.png)

A modern, separated architecture for Port API data visualization with automatic token rotation and clean API design.

## 🏗️ Architecture

```
/backend/                 # Express.js API Server
├── server.js            # Main server with CORS & routing
├── routes/
│   ├── port.js          # Port API endpoints
│   └── auth.js          # Authentication endpoints
├── services/
│   ├── portService.js   # Port API integration
│   └── tokenManager.js  # Token rotation & management
└── package.json         # Backend dependencies

/frontend/               # Clean Frontend
├── index.html          # Modern HTML structure
├── css/
│   └── styles.css     # Responsive styling
└── js/
    ├── api.js         # API client
    ├── chart.js       # Chart management
    └── app.js         # Main application logic
```

## 🚀 Quick Start

### 1. Set Environment Variables
```bash
# Set your Port API token
export PORT_API_TOKEN_PRIMARY="your_actual_token_here"

# Optional: Set backup token for rotation
export PORT_API_TOKEN_SECONDARY="your_backup_token_here"

# Optional: Set region (us, eu, us-api, eu-api)
export PORT_API_REGION="us"
```

### 2. Install Dependencies
```bash
cd backend
npm install
```

### 3. Start the Server
```bash
npm start
```

### 4. Access the Application
- **Frontend**: http://localhost:8000
- **API**: http://localhost:8000/api
- **Health Check**: http://localhost:8000/health

## 🔧 Backend API Endpoints

### Authentication
- `POST /api/auth/validate` - Validate environment token
- `GET /api/auth/status` - Get token status
- `POST /api/auth/rotate` - Manually rotate token

### Port Data
- `GET /api/port/entities?blueprint=github_pull_request` - Fetch entities
- `GET /api/port/blueprints` - List blueprints
- `GET /api/port/properties?blueprint=github_pull_request` - Extract properties
- `GET /api/port/values/:property?blueprint=github_pull_request` - Get property values

### Health
- `GET /health` - Health check endpoint

## 🔑 Token Management

### Environment Variables (Vault-Ready)
```bash
# Option 1: Client Credentials (Recommended for Production)
export PORT_CLIENT_ID="your_client_id"
export PORT_CLIENT_SECRET="your_client_secret"

# Option 2: Manual Tokens (Legacy)
export PORT_API_TOKEN_PRIMARY="your_primary_token"
export PORT_API_TOKEN_SECONDARY="your_backup_token"
export PORT_SERVICE_TOKEN="your_service_token"

# Optional Configuration
export PORT_API_REGION="us"  # or "eu", "us-api", "eu-api"
```

**🔐 Vault Integration**: For production deployments, use HashiCorp Vault, AWS Secrets Manager, Azure Key Vault, or Kubernetes Secrets to securely manage these environment variables. The application is designed to work seamlessly with any secret management system that injects secrets as environment variables.

### Authentication Methods
- **Client Credentials**: Automatic token generation using Port's `/v1/auth/access_token` endpoint
- **Manual Tokens**: Traditional API tokens with automatic rotation
- **Hybrid**: Client credentials for generation + backup tokens for fallback

### Automatic Rotation & Refresh
- **Programmatic Generation**: Creates new tokens using client credentials
- **Error-Based Refresh**: Immediately refreshes tokens on 401/403 errors
- **Timer-Based Rotation**: Every 2.5 hours (before 3-hour expiry)
- **Fallback Support**: Uses backup tokens if generation fails
- **Retry Logic**: Automatically retries failed requests with new tokens

## 🎨 Frontend Features

### Modern UI
- **Responsive Design**: Works on desktop and mobile
- **Clean Layout**: Organized sections with clear hierarchy
- **Interactive Charts**: Chart.js with smooth animations
- **Real-time Updates**: Live chart updates on filter changes

### Chart Controls
- **Chart Types**: Bar and Line charts
- **Metrics**: Hours, Count, Average Hours
- **Time Ranges**: Days (7, 30, 90) and Months (Jan-Dec)
- **Filtering**: JSON property-based filtering

### Data Exploration
- **Property Discovery**: Automatically extracts all available properties
- **Value Filtering**: Filter by specific property values
- **Manual Input**: Editable filter expressions
- **Clear Filters**: Reset to show all data

## 🔄 API Integration

### Frontend → Backend Communication
```javascript
// Example API calls
const apiClient = new ApiClient();

// Validate token
await apiClient.validateToken();

// Load entities
const response = await apiClient.getEntities('github_pull_request');
const entities = response.data;

// Get properties
const properties = await apiClient.getProperties('github_pull_request');
```

### Error Handling
- **HTTP Status Codes**: Proper error responses
- **User-Friendly Messages**: Clear error descriptions
- **Retry Logic**: Automatic token rotation on failure
- **Debug Information**: Console logging for troubleshooting

## 🛡️ Security Features

### CORS Configuration
```javascript
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:8001'],
    credentials: true
}));
```

### Token Security
- **Environment Variables**: No hardcoded tokens
- **Automatic Rotation**: Prevents token expiry
- **Validation**: Tests tokens before use
- **Vault Ready**: Easy integration with secret management

## 📊 Data Processing

### Entity Processing
1. **Fetch**: Get entities from Port API
2. **Extract**: Discover all available properties
3. **Filter**: Apply time range and property filters
4. **Aggregate**: Group by date and calculate metrics
5. **Visualize**: Render interactive charts

### Metrics Calculation
- **Hours**: Time difference between createdAt and updatedAt
- **Count**: Number of entities per day
- **Average Hours**: Mean hours per entity per day

## 🔧 Development

### Backend Development
```bash
cd backend
npm run dev  # Uses nodemon for auto-restart
```

### Frontend Development
- **Hot Reload**: Changes reflect immediately
- **Modular JS**: Separated concerns (API, Chart, App)
- **Modern CSS**: Flexbox and Grid layouts
- **Responsive**: Mobile-first design

## 🚀 Deployment

### Production Setup
1. **Environment Variables**: Set all required tokens
2. **Process Manager**: Use PM2 or similar
3. **Reverse Proxy**: Nginx for SSL termination
4. **Health Checks**: Monitor `/health` endpoint

### Docker Support
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm install --production
COPY backend/ .
EXPOSE 8000
CMD ["npm", "start"]
```

## 🔍 Troubleshooting

### Common Issues
1. **Token Expiry**: Check automatic rotation logs
2. **CORS Errors**: Verify allowed origins
3. **API Errors**: Check Port API status
4. **Chart Issues**: Verify data format

### Debug Mode
```bash
# Enable debug logging
DEBUG=port-api:* npm start
```

## 📈 Future Enhancements

### Planned Features
- **Real-time Updates**: WebSocket integration
- **Export Functionality**: CSV/PDF export
- **Advanced Filtering**: Complex query builder
- **Dashboard**: Multiple chart views
- **Authentication**: User login system

### Vault Integration
- **HashiCorp Vault**: Automatic secret injection
- **AWS Secrets Manager**: Cloud-native secret management
- **Azure Key Vault**: Microsoft cloud integration
- **Kubernetes Secrets**: Container orchestration support

## 📝 License

MIT License - see LICENSE file for details.