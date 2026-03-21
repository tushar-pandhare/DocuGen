// import axios from "axios";
// import { useEffect, useState } from "react";
// import {
//   FileText,
//   Image,
//   LogOut,
//   LayoutDashboard,
//   Sparkles,
//   Folder,
// } from "lucide-react";
// import { useNavigate } from "react-router-dom";

// export default function Dashboard() {
//   const navigate = useNavigate();
//   const token = localStorage.getItem("token");

//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   /* ================= FETCH USER ================= */
//   useEffect(() => {
//     if (!token) {
//       navigate("/login");
//       return;
//     }

//     const fetchUser = async () => {
//       try {
//         const res = await axios.get(
//           "http://localhost:5000/api/auth/me",
//           {
//             headers: { Authorization: `Bearer ${token}` },
//           }
//         );
//         setUser(res.data);
//       } catch (err) {
//         localStorage.removeItem("token");
//         navigate("/login");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchUser();
//   }, [token, navigate]);

//   const handleLogout = () => {
//     localStorage.removeItem("token");
//     navigate("/login");
//   };


// const handleGoogleConnect = async () => {
//   try {
//     const res = await axios.get(
//       "http://localhost:5000/api/auth/google",
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     );

//     // Now redirect to Google OAuth URL
//     window.location.href = res.data.url;

//   } catch (err) {
//     console.error(err.response?.data);
//     alert("Google connection failed");
//   }
// };


//   if (loading) return <div className="p-10">Loading...</div>;

//   const firstLetter = user?.name?.charAt(0).toUpperCase() || "U";
//   const isGoogleConnected =
//     user?.googleTokens && Object.keys(user.googleTokens).length > 0;

//   return (
//     <div className="min-h-screen bg-gray-100 flex">
//       {/* SIDEBAR */}
//       <div className="w-64 bg-white shadow-xl flex flex-col justify-between p-6">
//         <div>
//           <h1 className="text-2xl font-bold text-indigo-600 mb-10">
//             DocuGen
//           </h1>

//           <div className="space-y-4">
//             <button className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-indigo-100 text-indigo-600 font-semibold">
//               <LayoutDashboard size={20} />
//               Dashboard
//             </button>

//             <button
//               onClick={() => navigate("/invoice-generate")}
//               className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-gray-100 text-gray-600"
//             >
//               <FileText size={20} />
//               Invoice Generator
//             </button>

//             <button
//               onClick={() => navigate("/pdf-generate")}
//               className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-gray-100 text-gray-600"
//             >
//               <Image size={20} />
//               Image to PDF
//             </button>
//           </div>

//           {/* GOOGLE DRIVE */}
//           <div className="mt-8 space-y-3">
//             <button
//               onClick={handleGoogleConnect}
//               disabled={isGoogleConnected}
//               className={`w-full px-4 py-2 rounded-xl transition ${
//                 isGoogleConnected
//                   ? "bg-green-100 text-green-600 cursor-not-allowed"
//                   : "bg-indigo-600 text-white hover:bg-indigo-700"
//               }`}
//             >
//               {isGoogleConnected
//                 ? "Google Drive Connected ✅"
//                 : "Connect Google Drive"}
//             </button>

//             {isGoogleConnected && (
//               <button
//                 onClick={() => navigate("/drive-files")}
//                 className="flex items-center justify-center gap-2 w-full bg-white border px-4 py-2 rounded-xl hover:bg-gray-50"
//               >
//                 <Folder size={18} />
//                 View Drive Files
//               </button>
//             )}
//           </div>
//         </div>

//         <button
//           onClick={handleLogout}
//           className="flex items-center gap-2 text-red-500 hover:bg-red-50 px-4 py-2 rounded-xl"
//         >
//           <LogOut size={18} />
//           Logout
//         </button>
//       </div>

//       {/* MAIN */}
//       <div className="flex-1 p-10">
//         <div className="flex justify-between items-center mb-10">
//           <h2 className="text-3xl font-bold text-gray-800">
//             Dashboard Overview
//           </h2>

