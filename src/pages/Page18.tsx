import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, FileText, Shield, AlertCircle, Scale, Copyright } from 'lucide-react';
import { useState } from 'react';

export default function Page18() {
  const navigate = useNavigate();
  const [accepted, setAccepted] = useState(false);

  const handleAccept = () => {
    setAccepted(true);
    setTimeout(() => {
      navigate('/templates');
    }, 1000);
  };

  const handleDecline = () => {
    alert('You must accept the Terms of Service to continue using MandaStrong Studio.');
  };

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-5xl mx-auto">
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-6 px-4 py-3 bg-white/5 border border-purple-600/30 rounded-lg">
          <h1 className="text-2xl font-bold text-white">TERMS OF SERVICE & DISCLAIMER</h1>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/marketplace')}
              className="flex items-center gap-2 px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <button
              onClick={() => navigate('/helpdesk')}
              className="flex items-center gap-2 px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-all"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Legal Document Container */}
        <div className="bg-white/5 border border-purple-600/30 rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-purple-800 p-6 text-center">
            <FileText className="w-16 h-16 text-white mx-auto mb-3" />
            <h2 className="text-3xl font-bold text-white mb-2">Legal Agreement</h2>
            <p className="text-white/90">Please read carefully before using MandaStrong Studio</p>
          </div>

          {/* Scrollable Content */}
          <div className="h-[500px] overflow-y-auto p-8 space-y-8">
            {/* Terms of Use */}
            <section>
              <h3 className="text-2xl font-bold text-purple-400 mb-4 flex items-center gap-2">
                <Scale className="w-6 h-6" />
                Terms of Use
              </h3>
              <div className="text-white space-y-3 text-sm leading-relaxed">
                <p>
                  Welcome to MandaStrong Studio. By accessing and using this application, you agree to be bound by these Terms of Service.
                  If you do not agree to these terms, please do not use the application.
                </p>
                <p>
                  <strong className="text-purple-400">1. Acceptance of Terms:</strong> By creating an account or using MandaStrong Studio,
                  you acknowledge that you have read, understood, and agree to be bound by these Terms of Service and our Privacy Policy.
                </p>
                <p>
                  <strong className="text-purple-400">2. License Grant:</strong> We grant you a limited, non-exclusive, non-transferable,
                  revocable license to use MandaStrong Studio for personal or commercial video creation purposes in accordance with these terms.
                </p>
                <p>
                  <strong className="text-purple-400">3. User Responsibilities:</strong> You are responsible for maintaining the security of
                  your account and for all activities that occur under your account. You agree not to use the service for any unlawful purposes.
                </p>
              </div>
            </section>

            {/* Privacy Policy */}
            <section>
              <h3 className="text-2xl font-bold text-purple-400 mb-4 flex items-center gap-2">
                <Shield className="w-6 h-6" />
                Privacy Policy
              </h3>
              <div className="text-white space-y-3 text-sm leading-relaxed">
                <p>
                  <strong className="text-purple-400">Data Collection:</strong> We collect information you provide directly to us, including
                  your name, email address, and any content you create or upload to the platform. We use this information to provide, maintain,
                  and improve our services.
                </p>
                <p>
                  <strong className="text-purple-400">Data Security:</strong> We implement appropriate technical and organizational measures
                  to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
                </p>
                <p>
                  <strong className="text-purple-400">Data Sharing:</strong> We do not sell your personal information to third parties.
                  We may share your information with service providers who assist us in operating our platform, subject to confidentiality agreements.
                </p>
                <p>
                  <strong className="text-purple-400">Your Rights:</strong> You have the right to access, update, or delete your personal
                  information at any time. You may also opt out of marketing communications.
                </p>
              </div>
            </section>

            {/* Content Guidelines */}
            <section>
              <h3 className="text-2xl font-bold text-purple-400 mb-4 flex items-center gap-2">
                <FileText className="w-6 h-6" />
                Content Guidelines
              </h3>
              <div className="text-white space-y-3 text-sm leading-relaxed">
                <p>
                  <strong className="text-purple-400">Prohibited Content:</strong> You may not create, upload, or share content that:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Violates any laws or regulations</li>
                  <li>Infringes on intellectual property rights of others</li>
                  <li>Contains hate speech, harassment, or discriminatory content</li>
                  <li>Depicts violence, illegal activities, or harmful behavior</li>
                  <li>Contains malware, viruses, or malicious code</li>
                </ul>
                <p>
                  <strong className="text-purple-400">Content Ownership:</strong> You retain ownership of content you create using
                  MandaStrong Studio. However, you grant us a license to store, process, and display your content as necessary to provide our services.
                </p>
              </div>
            </section>

            {/* Liability Disclaimer */}
            <section>
              <h3 className="text-2xl font-bold text-purple-400 mb-4 flex items-center gap-2">
                <AlertCircle className="w-6 h-6" />
                Liability Disclaimer
              </h3>
              <div className="text-white space-y-3 text-sm leading-relaxed">
                <p>
                  <strong className="text-purple-400">Service Availability:</strong> MandaStrong Studio is provided "as is" and "as available"
                  without warranties of any kind, either express or implied. We do not guarantee that the service will be uninterrupted, secure,
                  or error-free.
                </p>
                <p>
                  <strong className="text-purple-400">Limitation of Liability:</strong> To the maximum extent permitted by law, MandaStrong Studio
                  shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues,
                  whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses.
                </p>
                <p>
                  <strong className="text-purple-400">User Responsibility:</strong> You are solely responsible for your use of the service and
                  any content you create. We are not responsible for any damages or losses related to your use of MandaStrong Studio.
                </p>
              </div>
            </section>

            {/* Copyright Policy */}
            <section>
              <h3 className="text-2xl font-bold text-purple-400 mb-4 flex items-center gap-2">
                <Copyright className="w-6 h-6" />
                Copyright Policy
              </h3>
              <div className="text-white space-y-3 text-sm leading-relaxed">
                <p>
                  <strong className="text-purple-400">Intellectual Property:</strong> All content, features, and functionality of MandaStrong Studio,
                  including but not limited to software, designs, text, graphics, and logos, are owned by MandaStrong Studio and are protected by
                  international copyright, trademark, and other intellectual property laws.
                </p>
                <p>
                  <strong className="text-purple-400">DMCA Compliance:</strong> We respect the intellectual property rights of others and expect
                  our users to do the same. If you believe that your copyrighted work has been copied in a way that constitutes copyright infringement,
                  please contact us immediately.
                </p>
                <p>
                  <strong className="text-purple-400">License to User Content:</strong> By uploading content to MandaStrong Studio, you grant us
                  a worldwide, non-exclusive, royalty-free license to use, reproduce, and display your content solely for the purpose of operating
                  and improving our services.
                </p>
              </div>
            </section>

            {/* Updates */}
            <section className="border-t border-purple-600/30 pt-6">
              <p className="text-gray-400 text-xs">
                <strong>Last Updated:</strong> December 24, 2025
              </p>
              <p className="text-gray-400 text-xs mt-2">
                We reserve the right to modify these terms at any time. Continued use of the service after changes constitutes acceptance of the modified terms.
              </p>
            </section>
          </div>

          {/* Action Buttons */}
          <div className="bg-black/50 border-t border-purple-600/30 p-6">
            <div className="flex items-center gap-4 mb-4">
              <input
                type="checkbox"
                id="terms-checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="w-5 h-5 cursor-pointer"
              />
              <label htmlFor="terms-checkbox" className="text-white text-sm cursor-pointer">
                I have read and agree to the Terms of Service and Privacy Policy
              </label>
            </div>
            <div className="flex gap-4">
              <button
                onClick={handleAccept}
                disabled={!accepted}
                className={`flex-1 py-4 rounded-lg font-bold text-lg transition-all ${
                  accepted
                    ? 'bg-purple-600 hover:bg-purple-700 text-white cursor-pointer'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
              >
                Accept & Continue
              </button>
              <button
                onClick={handleDecline}
                className="flex-1 py-4 bg-white/10 hover:bg-white/20 rounded-lg text-white font-bold text-lg transition-all"
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
