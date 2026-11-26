import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Lock, Mail, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export function AdminLoginPage() {
  const { isAuthenticated, login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('admin@bysawadhee.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const ok = login(email, password);
    if (ok) {
      showToast('Selamat datang kembali, Admin By Sawadhee!');
      navigate('/admin', { replace: true });
    } else {
      setError('Email atau kata sandi tidak sesuai.');
      showToast('Gagal masuk. Periksa kembali kredensial Anda.', 'error');
    }
  };

  return (
    <main className="mx-auto flex min-h-[calc(100vh-14rem)] max-w-md items-center px-4 py-12">
      <div className="w-full rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm sm:p-8">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0F3D3E] text-white">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-xl font-extrabold text-[#1F2937]">
            Masuk Dashboard Admin
          </h1>
          <p className="mt-1 text-xs text-[#6B7280]">
            Kelola pesanan pelanggan dan katalog produk By Sawadhee.
          </p>
        </div>

        {/* Demo Credentials Box */}
        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 text-xs text-amber-900">
          <p className="font-bold">Kredensial Demo:</p>
          <p className="mt-1">
            Email: <span className="font-mono font-semibold">admin@bysawadhee.com</span>
          </p>
          <p>
            Kata Sandi: <span className="font-mono font-semibold">sawadhee123</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-[#1F2937]">
              Email Admin
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@bysawadhee.com"
                className="w-full rounded-xl border border-[#E5E7EB] bg-white py-2.5 pl-10 pr-4 text-sm text-[#1F2937] focus:border-[#0F3D3E] focus:outline-none focus:ring-2 focus:ring-[#0F3D3E]/15"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-[#1F2937]">
              Kata Sandi
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan kata sandi"
                className="w-full rounded-xl border border-[#E5E7EB] bg-white py-2.5 pl-10 pr-4 text-sm text-[#1F2937] focus:border-[#0F3D3E] focus:outline-none focus:ring-2 focus:ring-[#0F3D3E]/15"
              />
            </div>
          </div>

          {error && (
            <p className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full rounded-xl bg-[#0F3D3E] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0B2E2F]"
          >
            Masuk ke Dashboard
          </button>
        </form>
      </div>
    </main>
  );
}
