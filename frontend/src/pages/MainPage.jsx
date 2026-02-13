// import {
//   FileText,
//   Image,
//   ArrowRight,
//   Sparkles,
//   LogOut,
//   ChevronDown,
// } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// import { useState, useRef, useEffect } from "react";

// export default function Dashboard() {
//   const navigate = useNavigate();
//   const dropdownRef = useRef(null);
//   const [open, setOpen] = useState(false);

//   const token = localStorage.getItem("token");
//   const user = JSON.parse(localStorage.getItem("user"));

//   // useEffect(() => {
//   //   if (!token) {
//   //     navigate("/login");
//   //   }
//   // }, [token, navigate]);

//   useEffect(() => {
//     function handleClickOutside(event) {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//         setOpen(false);
//       }
//     }

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const handleLogout = () => {
//     localStorage.removeItem("token");
//     localStorage.removeItem("user");
//     navigate("/login");
//   };

//   const firstLetter = user?.name ? user.name.charAt(0).toUpperCase() : "U";

//   return (
//     <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-gray-100">
//       {/* ================= NAVBAR ================= */}
//       <div className="sticky top-0 z-50 backdrop-blur-md bg-white/70 border-b">
//         <div className="max-w-7xl mx-auto px-8 py-4 flex justify-between items-center">
//           <h1 className="text-2xl font-bold bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
//             DocuGen
//           </h1>

//           <div className="relative" ref={dropdownRef}>
//             {token && user ? (
//               <>
//                 <div
//                   onClick={() => setOpen(!open)}
//                   className="flex items-center gap-3 cursor-pointer px-4 py-2 rounded-2xl hover:bg-white shadow-sm hover:shadow-md transition-all duration-300"
//                 >
//                   <div className="w-11 h-11 rounded-full bg-linear-to-r from-indigo-500 to-purple-600 text-white flex items-center justify-center font-semibold text-lg shadow-md">
//                     {firstLetter}
//                   </div>

//                   <div className="hidden md:block text-left">
//                     <p className="text-sm font-semibold text-gray-800">
//                       {user?.name}
//                     </p>
//                     <p className="text-xs text-gray-500">{user?.email}</p>
//                   </div>

//                   <ChevronDown size={16} />
//                 </div>

//                 {open && (
//                   <div className="absolute right-0 mt-4 w-64 bg-white rounded-2xl shadow-2xl p-5 border animate-fadeIn">
//                     <div className="mb-4">
//                       <p className="font-semibold text-gray-800">
//                         {user?.name}
//                       </p>
//                       <p className="text-sm text-gray-500">{user?.email}</p>
//                     </div>

//                     <button
//                       onClick={handleLogout}
//                       className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-xl font-medium transition"
//                     >
//                       <LogOut size={16} />
//                       Logout
//                     </button>
//                   </div>
//                 )}
//               </>
//             ) : (
//               <button
//                 onClick={() => navigate("/login")}
//                 className="bg-linear-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-xl font-semibold shadow-md hover:shadow-lg hover:scale-105 transition"
//               >
//                 Login
//               </button>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* ================= HERO ================= */}
//       <div className="max-w-7xl mx-auto px-8 pt-16 pb-10">
//         <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-indigo-600 via-purple-600 to-indigo-700 text-white p-14 shadow-2xl">
//           <div className="absolute -top-10 -right-10 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>

//           <h2 className="text-4xl md:text-5xl font-bold leading-tight">
//             Welcome back, {user?.name || "User"} 👋
//           </h2>

//           <p className="mt-5 text-indigo-100 max-w-xl text-lg">
//             Create invoices and convert images into professional PDFs with
//             speed, simplicity, and style.
//           </p>

//           <button
//             onClick={() => navigate("/invoice-generate")}
//             className="mt-8 flex items-center gap-2 bg-white text-indigo-700 px-6 py-3 rounded-xl font-semibold shadow-lg hover:scale-105 transition"
//           >
//             Get Started
//             <ArrowRight size={18} />
//           </button>
//         </div>
//       </div>

//       {/* ================= QUICK ACTIONS ================= */}
//       <div className="max-w-7xl mx-auto px-8 pb-16">
//         <h3 className="text-2xl font-bold text-gray-800 mb-8">Quick Actions</h3>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
//           {/* Invoice Card */}
//           <div
//             onClick={() => navigate("/invoice-generate")}
//             className="group cursor-pointer bg-white p-10 rounded-3xl shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
//           >
//             <div className="w-14 h-14 flex items-center justify-center bg-indigo-600 text-white rounded-2xl mb-6 group-hover:scale-110 transition">
//               <FileText size={26} />
//             </div>

//             <h4 className="text-xl font-semibold mb-3">Invoice Generator</h4>

//             <p className="text-gray-500">
//               Generate beautiful invoices with automatic calculations and export
//               to PDF.
//             </p>
//           </div>

//           {/* PDF Card */}
//           <div
//             onClick={() => navigate("/pdf-generate")}
//             className="group cursor-pointer bg-white p-10 rounded-3xl shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
//           >
//             <div className="w-14 h-14 flex items-center justify-center bg-purple-600 text-white rounded-2xl mb-6 group-hover:scale-110 transition">
//               <Image size={26} />
//             </div>

//             <h4 className="text-xl font-semibold mb-3">Image to PDF</h4>

//             <p className="text-gray-500">
//               Convert images into clean, high-quality printable PDFs instantly.
//             </p>
//           </div>
//         </div>

//         {/* Stats Section */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
//           {[
//             { label: "Documents Created", value: "128+" },
//             { label: "PDF Exports", value: "92+" },
//             { label: "Active Tools", value: "2" },
//           ].map((stat, i) => (
//             <div
//               key={i}
//               className="bg-white p-8 rounded-3xl shadow-md hover:shadow-xl transition"
//             >
//               <p className="text-sm text-gray-500">{stat.label}</p>
//               <h4 className="text-4xl font-bold mt-3 text-gray-800">
//                 {stat.value}
//               </h4>
//             </div>
//           ))}
//         </div>

//         {/* Footer */}
//         <div className="mt-16 flex justify-between items-center text-gray-500 text-sm">
//           <div className="flex items-center gap-2">
//             <Sparkles size={16} />
//             <span>More powerful tools coming soon</span>
//           </div>
//           <span>v1.0.0</span>
//         </div>
//       </div>
//     </div>
//   );
// }

import {
  FileText,
  Image,
  LogOut,
  LayoutDashboard,
  User,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Dashboard() {
  const navigate = useNavigate();
  const [active, setActive] = useState("dashboard");

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const firstLetter = user?.name
    ? user.name.charAt(0).toUpperCase()
    : "U";

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* ================= SIDEBAR ================= */}
      <div className="w-64 bg-white shadow-xl flex flex-col justify-between p-6">
        <div>
          <h1 className="text-2xl font-bold text-indigo-600 mb-10">
            DocuGen
          </h1>

          <div className="space-y-4">
            <button
              onClick={() => setActive("dashboard")}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition ${
                active === "dashboard"
                  ? "bg-indigo-100 text-indigo-600 font-semibold"
                  : "hover:bg-gray-100 text-gray-600"
              }`}
            >
              <LayoutDashboard size={20} />
              Dashboard
            </button>

            <button
              onClick={() => navigate("/invoice-generate")}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-gray-100 text-gray-600 transition"
            >
              <FileText size={20} />
              Invoice Generator
            </button>

            <button
              onClick={() => navigate("/pdf-generate")}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-gray-100 text-gray-600 transition"
            >
              <Image size={20} />
              Image to PDF
            </button>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-red-500 hover:bg-red-50 px-4 py-2 rounded-xl transition"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>

      {/* ================= MAIN CONTENT ================= */}
      <div className="flex-1 p-10">
        {/* TOP BAR */}
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-bold text-gray-800">
            Dashboard Overview
          </h2>

          <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-xl shadow">
            <div className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-semibold">
              {firstLetter}
            </div>
            <div>
              <p className="text-sm font-semibold">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* WELCOME CARD */}
        <div className="bg-linear-to-r from-indigo-600 to-purple-600 text-white p-10 rounded-3xl shadow-xl mb-12">
          <h3 className="text-4xl font-bold mb-4">
            Welcome back, {user?.name} 👋
          </h3>
          <p className="text-indigo-100 max-w-xl">
            Manage your invoices and convert images into PDFs effortlessly with
            DocuGen.
          </p>

          <button
            onClick={() => navigate("/invoice-generate")}
            className="mt-6 bg-white text-indigo-600 px-6 py-3 rounded-xl font-semibold shadow hover:scale-105 transition"
          >
            Create Invoice
          </button>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {[
            { label: "Documents Created", value: "128+" },
            { label: "PDF Exports", value: "92+" },
            { label: "Active Tools", value: "2" },
          ].map((stat, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-2xl shadow hover:shadow-xl transition"
            >
              <p className="text-gray-500 text-sm">{stat.label}</p>
              <h4 className="text-4xl font-bold mt-3 text-gray-800">
                {stat.value}
              </h4>
            </div>
          ))}
        </div>

        {/* QUICK ACTION CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div
            onClick={() => navigate("/invoice-generate")}
            className="cursor-pointer bg-white p-10 rounded-3xl shadow-md hover:shadow-2xl hover:-translate-y-2 transition"
          >
            <FileText
              size={36}
              className="text-indigo-600 mb-6"
            />
            <h4 className="text-xl font-semibold mb-3">
              Invoice Generator
            </h4>
            <p className="text-gray-500">
              Generate professional invoices with automatic totals.
            </p>
          </div>

          <div
            onClick={() => navigate("/pdf-generate")}
            className="cursor-pointer bg-white p-10 rounded-3xl shadow-md hover:shadow-2xl hover:-translate-y-2 transition"
          >
            <Image size={36} className="text-purple-600 mb-6" />
            <h4 className="text-xl font-semibold mb-3">
              Image to PDF
            </h4>
            <p className="text-gray-500">
              Convert multiple images into clean printable PDFs.
            </p>
          </div>
        </div>

        {/* FOOTER */}
        <div className="mt-16 text-gray-400 text-sm flex items-center gap-2">
          <Sparkles size={16} />
          More powerful tools coming soon • v2.0
        </div>
      </div>
    </div>
  );
}
