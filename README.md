# DocuGen

DocuGen is a full-stack document processing and automation platform built with Node.js, Express, MongoDB, and React. It combines document generation, file conversion, OCR, AI-powered document Q&A, template management, and Google Drive integration into one workspace for users who work with PDFs, invoices, templates, and uploaded files.

## Overview

The product is designed as a document workflow hub where users can:

- create and manage professional invoices
- convert images to PDF and PDF to images
- extract text from scanned or uploaded files
- compress files to reduce size
- build reusable document templates with generated PDF output
- store and manage generated documents
- connect Google Drive for file access and uploads
- ask questions about uploaded documents using Gemini embeddings and MongoDB-backed retrieval

## Core Features

### 1. Authentication and user access
- User signup and login with JWT authentication
- Protected frontend routes using auth verification
- User profile lookup through `/api/auth/me`
- Basic rate limiting on auth and API requests

### 2. Invoice generation and PDF export
- Create invoices with client details, item lines, subtotal, GST, and total
- PDF preview before download
- Download generated invoices as PDF files
- Save invoice records to MongoDB
- Optional upload of invoice PDFs to Google Drive
- Invoice history and delete support

### 3. Image to PDF conversion
- Upload one or more images
- Convert them into a single PDF document
- Support for everyday document workflows and scanned file processing

### 4. PDF to image conversion
- Upload a PDF and export pages as images
- Useful for previewing, splitting, or extracting page visuals

### 5. OCR and text extraction
- Extract text from uploaded documents using Tesseract.js
- Supports file-based OCR workflows for PDFs and images
- Intended for scanning and converting document content into readable text

### 6. File compression
- Compress uploaded files to reduce storage / transfer size
- Optional async processing using a queue-based worker setup
- Handles heavy compression workflows separately from the API server

### 7. Template library and document generation
- Create templates with custom metadata, fields, styles, and structure
- List, filter, search, sort, and browse public / personal templates
- View a single template and track usage counts
- Generate PDF documents from a template using dynamic payload data
- Save generated documents in the database
- Share templates with other users and manage permissions
- Like templates and view overview stats

### 8. Google Drive integration
- Connect a Google account to the application
- List files inside the DocuGen folder in Drive
- Upload files directly to Drive
- Rename files in Drive
- Delete files from Drive
- View file metadata and links

### 9. AI document assistant
- Upload PDF, TXT, or DOCX files
- Extract and chunk document text
- Generate embeddings using Google Gemini embeddings
- Store document chunks and embeddings in MongoDB per user
- Ask natural-language questions about the uploaded document
- Retrieve the most relevant chunks with cosine similarity and answer through Gemini
- Track uploaded document metadata and collection state

### 10. Background job processing
- Heavy operations are supported through BullMQ queues
- Includes job-based processing for OCR, compression, PDF conversion, and invoice generation
- Worker service runs separately to keep the API responsive

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT authentication with bcryptjs
- Multer for uploads
- PDF generation and manipulation using PDFKit, pdf-lib, Puppeteer, pdf-poppler, and pdf2pic
- OCR with Tesseract.js
- Image processing with Sharp
- Google APIs for OAuth and Drive integration
- Cloudinary integration
- MongoDB for document chunks and embedding storage
- BullMQ + Redis for async background job processing
- Rate limiting and request validation with express-rate-limit and express-validator

### Frontend
- React 19
- Vite
- React Router
- Axios
- Tailwind CSS
- Lucide icons

## Architecture

The project is split into three main parts:

1. API server: handles auth, upload routes, document processing, templates, AI indexing, and Google Drive APIs
2. Worker service: processes long-running jobs asynchronously to avoid blocking the main server
3. React UI: serves the dashboard and all user-facing document tools

## Project Structure

```text
ABC/
├── backend/
│   ├── controller/
│   │   └── ocrController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── rateLimiter.js
│   │   └── validateInput.js
│   ├── models/
│   │   ├── Document.js
│   │   ├── GeneratedDocument.js
│   │   ├── InvoiceSchema.js
│   │   ├── Template.js
│   │   └── user.js
│   ├── queues/
│   │   └── jobQueue.js
│   ├── routes/
│   │   ├── aiAssistantRoute.js
│   │   ├── auth.js
│   │   ├── compressRoutes.js
│   │   ├── driveRoutes.js
│   │   ├── googleAuth.js
│   │   ├── invoiceRoute.js
│   │   ├── jobRoutes.js
│   │   ├── ocrRoute.js
│   │   ├── pdfRoutes.js
│   │   ├── pdfToImageRouteMain.js
│   │   └── templateRoutes.js
│   ├── templates/
│   │   ├── templateServices.js
│   │   └── invoiceTemplate.js
│   ├── utils/
│   │   ├── bullmqRedis.js
│   │   ├── cloudinary.js
│   │   ├── generatePDF.js
│   │   ├── googleDrive.js
│   │   ├── multer.js
│   │   ├── redis.js
│   │   └── routeLoader.js
│   ├── vector_store/
│   ├── uploads/
│   ├── package.json
│   ├── server.js
│   └── .env
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/
│   │   ├── Context/
│   │   ├── pages/
│   │   ├── services/
│   │   └── templates/
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── index.html
├── worker/
│   ├── processors/
│   │   ├── compressProcessor.js
│   │   ├── invoiceProcessor.js
│   │   ├── ocrProcessor.js
│   │   └── pdfToImageProcessor.js
│   ├── worker.js
│   └── package.json
├── README.md
├── DEPLOYMENT.md
└── package.json
```