//           <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-xl shadow">
//             <div className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-semibold">
//               {firstLetter}
//             </div>
//             <div>
//               <p className="text-sm font-semibold">{user?.name}</p>
//               <p className="text-xs text-gray-500">{user?.email}</p>
//             </div>
//           </div>
//         </div>

//         <div className="bg-linear-to-r from-indigo-600 to-purple-600 text-white p-10 rounded-3xl shadow-xl">
//           <h3 className="text-4xl font-bold mb-4">
//             Welcome back, {user?.name} 👋
//           </h3>
//           <p>Manage your documents with Google Drive sync.</p>
//         </div>

//         <div className="mt-16 text-gray-400 text-sm flex items-center gap-2">
//           <Sparkles size={16} />
//           Clean Auth Architecture • Production Ready
//         </div>
//       </div>
//     </div>
//   );
// }
import axios from "axios";
import { useEffect, useState } from "react";
import {
  FileText,
  Image as ImageIcon,
  LogOut,
  LayoutDashboard,
  Sparkles,
  Folder,
  ExternalLink,
  Edit3,
  Search,
  Plus,
  Zap, // Added for Compression
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [user, setUser] = useState(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const userRes = await axios.get("http://localhost:5000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(userRes.data);

        if (userRes.data.googleTokens) {
          const fileRes = await axios.get("http://localhost:5000/api/drive/files", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setFiles(fileRes.data.files || []);
        }
      } catch (err) {
        console.error(err);
        localStorage.removeItem("token");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleGoogleConnect = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/auth/google", {
        headers: { Authorization: `Bearer ${token}` },
      });
      window.location.href = res.data.url;
    } catch (err) {
      alert("Google connection failed");
    }
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
    </div>
  );

  const isGoogleConnected = user?.googleTokens && Object.keys(user.googleTokens).length > 0;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-slate-900">
      
      {/* --- SIDEBAR --- */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col p-8 sticky h-screen top-0">
        <div className="flex items-center gap-2 mb-12">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Sparkles className="text-white" size={20} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight bg-linear-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            DocuGen
          </h1>
        </div>

        <nav className="flex-1 space-y-2">
          <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-4 px-4">Menu</p>
          <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" active />
          <NavItem icon={<FileText size={20} />} label="Invoice" onClick={() => navigate("/invoice-generate")} />
          <NavItem icon={<ImageIcon size={20} />} label="Image to PDF" onClick={() => navigate("/pdf-generate")} />
          <NavItem icon={<Zap size={20} />} label="PDF to Image" onClick={() => navigate("/pdf-to-image")} />
          <NavItem icon={<Search size={20} />} label="Text Extractor" onClick={() => navigate("/text-extractor")} />
          <NavItem icon={<Zap size={20} />} label="Compress" onClick={() => navigate("/compress")} />
        </nav>

        <div className="pt-6 mt-6 border-t border-slate-100">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 p-10 max-w-7xl mx-auto">
        
        {/* TOP BAR */}
        <header className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-800">Hello, {user?.name?.split(' ')[0]}!</h2>
            <p className="text-slate-500">Here's what's happening with your documents today.</p>
          </div>

          <div className="flex items-center gap-4 bg-white p-1.5 pr-4 rounded-2xl shadow-sm border border-slate-100">
            <div className="w-10 h-10 bg-linear-to-tr from-indigo-600 to-violet-500 text-white rounded-xl flex items-center justify-center font-bold shadow-md">
              {user?.name?.charAt(0)}
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-bold text-slate-700 leading-tight">{user?.name}</p>
              <p className="text-xs text-slate-400">{user?.email}</p>
            </div>
          </div>
        </header>

        {/* CONNECTION CARD */}
        {!isGoogleConnected && (
          <div className="bg-indigo-600 rounded-3xl p-8 mb-10 text-white flex justify-between items-center shadow-2xl shadow-indigo-200 relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-2">Connect Google Drive</h3>
              <p className="text-indigo-100 mb-6 max-w-md">Access your cloud files directly and save your generated documents automatically.</p>
              <button 
                onClick={handleGoogleConnect}
                className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-colors flex items-center gap-2"
              >
                <Plus size={20} /> Link Account
              </button>
            </div>
            <Folder className="absolute right-20 bottom-20 text-indigo-500 opacity-20" size={200} />
          </div>
        )}

        {/* TOOLS GRID */}
        <section className="mb-12">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 px-1">Quick Tools</h3>
          {/* Changed grid-cols-3 to grid-cols-2 and xl:grid-cols-4 for better fit */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <ToolCard 
              title="Smart Invoice" 
              desc="Create professional invoices in seconds" 
              icon={<FileText className="text-blue-600" />} 
              color="bg-blue-50"
              onClick={() => navigate("/invoice-generate")}
            />
            <ToolCard 
              title="Image to PDF" 
              desc="Convert and merge images into PDFs" 
              icon={<ImageIcon className="text-purple-600" />} 
              color="bg-purple-50"
              onClick={() => navigate("/pdf-generate")}
            />
            <ToolCard 
              title="PDF to Image" 
              desc="Convert PDF into Images page by page" 
              icon={<ImageIcon className="text-purple-600" />} 
              color="bg-purple-50"
              onClick={() => navigate("pdf-to-image")}
            />
            <ToolCard 
              title="Text OCR" 
              desc="Extract text from any document" 
              icon={<Search className="text-emerald-600" />} 
              color="bg-emerald-50"
              onClick={() => navigate("/text-extractor")}
            />
            {/* NEW TOOL CARD */}
            <ToolCard 
              title="Compress" 
              desc="Reduce file size without losing quality" 
              icon={<Zap className="text-amber-600" />} 
              color="bg-amber-50"
              onClick={() => navigate("/compress")}
            />
          </div>
        </section>

        {/* DRIVE FILES SECTION */}
        {isGoogleConnected && (
          <section className="bg-white rounded-32 p-8 border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <div className="bg-amber-50 p-2 rounded-lg">
                  <Folder className="text-amber-600" size={20} />
                </div>
                <h3 className="text-xl font-bold text-slate-800">Cloud Storage</h3>
              </div>
              <button 
                onClick={() => window.open("https://drive.google.com", "_blank")}
                className="text-sm font-semibold text-indigo-600 hover:underline flex items-center gap-1"
              >
                View all in Drive <ExternalLink size={14} />
              </button>
            </div>

            {files.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                <p className="text-slate-400">No files found in your drive.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {files.slice(0, 8).map((file) => (
                  <div key={file.id} className="group border border-slate-100 p-4 rounded-2xl hover:border-indigo-200 hover:shadow-lg transition-all duration-200 bg-white">
                    <div className="bg-slate-50 w-10 h-10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-indigo-50 transition-colors">
                      <FileText className="text-slate-400 group-hover:text-indigo-600" size={20} />
                    </div>
                    <p className="font-semibold text-slate-700 truncate mb-1">{file.name}</p>
                    <p className="text-xs text-slate-400 mb-4 tracking-tight">Modified recently</p>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => window.open(`https://drive.google.com/file/d/${file.id}/view`, "_blank")}
                        className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 flex-1 py-2 rounded-lg hover:bg-indigo-100 transition-colors"
                      >
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

function NavItem({ icon, label, active = false, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3.5 w-full rounded-2xl transition-all duration-200 group ${
        active 
        ? "bg-indigo-50 text-indigo-600" 
        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
      }`}
    >
      <span className={`${active ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"}`}>
        {icon}
      </span>
      <span className="font-bold text-sm tracking-tight">{label}</span>
      {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600 shadow-[0_0_8px_rgba(79,70,229,0.6)]" />}
    </button>
  );
}

function ToolCard({ title, desc, icon, color, onClick }) {
  return (
    <div 
      onClick={onClick}
      className="bg-white p-6 rounded-24 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
    >
      <div className={`${color} w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
      <h4 className="text-lg font-bold text-slate-800 mb-1">{title}</h4>
      <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}