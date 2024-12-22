import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
        
        <div className="space-y-6 text-gray-600">
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Introduction</h2>
            <p>This privacy policy describes how SKToxqui Predictions ("we", "our", or "us") collects, uses, and shares your information when you use our service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Information We Collect</h2>
            <p>We collect information that you provide directly to us when you:</p>
            <ul className="list-disc pl-5 mt-2">
              <li>Create an account</li>
              <li>Make predictions</li>
              <li>Participate in any interactive features of our service</li>
              <li>Contact us for support</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-5 mt-2">
              <li>Provide, maintain, and improve our services</li>
              <li>Process and complete transactions</li>
              <li>Send you technical notices and support messages</li>
              <li>Communicate with you about products, services, and events</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Information Sharing</h2>
            <p>We do not share your personal information with third parties except:</p>
            <ul className="list-disc pl-5 mt-2">
              <li>With your consent</li>
              <li>To comply with legal obligations</li>
              <li>To protect our rights and prevent fraud</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Data Security</h2>
            <p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-5 mt-2">
              <li>Access your personal information</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Object to our use of your data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us at:</p>
            <p className="mt-2">Email: [Your Contact Email]</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Changes to This Policy</h2>
            <p>We may update this privacy policy from time to time. We will notify you of any changes by posting the new privacy policy on this page.</p>
            <p className="mt-2">Last updated: {new Date().toLocaleDateString()}</p>
          </section>
        </div>
      </div>
    </div>
  );
} 