import {Route,Routes,BrowserRouter} from "react-router-dom"
import "./index.css"
import MainPage from "./pages/MainPage"
// import InvoiceGenerator from "./pages/invoiceGenerator"
import ImageGenerator from "./pages/ImageGenerator"
import SignupPage from "./pages/SignupPage"
import LoginPage from "./pages/LoginPage"
import DriveFiles from "./pages/DriveFiles"
import TextExtractor from "./pages/TextExtractor"
import FileCompressor from "./pages/FileCompressor"
import PdfToImage from "./pages/PdfToImg"
import InvoiceGenerator from "./pages/InvoiceGenerator"

const App = () => {
  return (
    <>
    <BrowserRouter>
    <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/invoice-generate" element={<InvoiceGenerator />} />
        <Route path='/pdf-generate' element={<ImageGenerator />} />
        <Route path='/signup' element={<SignupPage />} />
        <Route path='/login' element={<LoginPage />} />
        <Route path="/drive-files" element={<DriveFiles />} />
        <Route path="/text-extractor" element={<TextExtractor />} />
        <Route path="/compress" element={<FileCompressor />} />
        <Route path="/pdf-to-image" element={<PdfToImage />} />
    </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
