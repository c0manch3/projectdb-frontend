# CORS Configuration Guide

This document explains how to properly configure CORS (Cross-Origin Resource Sharing) for your ProjectDB application to allow the frontend (lencondb.ru) to communicate with the backend API (209.38.74.75:3000).

## Understanding CORS

CORS is a security feature implemented by browsers to prevent unauthorized cross-origin requests. Since your frontend and backend are on different origins, you need to configure CORS properly.

### Current Setup
- **Frontend:** https://lencondb.ru (production) / http://localhost:5173 (development)
- **Backend API:** http://209.38.74.75:3000

## Backend CORS Configuration

### Option 1: Express.js with 'cors' Package (Recommended)

Install the CORS package on your backend:
```bash
npm install cors
npm install --save-dev @types/cors  # If using TypeScript
```

Configure CORS in your backend application:

```javascript
// backend/src/app.js or backend/src/index.js

const express = require('express');
const cors = require('cors');

const app = express();

// CORS Configuration
const corsOptions = {
  // Allow requests from these origins
  origin: [
    'https://lencondb.ru',
    'https://www.lencondb.ru',
    'http://localhost:5173',  // Development
    'http://localhost:3001',  // Preview mode
  ],

  // Allow credentials (cookies, authorization headers)
  credentials: true,

  // Allowed HTTP methods
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],

  // Allowed headers
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
  ],

  // Exposed headers (headers that frontend can access)
  exposedHeaders: [
    'Content-Range',
    'X-Content-Range',
    'X-Total-Count',
  ],

  // Preflight request cache duration (in seconds)
  maxAge: 86400, // 24 hours

  // Include credentials in preflight requests
  optionsSuccessStatus: 204,
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Your routes here...
app.use('/api', apiRoutes);

// Start server
app.listen(3000, () => {
  console.log('Backend server running on port 3000');
});
```

### Option 2: TypeScript Express with Custom Middleware

```typescript
// backend/src/app.ts

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';

const app = express();

// Custom CORS middleware with detailed logging
const corsMiddleware = cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      'https://lencondb.ru',
      'https://www.lencondb.ru',
      'http://localhost:5173',
      'http://localhost:3001',
    ];

    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      console.log(`✓ CORS: Allowing origin ${origin}`);
      callback(null, true);
    } else {
      console.warn(`✗ CORS: Blocking origin ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Range', 'X-Content-Range', 'X-Total-Count'],
  maxAge: 86400,
});

app.use(corsMiddleware);

// Additional CORS headers for preflight requests
app.options('*', cors(corsOptions));

// Your routes
app.use('/api', apiRoutes);

export default app;
```

### Option 3: Manual CORS Headers (Without Package)

```javascript
// backend/src/middleware/cors.js

const allowedOrigins = [
  'https://lencondb.ru',
  'https://www.lencondb.ru',
  'http://localhost:5173',
  'http://localhost:3001',
];

const corsMiddleware = (req, res, next) => {
  const origin = req.headers.origin;

  // Check if origin is allowed
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  // Allow credentials
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Allowed methods
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, PATCH, OPTIONS'
  );

  // Allowed headers
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Requested-With, Accept'
  );

  // Exposed headers
  res.setHeader(
    'Access-Control-Expose-Headers',
    'Content-Range, X-Content-Range, X-Total-Count'
  );

  // Preflight cache duration
  res.setHeader('Access-Control-Max-Age', '86400');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
};

module.exports = corsMiddleware;
```

Then apply it in your app:
```javascript
const corsMiddleware = require('./middleware/cors');
app.use(corsMiddleware);
```

## WebSocket CORS Configuration

If you're using Socket.io for real-time communication:

```javascript
// backend/src/socket.js

const { Server } = require('socket.io');

const io = new Server(server, {
  cors: {
    origin: [
      'https://lencondb.ru',
      'https://www.lencondb.ru',
      'http://localhost:5173',
    ],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Your socket handlers...
});
```

## Environment-Based CORS Configuration

For different environments (development, staging, production):

```javascript
// backend/src/config/cors.js

const getEnvVariable = (key, defaultValue) => {
  return process.env[key] || defaultValue;
};

const getAllowedOrigins = () => {
  const env = process.env.NODE_ENV || 'development';

  const origins = {
    development: [
      'http://localhost:5173',
      'http://localhost:3001',
      'http://127.0.0.1:5173',
    ],
    production: [
      'https://lencondb.ru',
      'https://www.lencondb.ru',
    ],
    staging: [
      'https://staging.lencondb.ru',
      'http://localhost:5173', // Allow local dev
    ],
  };

  return origins[env] || origins.development;
};

const corsOptions = {
  origin: getAllowedOrigins(),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Range', 'X-Content-Range', 'X-Total-Count'],
  maxAge: 86400,
};

module.exports = corsOptions;
```

## Testing CORS Configuration

### 1. Test with curl
```bash
# Test preflight request
curl -X OPTIONS http://209.38.74.75:3000/api/endpoint \
  -H "Origin: https://lencondb.ru" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type,Authorization" \
  -v

# Test actual request
curl -X GET http://209.38.74.75:3000/api/endpoint \
  -H "Origin: https://lencondb.ru" \
  -v
```

### 2. Test in Browser Console
```javascript
// Open browser console on https://lencondb.ru
fetch('http://209.38.74.75:3000/api/endpoint', {
  method: 'GET',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
  },
})
  .then(response => response.json())
  .then(data => console.log('Success:', data))
  .catch(error => console.error('CORS Error:', error));
