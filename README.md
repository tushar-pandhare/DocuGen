# DocuGen

DocuGen is an AI-powered document and PDF generation suite built with the MERN stack. It allows users to generate invoices, convert images to PDFs, extract text via OCR, manage document templates, and interact with multiple AI providers — all from a single platform.

The project is designed to demonstrate concepts related to:

- Full-Stack Web Development (MERN)
- REST API Design & JWT Authentication
- Asynchronous Job Processing (Bull + Redis)
- AI API Integration (Multi-Provider)
- Google OAuth2 & Drive API
- Document Generation & File Processing
- Security Best Practices

## Features

- Smart invoice generator with GST calculation and PDF export
- Image to PDF conversion (batch support)
- PDF to image extraction
- OCR text extraction from images and scanned PDFs
- File compression for images and PDFs
- Document template builder with custom fields and HTML layouts
- Template library with sharing support
- Google Drive integration — browse, rename, delete files
- Multi-provider AI assistant (Claude, GPT, Gemini, Llama 3)
- AI-powered template generation, document summarization, and OCR correction
- Async job queue with real-time progress tracking
- Secure file upload with MIME-type validation and size limits

## Tech Stack

**Backend**
- Node.js, Express.js
- MongoDB, Mongoose
- Bull + Redis (job queue)
- PDFKit, Puppeteer (PDF generation)
- Tesseract.js, pdf-poppler (OCR)
- Multer (file uploads)
- JWT, bcryptjs (authentication)
- Helmet, express-rate-limit (security)
- googleapis (Google Drive & OAuth2)

**Frontend**
- React 19, Vite
- Tailwind CSS
- React Router v7
- Axios

## Project Structure

```text
docugen/
│
├── backend/
│   ├── controller/
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── rateLimiter.js
│   │   ├── validateInput.js
│   │   └── fileFilter.js
│   ├── models/
│   ├── queues/
│   ├── workers/
│   │   ├── invoiceWorker.js
│   │   ├── imagePdfWorker.js
│   │   └── ocrWorker.js
│   ├── routes/
│   ├── utils/
│   └── server.js
│
└── frontend/
    └── src/
        ├── components/
        ├── pages/
        ├── services/
        └── App.jsx
```

## Getting Started

Clone the repository:

```bash
git clone https://github.com/your-username/docugen.git
cd docugen
```

Install dependencies:

```bash
cd backend && npm install
cd ../frontend && npm install
```

Set up environment variables:

```bash
cd backend
cp .env.example .env
# Fill in your values (MongoDB URI, JWT secret, Google OAuth credentials, Redis URL)
```

```bash
cd frontend
cp .env.example .env
# Set VITE_API_URL=http://localhost:5000
```

Start Redis (required for job queue):

```bash
docker run -d -p 6379:6379 redis:alpine
```

Run the application:

```bash
# Terminal 1 — API server
cd backend && npm run dev

# Terminal 2 — Background workers
cd backend && npm run workers

# Terminal 3 — Frontend
cd frontend && npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Environment Variables

| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Random string, minimum 64 characters |
| `GOOGLE_CLIENT_ID` | From Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | From Google Cloud Console |
| `GOOGLE_REDIRECT_URI` | OAuth callback URL |
| `FRONTEND_URL` | Frontend URL (used for CORS) |
| `REDIS_URL` | Redis connection string |
| `ANTHROPIC_API_KEY` | Optional — server-side fallback AI key |

## How It Works

1. User submits a request (invoice, PDF conversion, OCR)
2. API validates the request and enqueues a background job via Bull
3. A worker picks up the job, processes it, and updates progress in Redis
4. Frontend polls the job status endpoint every 1.5 seconds and displays a progress bar
5. When complete, the file is streamed to the browser for download

For AI features, users provide their own API key (Claude, GPT, Gemini, or Groq). The key is sent via request header and is never stored on the server.

## 📸 Some Screenshots

| Dashboard | Invoice Template | Invoice Result | Text Extractor |
|-----------|-----------------|----------------|----------------|
| <img width="200" src="https://github.com/user-attachments/assets/185054f7-a138-4382-badb-7ce84f14ad50" /> | <img width="200" src="https://github.com/user-attachments/assets/e569cc79-e3f6-4ba1-a933-d822f5576fe8" /> | <img width="150" src="https://github.com/user-attachments/assets/b45ae116-74e3-4184-931f-b16703f22001" /> | <img width="200" src="https://github.com/user-attachments/assets/b7ecbaff-9f2b-443e-8199-ab2f1990bd06" /> |

