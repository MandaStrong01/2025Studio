import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Loader } from 'lucide-react';

export default function Page3() {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'pro' | 'studio'>('pro');
  const [loginLoading, setLoginLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [checkoutError, setCheckoutError] = useState('');
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

  const handlePlanSelect = async (planTier: string, price: number) => {
    setCheckoutLoading(true);
    setCheckoutError('');

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setCheckoutError('Please login first');
        setCheckoutLoading(false);
        return;
      }

      const priceIds: Record<string, string> = {
        basic: 'price_basic',
        pro: 'price_pro',
        studio: 'price_studio'
      };

      const checkoutResponse = await fetch(
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

      const checkoutResult = await checkoutResponse.json();

      if (checkoutResult.status === 'not_configured') {
        console.log('Stripe not configured, using direct activation...');

        const activateResponse = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/activate-subscription`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              plan_tier: planTier,
              plan_price: price
            })
          }
        );

        const activateResult = await activateResponse.json();

        if (!activateResponse.ok) {
          throw new Error(activateResult.error || 'Failed to activate subscription');
        }

        navigate('/tools');
        return;
      }

      if (!checkoutResponse.ok) {
        console.error('Stripe checkout failed:', checkoutResult);
        throw new Error(checkoutResult.error || 'Failed to create checkout session');
      }

      if (checkoutResult.checkoutUrl) {
        window.location.href = checkoutResult.checkoutUrl;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Plan activation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to activate plan. Please try again.';
      setCheckoutError(errorMessage);
      setCheckoutLoading(false);
    }
  };

  if (showPlans) {
    return (
      <div className="min-h-screen bg-black flex flex-col px-4 py-8">
        <div className="flex-1 flex items-center justify-center">
          <div className="max-w-6xl w-full">
            <div className="text-center mb-12">
              <h2 className="text-5xl font-black text-white mb-4">Choose Your Plan</h2>
              <p className="text-xl text-purple-400">Select the perfect plan for your creative journey</p>
              {checkoutError && (
                <div className="mt-6 max-w-2xl mx-auto p-4 bg-red-500/20 border border-red-500/50 rounded-xl">
                  <p className="text-red-400">{checkoutError}</p>
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div
                onClick={() => setSelectedPlan('basic')}
                className={`cursor-pointer bg-purple-900/30 backdrop-blur-sm border-2 p-8 rounded-2xl transition-all hover:scale-105 ${selectedPlan === 'basic' ? 'border-yellow-400 shadow-lg shadow-yellow-400/50' : 'border-purple-500'}`}
              >
                <h3 className="text-2xl font-bold text-white mb-2">Basic</h3>
                <p className="text-4xl font-black text-purple-300 mb-6">$10<span className="text-lg">/mo</span></p>
                <ul className="space-y-3 text-white mb-8">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400">✓</span>
                    <span>HD Export</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400">✓</span>
                    <span>100 AI Tools</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400">✓</span>
                    <span>Basic Templates</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400">✓</span>
                    <span>10GB Storage</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400">✓</span>
                    <span>Email Support</span>
                  </li>
                </ul>
                {selectedPlan === 'basic' && (
                  <div className="text-yellow-400 font-bold text-center py-2">✓ SELECTED</div>
                )}
              </div>

              <div
                onClick={() => setSelectedPlan('pro')}
                className={`cursor-pointer bg-purple-800/30 backdrop-blur-sm border-2 p-8 rounded-2xl transition-all transform scale-105 ${selectedPlan === 'pro' ? 'border-yellow-400 shadow-lg shadow-yellow-400/50' : 'border-purple-400'}`}
              >
                <div className="bg-purple-600 text-white text-xs font-bold py-1 px-3 rounded-full inline-block mb-3">POPULAR</div>
                <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
                <p className="text-4xl font-black text-purple-300 mb-6">$20<span className="text-lg">/mo</span></p>
                <ul className="space-y-3 text-white mb-8">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400">✓</span>
                    <span>4K Export</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400">✓</span>
                    <span>300 AI Tools</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400">✓</span>
                    <span>Premium Templates</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400">✓</span>
                    <span>100GB Storage</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400">✓</span>
                    <span>Priority Support</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400">✓</span>
                    <span>Commercial License</span>
                  </li>
                </ul>
                {selectedPlan === 'pro' && (
                  <div className="text-yellow-400 font-bold text-center py-2">✓ SELECTED</div>
                )}
              </div>

              <div
                onClick={() => setSelectedPlan('studio')}
                className={`cursor-pointer bg-purple-900/30 backdrop-blur-sm border-2 p-8 rounded-2xl transition-all hover:scale-105 ${selectedPlan === 'studio' ? 'border-yellow-400 shadow-lg shadow-yellow-400/50' : 'border-purple-500'}`}
              >
                <h3 className="text-2xl font-bold text-white mb-2">Studio</h3>
                <p className="text-4xl font-black text-purple-300 mb-6">$30<span className="text-lg">/mo</span></p>
                <ul className="space-y-3 text-white mb-8">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400">✓</span>
                    <span>8K Export</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400">✓</span>
                    <span>All 600 AI Tools</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400">✓</span>
                    <span>Unlimited Templates</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400">✓</span>
                    <span>1TB Storage</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400">✓</span>
                    <span>24/7 Live Support</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400">✓</span>
                    <span>Full Commercial Rights</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400">✓</span>
                    <span>Team Collaboration</span>
                  </li>
                </ul>
                {selectedPlan === 'studio' && (
                  <div className="text-yellow-400 font-bold text-center py-2">✓ SELECTED</div>
                )}
              </div>
            </div>

            <div className="text-center mt-10">
              <button
                onClick={() => handlePlanSelect(selectedPlan, selectedPlan === 'basic' ? 10 : selectedPlan === 'pro' ? 20 : 30)}
                disabled={checkoutLoading}
                className="px-12 py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white text-lg font-bold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-3 mx-auto"
              >
                {checkoutLoading && <Loader className="w-6 h-6 animate-spin" />}
                {checkoutLoading ? 'Redirecting to payment...' : 'Continue to Payment'}
              </button>
              <p className="text-gray-400 text-sm mt-4">
                Secure payment powered by Stripe
              </p>
            </div>
          </div>
        </div>

        <footer className="border-t-2 border-purple-500 pt-6 mt-8">
          <p className="text-white text-sm text-center">
            MandaStrong1 2025 ~ Author Of Doxy The School Bully ~ Also Find Me On MandaStrong1.Etsy.com
          </p>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col px-4 py-8">
      <button
        onClick={() => navigate('/intro')}
        className="fixed top-8 left-8 z-20 flex items-center gap-2 px-6 py-3 bg-purple-900/30 hover:bg-purple-800/40 backdrop-blur-md border border-purple-600/50 text-white font-bold rounded-xl transition-all"
      >
        <ArrowLeft className="w-5 h-5" />
        Back
      </button>

      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-6xl w-full">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-black text-white mb-4">Welcome to MandaStrong Studio</h2>
            <p className="text-xl text-purple-400">Login or create your account to start creating</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-purple-900/30 backdrop-blur-sm border-2 border-purple-500 text-white p-10 rounded-2xl">
              <h3 className="text-3xl font-bold mb-8 text-center">Login</h3>
              {loginError && (
                <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl">
                  <p className="text-red-400">{loginError}</p>
                </div>
              )}
              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-purple-300">Email</label>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full px-5 py-4 bg-black/50 border border-purple-400 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-300 transition-colors"
                    placeholder="your@email.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-purple-300">Password</label>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full px-5 py-4 bg-black/50 border border-purple-400 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-300 transition-colors"
                    placeholder="••••••••"
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

            <div className="bg-purple-900/30 backdrop-blur-sm border-2 border-purple-500 text-white p-10 rounded-2xl">
              <h3 className="text-3xl font-bold mb-8 text-center">Register</h3>
              {registerError && (
                <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl">
                  <p className="text-red-400">{registerError}</p>
                </div>
              )}
              <form onSubmit={handleRegister} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-purple-300">Name</label>
                  <input
                    type="text"
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    className="w-full px-5 py-4 bg-black/50 border border-purple-400 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-300 transition-colors"
                    placeholder="Your Name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-purple-300">Email</label>
                  <input
                    type="email"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    className="w-full px-5 py-4 bg-black/50 border border-purple-400 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-300 transition-colors"
                    placeholder="your@email.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-purple-300">Password</label>
                  <input
                    type="password"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    className="w-full px-5 py-4 bg-black/50 border border-purple-400 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-300 transition-colors"
                    placeholder="••••••••"
                    required
                    minLength={6}
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

      <footer className="border-t-2 border-purple-500 pt-6 mt-8">
        <p className="text-white text-sm text-center">
          MandaStrong1 2025 ~ Author Of Doxy The School Bully ~ Also Find Me On MandaStrong1.Etsy.com
        </p>
      </footer>
    </div>
  );
}
