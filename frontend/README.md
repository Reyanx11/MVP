# RAG Chatbot Frontend

A React-based frontend for the RAG (Retrieval-Augmented Generation) Chatbot application.

## Features

- **User Authentication**: Register and login with JWT tokens
- **Role-Based Access**: Admin and department-specific roles
- **Dashboard**: Quick overview of documents and stats
- **Chat Interface**: Ask questions about uploaded documents with source citations
- **Document Management**: Upload and manage documents (Admin only)
- **Semantic Search**: AI-powered search across documents

## Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment

Create a `.env` file in the frontend directory:

```bash
cp .env.example .env
```

Edit `.env` if your backend is running on a different URL:

```
REACT_APP_API_URL=http://localhost:8000
```

### 3. Start Development Server

```bash
npm start
```

The app will open at `http://localhost:3000`

## Project Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Navbar.js
│   │   └── PrivateRoute.js
│   ├── pages/
│   │   ├── Chat.js
│   │   ├── Dashboard.js
│   │   ├── Documents.js
│   │   ├── Login.js
│   │   └── Register.js
│   ├── styles/
│   │   ├── Auth.css
│   │   ├── Chat.css
│   │   ├── Dashboard.css
│   │   ├── Documents.css
│   │   └── Navbar.css
│   ├── App.css
│   ├── App.js
│   ├── api.js
│   ├── index.css
│   └── index.js
├── package.json
└── README.md
```

## API Integration

The frontend communicates with the FastAPI backend via `src/api.js`. All endpoints require authentication tokens.

### Available Routes

- **Authentication**: `/auth/register`, `/auth/login`, `/auth/me`
- **Documents**: `/documents/upload`, `/documents/docs-list`, `/documents/search`
- **Chat**: `/chat/ask`

## Authentication Flow

1. User registers or logs in
2. Backend returns JWT token
3. Token stored in localStorage
4. All subsequent requests include token in Authorization header
5. Routes are protected with PrivateRoute component

## Testing

Test accounts to use after registration:

- **Admin**: Full access to all features
- **HR/Finance/Engineering/Marketing**: Department-specific access

## Build for Production

```bash
npm run build
```

Creates an optimized production build in the `build/` folder.
