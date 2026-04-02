// import { NavLink, Outlet } from "react-router-dom";
// import { LayoutDashboard, FileText, Image } from "lucide-react";


// export default function SidebarLayout() {
// const linkClass = ({ isActive }) =>
// `flex items-center gap-3 px-4 py-3 rounded-lg transition ${
// isActive
// ? "bg-black text-white"
// : "text-gray-600 hover:bg-gray-100"
// }`;


// return (
// <div className="min-h-screen flex bg-gray-100">
// {/* Sidebar */}
// <aside className="w-64 bg-white border-r p-6">
// <h1 className="text-2xl font-bold mb-10">PDF Suite</h1>


// <nav className="space-y-2">
// <NavLink to="/" className={linkClass}>
// <LayoutDashboard size={18} /> Dashboard
// </NavLink>
// <NavLink to="/invoice-generate" className={linkClass}>
// <FileText size={18} /> Invoice Generator
// </NavLink>
// <NavLink to="/image-generate" className={linkClass}>
// <Image size={18} /> Image to PDF
// </NavLink>
// </nav>
// </aside>


// {/* Main content */}
// <main className="flex-1 p-8">
// <Outlet />
// </main>
// </div>
// );
// }

import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, FileText, Image, ScanText, 
  Zap, LogOut, Sparkles, ChevronRight, 
  FolderOpen, Layers, FileStack, Users, Star
} from "lucide-react";
import { useState, useEffect } from "react";

export default function SidebarLayout() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const navItems = [
    { path: "/", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/invoice-generate", icon: FileText, label: "Invoice" },
    { path: "/pdf-generate", icon: Image, label: "Image to PDF" },
    { path: "/pdf-to-image", icon: Image, label: "PDF to Image" },
    { path: "/text-extractor", icon: ScanText, label: "Text OCR" },
    { path: "/compress", icon: Zap, label: "Compressor" },
    { path: "/drive-files", icon: Folder, label: "Drive Files" }
  ];

  // New Template & Documents Section
  const templateItems = [
    { path: "/templates", icon: Layers, label: "Template Library" },
    { path: "/templates/create", icon: FileStack, label: "Create Template" },
    { path: "/my-documents", icon: FolderOpen, label: "My Documents" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
      isActive
        ? "bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600 shadow-sm"
        : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
    }`;

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Sidebar */}
      <aside className={`${collapsed ? 'w-20' : 'w-72'} bg-white border-r border-slate-200 flex flex-col transition-all duration-300 sticky h-screen top-0 shadow-sm`}>
        <div className={`p-6 ${collapsed ? 'px-4' : ''} border-b border-slate-100`}>
          {!collapsed ? (
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-2.5 rounded-xl shadow-lg">
                <Sparkles className="text-white" size={22} />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">
                  <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">DocuGen</span>
                </h1>
                <p className="text-xs text-slate-400">Pro Suite</p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-2.5 rounded-xl shadow-lg">
                <Sparkles className="text-white" size={22} />
              </div>
            </div>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {/* Main Tools Section */}
          <div className="mb-4">
            {!collapsed && <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-3 px-3">Quick Tools</p>}
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink key={item.path} to={item.path} className={linkClass}>
                  <Icon size={18} />
                  {!collapsed && <span className="font-medium text-sm">{item.label}</span>}
                </NavLink>
              );
            })}
          </div>

          {/* Templates Section */}
          <div className="pt-4 mt-2 border-t border-slate-100">
            {!collapsed && <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-3 px-3">Templates & Documents</p>}
            {templateItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink key={item.path} to={item.path} className={linkClass}>
                  <Icon size={18} />
                  {!collapsed && <span className="font-medium text-sm">{item.label}</span>}
                </NavLink>
              );
            })}
          </div>
        </nav>

        <div className="p-4 border-t border-slate-100">
          {!collapsed && user && (
            <div className="mb-3 p-3 bg-slate-50 rounded-xl">
              <p className="text-sm font-semibold text-slate-700 truncate">{user.name}</p>
              <p className="text-xs text-slate-400 truncate">{user.email}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 w-full px-4 py-3 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 ${collapsed ? 'justify-center' : ''}`}
          >
            <LogOut size={18} />
            {!collapsed && <span className="font-medium text-sm">Logout</span>}
          </button>
        </div>

        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 bg-white border border-slate-200 rounded-full p-1 shadow-md hover:shadow-lg transition"
        >
          <ChevronRight size={14} className={`text-slate-400 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}