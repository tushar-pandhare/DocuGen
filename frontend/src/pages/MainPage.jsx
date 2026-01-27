import { FileText, Image, ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-100 via-white to-gray-200 p-8">
      <div className="max-w-6xl mx-auto space-y-12">

        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-black via-gray-900 to-gray-800 text-white p-10 md:p-14 shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.15),transparent_60%)]  " />

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight">
                DocuGen
              </h1>
              <p className="text-gray-300 mt-4 max-w-xl leading-relaxed">
                Create invoices and convert images into high-quality PDFs with
                a fast, modern, and reliable document engine.
              </p>
            </div>

            <button
              onClick={() => navigate("/invoice-generate")}
              className="group flex items-center gap-3 bg-white text-black px-7 py-4 rounded-2xl font-semibold shadow-lg hover:scale-105 transition"
            >
              Get Started
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition"
              />
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Quick Actions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* Invoice Card */}
            <div
              onClick={() => navigate("/invoice-generate")}
              className="group cursor-pointer rounded-3xl bg-white border border-gray-200 p-8 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition"
            >
              <div className="flex items-center gap-5 mb-5">
                <div className="p-4 rounded-2xl bg-black text-white group-hover:scale-110 transition">
                  <FileText size={26} />
                </div>
                <h3 className="text-xl font-semibold text-gray-800">
                  Invoice Generator
                </h3>
              </div>

              <p className="text-gray-500 leading-relaxed">
                Create professional invoices with customer details, items,
                taxes, totals, and instant PDF downloads.
              </p>

              <div className="mt-6 text-sm font-medium text-black flex items-center gap-2">
                Create Invoice
                <ArrowRight size={14} />
              </div>
            </div>

            {/* Image to PDF Card */}
            <div
              onClick={() => navigate("/pdf-generate")}
              className="group cursor-pointer rounded-3xl bg-white border border-gray-200 p-8 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition"
            >
              <div className="flex items-center gap-5 mb-5">
                <div className="p-4 rounded-2xl bg-black text-white group-hover:scale-110 transition">
                  <Image size={26} />
                </div>
                <h3 className="text-xl font-semibold text-gray-800">
                  Image to PDF
                </h3>
              </div>

              <p className="text-gray-500 leading-relaxed">
                Upload images and convert them into clean, printable PDFs using
                our high-quality rendering engine.
              </p>

              <div className="mt-6 text-sm font-medium text-black flex items-center gap-2">
                Convert Images
                <ArrowRight size={14} />
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: "Documents Created", value: "128+" },
            { label: "PDF Exports", value: "92+" },
            { label: "Active Tools", value: "2" },
          ].map((stat, i) => (
            <div
              key={i}
              className="rounded-3xl bg-white/70 backdrop-blur border border-gray-200 p-8 shadow-md hover:shadow-xl transition"
            >
              <h4 className="text-sm text-gray-500">{stat.label}</h4>
              <p className="text-4xl font-extrabold text-gray-800 mt-3">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Footer CTA */}
        <div className="rounded-3xl bg-white border border-dashed border-gray-300 p-8 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3 text-gray-600">
            <Sparkles />
            <p className="font-medium">
              More tools coming soon — stay tuned!
            </p>
          </div>
          <span className="text-sm text-gray-400">v1.0.0</span>
        </div>

      </div>
    </div>
  );
}
