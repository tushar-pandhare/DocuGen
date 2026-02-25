import {Route,Routes,BrowserRouter} from "react-router-dom"
import "./index.css"
import MainPage from "./pages/MainPage"
import InvoiceGenerator from "./pages/invoiceGenerator"
import ImageGenerator from "./pages/ImageGenerator"
import SignupPage from "./pages/SignupPage"
import LoginPage from "./pages/LoginPage"
import DriveFiles from "./pages/DriveFiles"

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
    </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
