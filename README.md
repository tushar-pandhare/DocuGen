# DocuGen

DocuGen is a MERN-stack document and PDF utility suite. It lets users generate invoices, convert between images and PDFs, extract text via OCR, compress files, build reusable document templates, manage Google Drive files, and chat with uploaded documents through a Gemini-powered RAG assistant.

## Features

- JWT-based signup / login
- Smart invoice generator with GST calculation, PDF preview, and download
- Image → PDF conversion (batch)
- PDF → image (JPEG) conversion
- OCR text extraction (Tesseract.js)
- Image and PDF compression
- Custom document template builder (fields, layout, styling) with a template library and sharing
- Google Drive integration — list, upload, rename, delete files
- AI document assistant — upload a PDF/DOCX/TXT, it's chunked and embedded, then answered against via Gemini (retrieval-augmented generation)

## Tech Stack

**Backend**
- Node.js, Express 4
- MongoDB, Mongoose
- JWT (`jsonwebtoken`) + `bcryptjs` for auth
- Multer for uploads
- PDFKit, `pdf-lib`, Puppeteer, `pdf-poppler`, `pdf2pic` for PDF generation/conversion
- Tesseract.js for OCR
- Sharp for image processing
- `googleapis` for Google OAuth2 + Drive
- Cloudinary (media storage)
- `vectra` for the local vector store (RAG embeddings)
- Helmet, `express-rate-limit`, `express-validator` (installed; not yet wired into any routes — see Known Issues)

**Frontend**
- React 19, Vite 7
- React Router v7
- Axios
- lucide-react (icons)
- Tailwind CSS (installed; most of the UI currently uses inline styles rather than Tailwind classes)

## Project Structure

```text
docugen/
├── backend/
│   ├── controller/
│   │   └── ocrController.js
│   ├── middleware/
│   │   └── authMiddleware.js        # JWT verification
│   ├── models/
│   │   ├── user.js
│   │   ├── Template.js
│   │   ├── GeneratedDocument.js
│   │   ├── InvoiceSchema.js
│   │   └── Document.js
│   ├── routes/
│   │   ├── auth.js                  # signup / login / me
│   │   ├── googleAuth.js            # Google OAuth connect + callback
│   │   ├── invoiceRoute.js
│   │   ├── pdfRoutes.js             # images -> PDF
│   │   ├── pdfToImageRouteMain.js   # PDF -> images
│   │   ├── ocrRoute.js
│   │   ├── compressRoutes.js
│   │   ├── driveRoutes.js
│   │   ├── templateRoutes.js
│   │   └── aiAssistantRoute.js      # RAG assistant (Gemini)
│   ├── templates/                   # server-side HTML/PDF templates
│   ├── utils/                       # cloudinary, PDF gen, Google Drive client, multer, route loader
│   ├── vector_store/                # local embeddings cache (gitignored)
│   └── server.js
│
└── frontend/
    └── src/
        ├── Context/ToastContext.jsx
        ├── pages/                   # one file per route/feature
        ├── services/api.js          # axios instance, injects JWT from localStorage
        ├── templates/                # client-side invoice template
        └── App.jsx                  # top-level router
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

Set up backend environment variables:

```bash
cd backend
cp .env.example .env
```

Fill in `.env`:

```
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/DocuGen?retryWrites=true&w=majority
JWT_SECRET=<generate with: openssl rand -hex 32>
JWT_EXPIRE=1d
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback
FRONTEND_URL=http://localhost:5173
GEMINI_API_KEY=your_gemini_api_key
MAX_FILE_SIZE=10485760
UPLOAD_DIR=uploads/
```

Set up frontend environment variables (`frontend/.env`):

```
VITE_API_URL=http://localhost:5000/api
```

Run both apps in development:

```bash
# backend
cd backend && npm run dev

# frontend (separate terminal)
cd frontend && npm run dev
```

Backend runs on `http://localhost:5000`, frontend on `http://localhost:5173`.

## API Overview

| Prefix | Routes file | Notes |
|---|---|---|
| `/api/auth` | `auth.js`, `googleAuth.js` | signup, login, me, Google OAuth |
| `/api/invoice` | `invoiceRoute.js` | generate, preview, download, history |
| `/api/pdf` | `pdfRoutes.js` | images → PDF |
| `/api/pdf-to-image` | `pdfToImageRouteMain.js` | PDF → images |
| `/api/ocr` | `ocrRoute.js` | text extraction |
| `/api/compress` | `compressRoutes.js` | image/PDF compression |
| `/api/drive` | `driveRoutes.js` | Drive file management |
| `/api` | `templateRoutes.js` | template CRUD, sharing, generation |
| `/api/ai` | `aiAssistantRoute.js` | RAG upload/ask/status/clear |
| `/health` | `server.js` | health check |

All routes except `/api/auth/signup`, `/api/auth/login`, and `/health` require a `Bearer <token>` header.

## Deployment

- **Frontend** → Vercel (static Vite build)
- **Backend** → Railway / Render (Puppeteer and local file writes mean it cannot run on Vercel's serverless functions)

Set `VITE_API_URL` on the frontend host and `FRONTEND_URL` + the Google OAuth redirect URI on the backend host to match your deployed domains.
