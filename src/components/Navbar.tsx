import { Link, useLocation } from 'react-router-dom';
import { PackageSearch, ShieldCheck, ShoppingBag, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';

export function Navbar() {
  const location = useLocation();
  const { totalItems, openDrawer } = useCart();

  const isTrack = location.pathname === '/track';
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <header className="sticky top-0 z-40 border-b border-[#E5E7EB] bg-[#FAF9F6]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="flex items-center gap-2.5 text-[#0F3D3E] transition-opacity hover:opacity-90"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0F3D3E] text-[#FAF9F6] shadow-sm">
            <Sparkles className="h-4 w-4" />
          </span>
          <div className="flex flex-col leading-none">
            <span className="text-base font-bold tracking-tight sm:text-lg">
              By Sawadhee
            </span>
            <span className="text-[10px] font-medium uppercase tracking-widest text-[#6B7280]">
              Boutique Studio
            </span>
          </div>
        </Link>

        <nav className="flex items-center gap-1.5 sm:gap-3">
          <Link
            to="/track"
            className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-colors sm:text-sm ${
              isTrack
                ? 'bg-[#0F3D3E]/10 text-[#0F3D3E]'
                : 'text-[#6B7280] hover:bg-white hover:text-[#1F2937]'
            }`}
          >
            <PackageSearch className="h-4 w-4" />
            <span>Lacak Pesanan</span>
          </Link>

          <Link
            to="/admin"
            className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-colors sm:text-sm ${
              isAdmin
                ? 'bg-[#0F3D3E]/10 text-[#0F3D3E]'
                : 'text-[#6B7280] hover:bg-white hover:text-[#1F2937]'
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            <span>Admin</span>
          </Link>

          <button
            type="button"
            onClick={openDrawer}
            className="relative inline-flex items-center gap-2 rounded-xl bg-[#0F3D3E] px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-[#0B2E2F] active:scale-[0.98] sm:text-sm"
            aria-label="Buka keranjang belanja"
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">Keranjang</span>
            {totalItems > 0 && (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#D97706] px-1.5 text-[11px] font-bold text-white">
                {totalItems}
              </span>
            )}
          </button>
        </nav>
      </div>
    </header>
  );
}
