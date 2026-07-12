import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Compass, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { Button } from '../components/button/button';
import { useToast } from '../components/toast/toast';

type AuthView = 'login' | 'signup' | 'forgot';

export const Auth: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { success, error } = useToast();

  const getInitialView = (): AuthView => {
    if (location.pathname === '/signup') return 'signup';
    if (location.pathname === '/forgot-password') return 'forgot';
    return 'login';
  };

  const [view, setView] = useState<AuthView>(getInitialView());
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [org, setOrg] = useState('');
  const [role, setRole] = useState('FLEET_MANAGER');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      error('Please fill in all required fields.');
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.detail || 'Invalid email or password');
      }

      const data = await response.json();
      localStorage.setItem('transitops_token', data.access_token);
      localStorage.setItem('transitops_logged_in', 'true');
      success('Authenticated successfully. Redirecting to dashboard…');
      setTimeout(() => navigate('/dashboard'), 400);
    } catch (err: any) {
      error(err.message);
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !org || !role) {
      error('All fields are required for organization registration.');
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.detail || 'Registration failed');
      }
      
      success('Organization registered. Please sign in!');
      setView('login');
      setIsLoading(false);
    } catch (err: any) {
      error(err.message);
      setIsLoading(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      error('Please enter your registered email address.');
      return;
    }
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 700));
    setIsLoading(false);
    success('Password recovery link sent to ' + email);
    setTimeout(() => { setView('login'); navigate('/login'); }, 1500);
  };

  const switchView = (v: AuthView) => {
    setView(v);
    setIsLoading(false);
    if (v === 'login') navigate('/login');
    else if (v === 'signup') navigate('/signup');
    else navigate('/forgot-password');
  };

  const inputClass = 'w-full px-4 py-2.5 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-400';
  const labelClass = 'block text-xs font-semibold text-slate-700 mb-1.5';

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12 font-sans">
      <div className="w-full max-w-md">

        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 mb-4 cursor-pointer" onClick={() => navigate('/')}>
            <div className="bg-blue-600 text-white p-2 rounded-xl">
              <Compass className="h-6 w-6" />
            </div>
            <div className="text-left">
              <span className="text-xl font-bold text-slate-900 tracking-tight">TransitOps</span>
              <span className="text-[10px] text-slate-400 font-semibold block uppercase tracking-wider -mt-1">Fleet Management Portal</span>
            </div>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          
          {/* Header */}
          <div className="px-8 pt-8 pb-2">
            <h2 className="text-lg font-bold text-slate-900">
              {view === 'login' && 'Sign in to your account'}
              {view === 'signup' && 'Register your organization'}
              {view === 'forgot' && 'Recover your password'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {view === 'login' && 'Access your fleet dispatcher console.'}
              {view === 'signup' && 'Set up a new TransitOps workspace for your logistics team.'}
              {view === 'forgot' && 'We\'ll send a secure reset link to your registered email.'}
            </p>
          </div>

          {/* Form */}
          <form className="px-8 py-6 space-y-5" onSubmit={view === 'login' ? handleLogin : view === 'signup' ? handleSignup : handleForgot}>
            
            {view === 'signup' && (
              <>
                <div>
                  <label className={labelClass}>Full Name</label>
                  <input type="text" className={inputClass} placeholder="Ayush Saini" value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Organization Name</label>
                  <input type="text" className={inputClass} placeholder="TransitOps Logistics Pvt. Ltd." value={org} onChange={e => setOrg(e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Role</label>
                  <select className={inputClass} value={role} onChange={e => setRole(e.target.value)}>
                    <option value="FLEET_MANAGER">Fleet Manager</option>
                    <option value="DISPATCHER">Dispatcher</option>
                    <option value="SAFETY_OFFICER">Safety Officer</option>
                    <option value="FINANCIAL_ANALYST">Financial Analyst</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label className={labelClass}>Email Address</label>
              <input type="email" className={inputClass} placeholder="dispatcher@transitops.in" value={email} onChange={e => setEmail(e.target.value)} />
            </div>

            {(view === 'login' || view === 'signup') && (
              <div>
                <label className={labelClass}>Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className={`${inputClass} pr-10`}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}

            {view === 'login' && (
              <div className="flex justify-end">
                <button type="button" className="text-xs text-blue-600 hover:text-blue-700 font-medium focus:outline-none" onClick={() => switchView('forgot')}>
                  Forgot password?
                </button>
              </div>
            )}

            <Button type="submit" className="w-full" isLoading={isLoading}>
              {view === 'login' && 'Sign In'}
              {view === 'signup' && 'Create Organization'}
              {view === 'forgot' && 'Send Recovery Link'}
            </Button>
          </form>

          {/* Footer switchers */}
          <div className="px-8 py-5 bg-slate-50/50 border-t border-slate-100 text-center text-xs text-slate-500">
            {view === 'login' && (
              <span>
                Don't have an account?{' '}
                <button className="text-blue-600 hover:text-blue-700 font-semibold focus:outline-none" onClick={() => switchView('signup')}>
                  Register now
                </button>
              </span>
            )}
            {view === 'signup' && (
              <span>
                Already registered?{' '}
                <button className="text-blue-600 hover:text-blue-700 font-semibold focus:outline-none" onClick={() => switchView('login')}>
                  Sign in instead
                </button>
              </span>
            )}
            {view === 'forgot' && (
              <button className="flex items-center gap-1.5 mx-auto text-blue-600 hover:text-blue-700 font-semibold focus:outline-none" onClick={() => switchView('login')}>
                <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
              </button>
            )}
          </div>
        </div>

        {/* Legal */}
        <p className="text-center text-[10px] text-slate-400 mt-6">
          By continuing, you agree to TransitOps Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
};
