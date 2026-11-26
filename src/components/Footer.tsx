import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="mt-16 border-t border-[#E5E7EB] bg-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 text-center sm:flex-row sm:px-6 sm:text-left lg:px-8">
        <div>
          <p className="text-sm font-bold text-[#0F3D3E]">By Sawadhee</p>
          <p className="mt-0.5 text-xs text-[#6B7280]">
            Koleksi busana, aroma ruang, dan aksesori kurasi hangat untuk keseharian Anda.
          </p>
        </div>
        <div className="flex items-center gap-5 text-xs font-medium text-[#6B7280]">
          <Link to="/" className="hover:text-[#0F3D3E]">
            Katalog
          </Link>
          <Link to="/track" className="hover:text-[#0F3D3E]">
            Lacak Pesanan
          </Link>
          <Link to="/admin" className="hover:text-[#0F3D3E]">
            Portal Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