```

### 3. Check Response Headers
Look for these headers in the response:
```
Access-Control-Allow-Origin: https://lencondb.ru
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept
```

## Common CORS Issues and Solutions

### Issue 1: "No 'Access-Control-Allow-Origin' header is present"
**Solution:** Ensure CORS middleware is applied before your routes.

```javascript
// CORRECT ORDER
app.use(cors(corsOptions));  // First
app.use('/api', apiRoutes);   // Then routes
```

### Issue 2: "Credentials flag is true, but Access-Control-Allow-Credentials is not"
**Solution:** Set `credentials: true` in CORS options.

```javascript
const corsOptions = {
  origin: 'https://lencondb.ru',
  credentials: true,  // Add this
};
```

### Issue 3: Preflight OPTIONS requests failing
**Solution:** Explicitly handle OPTIONS requests.

```javascript
app.options('*', cors(corsOptions));
```

### Issue 4: "The value of the 'Access-Control-Allow-Origin' header must not be the wildcard '*'"
**Solution:** When using credentials, you cannot use wildcard. Specify exact origins.

```javascript
// WRONG (with credentials)
origin: '*'

// CORRECT
origin: ['https://lencondb.ru', 'https://www.lencondb.ru']
```

### Issue 5: Custom headers not accessible in frontend
**Solution:** Add headers to `exposedHeaders`.

```javascript
const corsOptions = {
  exposedHeaders: ['X-Total-Count', 'X-Custom-Header'],
};
```

## Nginx CORS Configuration (Alternative)

If you want nginx to handle CORS instead of the backend:

```nginx
# /etc/nginx/sites-available/backend-api

server {
    listen 80;
    server_name api.lencondb.ru;

    location / {
        # CORS headers
        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' 'https://lencondb.ru' always;
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, PATCH, OPTIONS' always;
            add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization' always;
            add_header 'Access-Control-Allow-Credentials' 'true' always;
            add_header 'Access-Control-Max-Age' 86400 always;
            add_header 'Content-Length' 0;
            add_header 'Content-Type' 'text/plain';
            return 204;
        }

        add_header 'Access-Control-Allow-Origin' 'https://lencondb.ru' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, PATCH, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization' always;

        # Proxy to backend
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Security Best Practices

### 1. Never use wildcard (*) with credentials
```javascript
// INSECURE
origin: '*',
credentials: true,

// SECURE
origin: ['https://lencondb.ru'],
credentials: true,
```

### 2. Whitelist specific origins
```javascript
// INSECURE
origin: true,  // Allows all origins

// SECURE
origin: ['https://lencondb.ru', 'https://www.lencondb.ru'],
```

### 3. Limit allowed methods
```javascript
// Only allow methods your API actually uses
methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
```

### 4. Limit allowed headers
```javascript
// Only allow headers your API needs
allowedHeaders: ['Content-Type', 'Authorization'],
```

### 5. Use environment variables
```javascript
const allowedOrigins = process.env.CORS_ORIGINS?.split(',') || ['https://lencondb.ru'];
```

## Production Checklist

- [ ] CORS is configured in backend
- [ ] Only production domains are whitelisted
- [ ] Credentials are enabled if using authentication
- [ ] Preflight requests are handled correctly
- [ ] Custom headers are exposed if needed
- [ ] WebSocket CORS is configured (if using Socket.io)
- [ ] CORS is tested with actual requests
- [ ] No wildcard origins in production
- [ ] Environment-specific configuration is used

## Monitoring CORS

Add logging to monitor CORS requests:

```javascript
app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (req.method === 'OPTIONS') {
    console.log(`CORS Preflight: ${origin} → ${req.method} ${req.path}`);
  }

  next();
});
```

## Additional Resources

- [MDN CORS Documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Express CORS Package](https://www.npmjs.com/package/cors)
- [Socket.io CORS Documentation](https://socket.io/docs/v4/handling-cors/)

---

**Note:** After updating CORS configuration on the backend, restart your backend server for changes to take effect.

```bash
# Restart backend
pm2 restart backend  # If using PM2
# OR
systemctl restart backend  # If using systemd
# OR
docker restart projectdb-backend  # If using Docker
```
