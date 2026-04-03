# DocuGen - AI-Powered Document Management Platform

> Convert, OCR, template, and cloud-sync documents in one unified system.

## 🎯 What Problem Does It Solve?

Companies juggle 5+ tools (PDF converters + OCR software + template builders + Google Drive). DocuGen combines all in one platform.

## ✅ Key Problems Solved

| Problem | My Solution |
|---------|-------------|
| Scanned PDFs have uneditable text | AI OCR extracts editable text |
| Making same documents repeatedly | Drag-drop template builder (7 field types) |
| No cloud backup | Native Google Drive integration |
| Converting between formats | PDF ↔ Image, compression, text extraction |

## 🔧 Tech Stack

**Frontend:** React 18, Tailwind CSS, Axios, Lucide Icons  
**Backend:** Node.js, Express, JWT, Multer, MongoDB  
**APIs:** Google Drive, OpenAI GPT-4, Tesseract.js OCR

## 📊 Key Features

| Feature | What It Does |
|---------|---------------|
| PDF ↔ Image | Convert both ways, high quality |
| AI OCR | Extract text from scanned docs (90-95% accuracy) |
| GPT-4 Integration | Auto-detects invoice numbers, dates, amounts |
| Template Builder | Drag-drop, 7 field types, one-click generation |
| Google Drive | Upload, download, rename, delete, auto-sync |

## ⚠️ Hardest Technical Challenges

| Challenge | How I Solved It |
|-----------|------------------|
| Tesseract.js slow on large PDFs | Page-by-page processing with progress bar |
| Google OAuth token expiration | Auto-refresh with retry logic |
| MongoDB 16MB limit | Stored files as GridFS chunks |

## 📈 Results

- **5+ formats** supported
- **<3 seconds** average processing
- **40-60%** file compression
- **7 customizable** template fields

## 📸 Some Screenshots

| Dashboard | Invoice Template | Invoice Result | Text Extractor |
|-----------|-----------------|----------------|----------------|
| <img width="200" src="https://github.com/user-attachments/assets/185054f7-a138-4382-badb-7ce84f14ad50" /> | <img width="200" src="https://github.com/user-attachments/assets/e569cc79-e3f6-4ba1-a933-d822f5576fe8" /> | <img width="150" src="https://github.com/user-attachments/assets/b45ae116-74e3-4184-931f-b16703f22001" /> | <img width="200" src="https://github.com/user-attachments/assets/b7ecbaff-9f2b-443e-8199-ab2f1990bd06" /> |

## 🚀 Quick Start

```bash
git clone https://github.com/yourusername/docugen.git
cd backend && npm install && npm run dev
cd frontend && npm install && npm run dev
```  
**👨‍💻 Author:** Tushar Pandhare 
<a href="https://www.linkedin.com/in/tusharpandhare/">
    <img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white"/>
</a>
