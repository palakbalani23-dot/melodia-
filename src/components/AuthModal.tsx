import React, { useState } from 'react';
import { X, Mail, Lock, User as UserIcon, ShieldAlert, Sparkles } from 'lucide-react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider 
} from 'firebase/auth';
import { auth } from '../firebase';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: (token: string, user: any) => void;
}

export default function AuthModal({ onClose, onSuccess }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'user' | 'admin'>('user');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let firebaseUser;
      if (isLogin) {
        // Authenticate with Firebase Email/Password
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        firebaseUser = userCredential.user;
      } else {
        // Register with Firebase Email/Password
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, {
          displayName: name || email.split('@')[0]
        });
        firebaseUser = userCredential.user;
      }

      // Synchronize with the Express Server backend
      const response = await fetch('/api/auth/firebase-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || name || firebaseUser.email?.split('@')[0],
          role: role
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to synchronize with server.');
      }

      onSuccess(data.token, data.user);
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const firebaseUser = userCredential.user;

      // Synchronize with Express Server
      const response = await fetch('/api/auth/firebase-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
          role: 'user'
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to synchronize with server.');
      }

      onSuccess(data.token, data.user);
    } catch (err: any) {
      setError(err.message || 'Google Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="auth-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050508]/85 backdrop-blur-md select-none">
      <div 
        id="auth-modal-content" 
        className="w-full max-w-md bg-[#050508]/80 border border-white/10 rounded-2xl shadow-2xl relative overflow-hidden flex flex-col backdrop-blur-xl"
      >
        {/* Color Highlight Bar */}
        <div className="h-1.5 bg-orange-500 w-full" />

        {/* Modal Close Button */}
        <button
          id="btn-auth-close"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Form Body */}
        <div className="p-8 flex-1">
          {/* Header */}
          <div className="text-center mb-6">
            <h3 className="font-display font-bold text-2xl text-white tracking-tight">
              {isLogin ? 'Connect to Melodia' : 'Create Melodia Account'}
            </h3>
            <p className="text-xs text-white/40 mt-1.5">
              {isLogin ? 'Stream and curate playlists with AI intelligence' : 'Join a community of music curators'}
            </p>
          </div>

          {/* Tab Selection */}
          <div className="grid grid-cols-2 p-1 bg-black/40 rounded-xl mb-6 border border-white/5">
            <button
              id="tab-auth-login"
              type="button"
              onClick={() => { setIsLogin(true); setError(''); }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                isLogin 
                  ? 'bg-white/10 text-white shadow-md' 
                  : 'text-white/40 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              id="tab-auth-register"
              type="button"
              onClick={() => { setIsLogin(false); setError(''); }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                !isLogin 
                  ? 'bg-white/10 text-white shadow-md' 
                  : 'text-white/40 hover:text-white'
              }`}
            >
              Register
            </button>
          </div>

          {/* Errors */}
          {error && (
            <div id="auth-error-alert" className="p-3 mb-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs text-center font-medium">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/60">Display Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-white/30">
                    <UserIcon className="h-4 w-4" />
                  </span>
                  <input
                    id="input-auth-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/20 border border-white/5 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm text-white placeholder-white/20 outline-none transition-all"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/60">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-white/30">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  id="input-auth-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/20 border border-white/5 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm text-white placeholder-white/20 outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/60">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-white/30">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  id="input-auth-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/20 border border-white/5 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm text-white placeholder-white/20 outline-none transition-all"
                />
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-semibold text-white/60 flex items-center gap-1.5">
                  <ShieldAlert className="h-3 w-3 text-orange-400" />
                  Account Role Permission
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className={`flex items-center justify-center p-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                    role === 'user' 
                      ? 'border-orange-500 bg-orange-500/10 text-orange-300' 
                      : 'border-white/5 bg-black/20 text-white/40 hover:text-white'
                  }`}>
                    <input
                      type="radio"
                      name="role"
                      value="user"
                      checked={role === 'user'}
                      onChange={() => setRole('user')}
                      className="sr-only"
                    />
                    <span>Listener</span>
                  </label>
                  <label className={`flex items-center justify-center p-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                    role === 'admin' 
                      ? 'border-orange-500 bg-orange-500/10 text-orange-300' 
                      : 'border-white/5 bg-black/20 text-white/40 hover:text-white'
                  }`}>
                    <input
                      type="radio"
                      name="role"
                      value="admin"
                      checked={role === 'admin'}
                      onChange={() => setRole('admin')}
                      className="sr-only"
                    />
                    <span>Curator (Admin)</span>
                  </label>
                </div>
              </div>
            )}

            <button
              id="btn-auth-submit"
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-semibold text-sm transition-all shadow-lg shadow-orange-500/25 disabled:opacity-50 mt-4 active:scale-95 cursor-pointer"
            >
              {loading ? 'Authenticating...' : isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {/* Social Divider */}
          <div className="relative flex items-center justify-center my-4">
            <div className="absolute inset-x-0 h-px bg-white/5" />
            <span className="relative px-3 bg-[#0c0c14] text-[9px] text-white/30 font-semibold uppercase tracking-wider">Or</span>
          </div>

          {/* Google Sign-In Button */}
          <button
            id="btn-auth-google"
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-98"
          >
            <Sparkles className="h-3.5 w-3.5 text-orange-400" />
            <span>Continue with Google</span>
          </button>

          {/* Quick Demo Accounts Helper */}
          <div className="mt-6 border-t border-white/5 pt-4 text-center">
            <span className="text-[10px] text-white/30 font-semibold tracking-wider uppercase block mb-2">Preconfigured Accounts</span>
            <div className="flex flex-col gap-2 items-center justify-center">
              <button
                id="btn-auth-demo-palak"
                type="button"
                onClick={() => {
                  setEmail('palakbalani23@gmail.com');
                  setPassword('password');
                  setIsLogin(true);
                }}
                className="w-full py-1.5 px-3 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/25 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer hover:scale-[1.01] active:scale-95"
              >
                <Sparkles className="h-3.5 w-3.5 text-orange-400 animate-pulse" />
                <span>Palak Balani (Curator Profile)</span>
              </button>
              <div className="flex justify-center gap-4 mt-1">
                <button
                  id="btn-auth-demo-listener"
                  type="button"
                  onClick={() => {
                    setEmail('user@melodia.com');
                    setPassword('password');
                    setIsLogin(true);
                  }}
                  className="text-[10px] font-medium text-white/40 hover:text-orange-400 hover:underline cursor-pointer"
                >
                  Alex (Listener)
                </button>
                <button
                  id="btn-auth-demo-admin"
                  type="button"
                  onClick={() => {
                    setEmail('admin@melodia.com');
                    setPassword('password');
                    setIsLogin(true);
                  }}
                  className="text-[10px] font-medium text-white/40 hover:text-orange-400 hover:underline cursor-pointer"
                >
                  Sarah (Admin)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