## Environment Variables

### Backend `.env`

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@<cluster-url>/<database>
JWT_SECRET=your_super_secret_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback
FRONTEND_URL=http://localhost:5173
GEMINI_API_KEY=your_gemini_api_key
REDIS_URL=redis://localhost:6379
UPSTASH_REDIS_URL=rediss://:<token>@<host>:<port>
```

### Frontend `.env`

```env
VITE_API_URL=http://localhost:5000/api
```

## Getting Started

### 1. Install dependencies

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 2. Start the backend server

```bash
cd backend
npm run dev
```

### 3. Start the background worker

```bash
cd worker
node worker.js
```

### 4. Start the frontend

```bash
cd frontend
npm run dev
```

The frontend typically runs on `http://localhost:5173` and the backend on `http://localhost:5000`.

## Main API Routes

### Authentication
- `POST /api/auth/signup` - register a user
- `POST /api/auth/login` - login and receive JWT
- `GET /api/auth/me` - fetch authenticated user profile
- `GET /api/auth/google` - start Google OAuth flow
- `GET /api/auth/google/callback` - handle OAuth callback

### Invoice
- `POST /api/invoice/download` - create and save an invoice, then download its PDF
- `POST /api/invoice/preview` - generate a PDF preview without saving it
- `GET /api/invoice` - list the authenticated user's invoices
- `GET /api/invoice/:id/pdf` - download a saved invoice PDF
- `PATCH /api/invoice/:id/status` - mark a saved invoice as paid or pending

### Documents and conversion
- `POST /api/pdf/img` - convert uploaded images to PDF
- `POST /api/pdf-to-image` - convert PDF to images
- `POST /api/ocr/extract-text` - extract text from uploaded files
- `POST /api/compress` - compress uploaded files

### Templates and documents
- `GET /api/templates` - fetch available templates
- `GET /api/templates/:id` - fetch a specific template
- `POST /api/templates` - create a template
- `PUT /api/templates/:id` - update a template
- `DELETE /api/templates/:id` - delete a template
- `POST /api/templates/:id/generate` - generate a PDF from template data
- `POST /api/templates/:id/share` - share a template
- `DELETE /api/templates/:id/share/:userId` - unshare template
- `GET /api/documents` - fetch generated documents

### Google Drive
- `GET /api/drive/files` - get Drive files in the DocuGen folder
- `POST /api/drive/upload` - upload file to Drive
- `PUT /api/drive/rename-file/:fileId` - rename a Drive file
- `DELETE /api/drive/delete-file/:fileId` - delete a Drive file
- `GET /api/drive/file-info/:fileId` - fetch file metadata

### AI assistant
- `POST /api/ai/upload` - upload and index a document for AI Q&A
- `POST /api/ai/ask` - ask a question about the indexed document
- `GET /api/ai/status` - check AI session status
- `DELETE /api/ai/clear` - clear indexed document data

### Job tracking
- `GET /api/jobs/:id/status` - check asynchronous job status

### Health check
- `GET /health` - app health check

## Frontend Pages and User Flows

The client app includes:

- `Login` and `Signup` screens
- Dashboard / landing page with available tools
- `InvoiceGenerator` for invoice creation and export
- `ImageGenerator` for image-to-PDF conversion
- `PdfToImg` for PDF-to-image extraction
- `TextExtractor` for OCR-based text extraction
- `FileCompressor` for compressing uploaded files
- `TemplateLibrary` for browsing templates
- `TemplateBuilder` for creating or editing template definitions
- `TemplateUsage` for using a saved template to generate a PDF
- `MyDocuments` for viewing generated documents
- `DriveFiles` for Google Drive file access and management
- `AiAssistant` for document-based Q&A using Gemini and MongoDB-backed embeddings
- `TestPDF` utility page for quick PDF validation

## Deployment Notes

- The frontend can be deployed on Vercel
- The backend and worker should run on a Node-compatible host such as Render, Railway, DigitalOcean, or a VPS
- The app depends on MongoDB, Redis/BullMQ, Google OAuth credentials, and a Gemini API key
- The AI assistant stores document chunks and embeddings in the configured MongoDB database; no separate vector database service is required

## Security and project notes

- Protected routes on the frontend require a valid JWT
- Authenticated endpoints use middleware-based checks
- API rate limiting is enabled to reduce brute-force abuse
- Google Drive access is handled via OAuth tokens stored for the user
- Large operations are separated into background worker queues for better scalability and reliability

## Recommended next steps

- Add environment example files for backend and frontend
- Add a production-ready Docker setup
- Add automated tests for routes, document conversion, and AI indexing
- Improve error handling and validation for file uploads and processing jobs

## License

This project is currently configured for local project use and is not published under a formal public license in the repository metadata.
