import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Loader, Crown, Zap, Rocket } from 'lucide-react';

export default function Page3() {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [showPlans, setShowPlans] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    setRegisterError('');

    try {
      const { error } = await signIn(loginEmail, loginPassword);
      setLoginLoading(false);

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setLoginError('Invalid email or password. Please try again.');
        } else {
          setLoginError(error.message);
        }
      } else {
        setShowPlans(true);
      }
    } catch (err) {
      setLoginLoading(false);
      setLoginError('An unexpected error occurred. Please try again.');
      console.error('Login error:', err);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterLoading(true);
    setRegisterError('');
    setLoginError('');

    try {
      const { error } = await signUp(registerEmail, registerPassword);
      setRegisterLoading(false);

      if (error) {
        if (error.message.includes('already registered')) {
          setRegisterError('This email is already registered. Please login instead.');
        } else {
          setRegisterError(error.message);
        }
      } else {
        setShowPlans(true);
      }
    } catch (err) {
      setRegisterLoading(false);
      setRegisterError('An unexpected error occurred. Please try again.');
      console.error('Registration error:', err);
    }
  };

  const [activatingPlan, setActivatingPlan] = useState(false);
  const [planError, setPlanError] = useState('');

  const handlePlanSelect = async (planTier: string, price: number) => {
    setActivatingPlan(true);
    setPlanError('');

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setPlanError('Please login first');
        setActivatingPlan(false);
        return;
      }

      const priceIds: Record<string, string> = {
        basic: 'price_basic',
        pro: 'price_pro',
        studio: 'price_studio'
      };

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            priceId: priceIds[planTier],
            planTier: planTier,
            planPrice: price
          })
        }
      );

      const result = await response.json();

      if (!response.ok) {
        console.error('Stripe checkout failed:', result);
        throw new Error(result.error || 'Failed to create checkout session');
      }

      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Plan activation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to activate plan. Please try again.';
      setPlanError(errorMessage);
      setActivatingPlan(false);
    }
  };

  if (showPlans) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4 py-12">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-black to-purple-900/10"></div>

        <div className="relative z-10 max-w-7xl w-full">
          <div className="text-center mb-12">
            <h2 className="text-6xl font-black text-white mb-4">Choose Your Plan</h2>
            <p className="text-2xl text-purple-400">Select the perfect plan for your creative journey</p>
            {planError && (
              <div className="mt-6 max-w-2xl mx-auto p-4 bg-red-500/20 border border-red-500/50 rounded-xl">
                <p className="text-red-400">{planError}</p>
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="group relative bg-gradient-to-b from-purple-900/30 to-black backdrop-blur-xl rounded-3xl p-8 border-2 border-purple-700 hover:border-purple-500 transition-all transform hover:scale-105 hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-b from-purple-600/10 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-3xl font-bold text-white">Basic</h3>
                  <Zap className="w-8 h-8 text-purple-400" />
                </div>
                <div className="mb-8">
                  <span className="text-6xl font-black text-white">$10</span>
                  <span className="text-xl text-gray-400">/mo</span>
                </div>
                <ul className="space-y-4 mb-8 text-gray-300">
                  <li className="flex items-start gap-3">
                    <span className="text-purple-500 mt-1">✓</span>
                    <span>720 AI Tools Access</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-purple-500 mt-1">✓</span>
                    <span>720p Export Quality</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-purple-500 mt-1">✓</span>
                    <span>5GB Cloud Storage</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-purple-500 mt-1">✓</span>
                    <span>Community Support</span>
                  </li>
                </ul>
                <button
                  onClick={() => handlePlanSelect('basic', 10)}
                  disabled={activatingPlan}
                  className="w-full py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {activatingPlan && <Loader className="w-5 h-5 animate-spin" />}
                  {activatingPlan ? 'Activating...' : 'Select Basic'}
                </button>
              </div>
            </div>

            <div className="group relative bg-gradient-to-b from-purple-800/30 to-black backdrop-blur-xl rounded-3xl p-8 border-4 border-purple-500 transform scale-105">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-2 rounded-full text-sm font-black shadow-lg">
                MOST POPULAR
              </div>
              <div className="absolute inset-0 bg-gradient-to-b from-purple-600/10 to-transparent rounded-3xl"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-3xl font-bold text-white">Pro</h3>
                  <Crown className="w-8 h-8 text-purple-400" />
                </div>
                <div className="mb-8">
                  <span className="text-6xl font-black text-white">$20</span>
                  <span className="text-xl text-gray-400">/mo</span>
                </div>
                <ul className="space-y-4 mb-8 text-gray-300">
                  <li className="flex items-start gap-3">
                    <span className="text-purple-400 mt-1">✓</span>
                    <span>All Basic Features</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-purple-400 mt-1">✓</span>
                    <span>1080p Full HD Export</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-purple-400 mt-1">✓</span>
                    <span>50GB Cloud Storage</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-purple-400 mt-1">✓</span>
                    <span>Priority Support</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-purple-400 mt-1">✓</span>
                    <span>Advanced AI Tools</span>
                  </li>
                </ul>
                <button
                  onClick={() => handlePlanSelect('pro', 20)}
                  disabled={activatingPlan}
                  className="w-full py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-black rounded-xl transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {activatingPlan && <Loader className="w-5 h-5 animate-spin" />}
                  {activatingPlan ? 'Activating...' : 'Select Pro'}
                </button>
              </div>
            </div>

            <div className="group relative bg-gradient-to-b from-purple-900/30 to-black backdrop-blur-xl rounded-3xl p-8 border-2 border-purple-700 hover:border-purple-500 transition-all transform hover:scale-105 hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-b from-purple-600/10 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-3xl font-bold text-white">Studio</h3>
                  <Rocket className="w-8 h-8 text-purple-400" />
                </div>
                <div className="mb-8">
                  <span className="text-6xl font-black text-white">$30</span>
                  <span className="text-xl text-gray-400">/mo</span>
                </div>
                <ul className="space-y-4 mb-8 text-gray-300">
                  <li className="flex items-start gap-3">
                    <span className="text-purple-400 mt-1">✓</span>
                    <span>All Pro Features</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-purple-400 mt-1">✓</span>
                    <span>4K Ultra HD Export</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-purple-400 mt-1">✓</span>
                    <span>Unlimited Storage</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-purple-400 mt-1">✓</span>
                    <span>24/7 VIP Support</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-purple-400 mt-1">✓</span>
                    <span>Exclusive AI Models</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-purple-400 mt-1">✓</span>
                    <span>Commercial License</span>
                  </li>
                </ul>
                <button
                  onClick={() => handlePlanSelect('studio', 30)}
                  disabled={activatingPlan}
                  className="w-full py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {activatingPlan && <Loader className="w-5 h-5 animate-spin" />}
                  {activatingPlan ? 'Activating...' : 'Select Studio'}
                </button>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-400 text-sm">
              Please select a plan to continue. Payment is required to access the platform.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-black to-purple-900/10"></div>

      <button
        onClick={() => navigate('/intro')}
        className="fixed top-8 left-8 z-20 flex items-center gap-2 px-6 py-3 bg-purple-900/30 hover:bg-purple-800/40 backdrop-blur-md border border-purple-600/50 text-white font-bold rounded-xl transition-all"
      >
        <ArrowLeft className="w-5 h-5" />
        Back
      </button>

      <div className="relative z-10 max-w-6xl w-full">
        <div className="text-center mb-12">
          <h2 className="text-6xl font-black text-white mb-4">Welcome Back</h2>
          <p className="text-xl text-purple-400">Login or create your account to start creating</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-gradient-to-b from-purple-900/30 to-black backdrop-blur-xl rounded-3xl p-10 border border-purple-700/50">
            <h3 className="text-4xl font-black text-white mb-8">Login</h3>
            {loginError && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl">
                <p className="text-red-400">{loginError}</p>
              </div>
            )}
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-purple-400 mb-2">Email Address</label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full px-5 py-4 bg-white/5 border border-purple-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-purple-400 mb-2">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full px-5 py-4 bg-white/5 border border-purple-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loginLoading && <Loader className="w-5 h-5 animate-spin" />}
                {loginLoading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          </div>

          <div className="bg-gradient-to-b from-purple-900/30 to-black backdrop-blur-xl rounded-3xl p-10 border border-purple-700/50">
            <h3 className="text-4xl font-black text-white mb-8">Register</h3>
            {registerError && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl">
                <p className="text-red-400">{registerError}</p>
              </div>
            )}
            <form onSubmit={handleRegister} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-purple-400 mb-2">Email Address</label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  className="w-full px-5 py-4 bg-white/5 border border-purple-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-purple-400 mb-2">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  className="w-full px-5 py-4 bg-white/5 border border-purple-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={registerLoading}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {registerLoading && <Loader className="w-5 h-5 animate-spin" />}
                {registerLoading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
