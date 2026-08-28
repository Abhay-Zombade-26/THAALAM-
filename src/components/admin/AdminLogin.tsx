import React, { useState } from 'react';
import { Lock, Mail, ArrowRight, ArrowLeft, Shield, AlertCircle, Loader2 } from 'lucide-react';

interface AdminLoginProps {
  onLogin: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  onBackToSite: () => void;
  isLoading: boolean;
  error: string | null;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({
  onLogin,
  onBackToSite,
  isLoading,
  error
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!email.trim() || !password.trim()) {
      setLocalError('Please enter both email and password.');
      return;
    }

    const res = await onLogin(email.trim(), password);
    if (!res.success && res.error) {
      setLocalError(res.error);
    }
  };

  const displayedError = localError || error;

  return (
    <div className="min-h-screen bg-[#0b090a] text-amber-50 flex items-center justify-center p-4 sm:p-6 font-sans-ui relative overflow-hidden select-none">
      {/* Subtle Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Login Card */}
      <div className="relative w-full max-w-md bg-[#120e10]/90 backdrop-blur-2xl border border-amber-500/30 rounded-3xl p-7 sm:p-9 shadow-[0_30px_70px_rgba(0,0,0,0.9)] overflow-hidden">
        {/* Subtle Top Gold Stroke */}
        <div className="absolute top-0 left-8 right-8 h-[1.5px] bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />

        {/* Back Link */}
        <button
          onClick={onBackToSite}
          className="inline-flex items-center gap-1.5 text-xs text-amber-300/70 hover:text-amber-100 mb-6 transition-colors group"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
          <span>Back to THAALAM Sanctuary</span>
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-serif-cinzel text-xl font-bold tracking-wider text-amber-100">
              Admin Portal
            </h1>
            <p className="text-xs text-amber-400/70 font-sans-ui">
              THAALAM Backend & Playlist Management
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {displayedError && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-950/70 border border-red-500/40 text-red-300 text-xs font-sans-ui flex items-center gap-2.5 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{displayedError}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-amber-200/90 mb-1.5 uppercase tracking-wider">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-amber-500/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (localError) setLocalError(null);
                }}
                disabled={isLoading}
                placeholder="admin@thaalam.com"
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-amber-950/20 border border-amber-500/30 text-amber-100 placeholder-amber-500/40 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all font-sans"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-amber-200/90 mb-1.5 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-amber-500/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (localError) setLocalError(null);
                }}
                disabled={isLoading}
                placeholder="••••••••••••"
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-amber-950/20 border border-amber-500/30 text-amber-100 placeholder-amber-500/40 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all font-sans"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full mt-2 py-3 px-5 rounded-xl font-sans-ui font-semibold text-xs tracking-wider uppercase shadow-lg transition-all flex items-center justify-center gap-2 ${
              isLoading
                ? 'bg-amber-950/50 text-amber-400/40 border border-amber-500/10 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-500 text-amber-950 shadow-amber-950/50 hover:shadow-amber-500/25 active:scale-[0.99]'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-amber-950" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Note */}
        <p className="text-[11px] text-amber-400/50 text-center mt-6">
          Authorized personnel only. Public users can access the sanctuary freely.
        </p>
      </div>
    </div>
  );
};
