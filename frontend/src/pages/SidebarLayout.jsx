import { NavLink, Outlet } from "react-router-dom";
import { LayoutDashboard, FileText, Image } from "lucide-react";


export default function SidebarLayout() {
const linkClass = ({ isActive }) =>
`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
isActive
? "bg-black text-white"
: "text-gray-600 hover:bg-gray-100"
}`;


return (
<div className="min-h-screen flex bg-gray-100">
{/* Sidebar */}
<aside className="w-64 bg-white border-r p-6">
<h1 className="text-2xl font-bold mb-10">PDF Suite</h1>


<nav className="space-y-2">
<NavLink to="/" className={linkClass}>
<LayoutDashboard size={18} /> Dashboard
</NavLink>
<NavLink to="/invoice-generate" className={linkClass}>
<FileText size={18} /> Invoice Generator
</NavLink>
<NavLink to="/image-generate" className={linkClass}>
<Image size={18} /> Image to PDF
</NavLink>
</nav>
</aside>


{/* Main content */}
<main className="flex-1 p-8">
<Outlet />
</main>
</div>
);
}