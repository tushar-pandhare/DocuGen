import { Route, Routes, BrowserRouter } from "react-router-dom";
import "./index.css";
import MainPage from "./pages/MainPage";
import ImageGenerator from "./pages/ImageGenerator";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import DriveFiles from "./pages/DriveFiles";
import TextExtractor from "./pages/TextExtractor";
import FileCompressor from "./pages/FileCompressor";
import PdfToImage from "./pages/PdfToImg";
import InvoiceGenerator from "./pages/InvoiceGenerator";
import TemplateBuilder from "./pages/TemplateBuilder";
import TemplateLibrary from "./pages/TemplateLibrary";
import MyDocuments from "./pages/MyDocuments";
import TemplateUsage from "./pages/TemplateUsage";
import TestPDF from "./pages/TestPdf";
import AiAssistant from "./pages/AiAssistant";
import ProtectedRoute from "./pages/ProtectedRoute";

const App = () => {
  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* Wildcard needed because MainPage renders its own <Routes> */}
          <Route path="/*" element={<ProtectedRoute><MainPage /></ProtectedRoute>} />
          <Route path="/invoice-generate" element={<ProtectedRoute><InvoiceGenerator /></ProtectedRoute>} />
          <Route path="/pdf-generate" element={<ProtectedRoute><ImageGenerator /></ProtectedRoute>} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/drive-files" element={<ProtectedRoute><DriveFiles /></ProtectedRoute>} />
          <Route path="/text-extractor" element={<ProtectedRoute><TextExtractor /></ProtectedRoute>} />
          <Route path="/compress" element={<ProtectedRoute><FileCompressor /></ProtectedRoute>} />
          <Route path="/pdf-to-image" element={<ProtectedRoute><PdfToImage /></ProtectedRoute>} />
          <Route path="/templates" element={<ProtectedRoute><TemplateLibrary /></ProtectedRoute>} />
          <Route path="/templates/create" element={<ProtectedRoute><TemplateBuilder /></ProtectedRoute>} />
          <Route path="/templates/edit/:id" element={<ProtectedRoute><TemplateBuilder /></ProtectedRoute>} />
          <Route path="/templates/use/:id" element={<ProtectedRoute><TemplateUsage /></ProtectedRoute>} />
          <Route path="/my-documents" element={<ProtectedRoute><MyDocuments /></ProtectedRoute>} />
          <Route path="/test-pdf" element={<ProtectedRoute><TestPDF /></ProtectedRoute>} />
          <Route path="/ai-assistant" element={<ProtectedRoute><AiAssistant /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;
