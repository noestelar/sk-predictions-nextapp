import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
        
        <div className="space-y-6 text-gray-600">
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Introduction</h2>
            <p>This privacy policy describes how SKToxqui Predictions (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) collects, uses, and shares your information when you use our service at https://sk-predictions-nextapp.vercel.app (&quot;the Service&quot;). This policy applies to all users of our service, including those who access it through Facebook.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Information We Collect</h2>
            <p>We collect information that you provide directly to us when you:</p>
            <ul className="list-disc pl-5 mt-2">
              <li>Create an account or log in through Facebook</li>
              <li>Make predictions and participate in our service</li>
              <li>Interact with our Facebook application</li>
              <li>Contact us for support</li>
            </ul>
            <p className="mt-2">When you log in through Facebook, we may receive:</p>
            <ul className="list-disc pl-5 mt-2">
              <li>Your public profile information</li>
              <li>Email address</li>
              <li>Other information you explicitly authorize</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-5 mt-2">
              <li>Provide, maintain, and improve our services</li>
              <li>Process and complete transactions</li>
              <li>Authenticate you through Facebook</li>
              <li>Send you technical notices and support messages</li>
              <li>Communicate with you about our services and updates</li>
              <li>Ensure compliance with Facebook&apos;s Platform Policies</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Information Sharing and Disclosure</h2>
            <p>We do not sell or rent your personal information to third parties. We may share your information in the following circumstances:</p>
            <ul className="list-disc pl-5 mt-2">
              <li>With your explicit consent</li>
              <li>With Facebook, as necessary for the operation of our application</li>
              <li>To comply with legal obligations</li>
              <li>To protect our rights and prevent fraud</li>
              <li>With service providers who assist in our operations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Data Storage and Security</h2>
            <p>We implement appropriate technical and organizational measures to protect your personal information. Your data is stored securely on our servers and we use industry-standard encryption to protect data transmission.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Your Rights and Choices</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-5 mt-2">
              <li>Access your personal information</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Revoke Facebook permissions</li>
              <li>Object to our use of your data</li>
              <li>Opt-out of marketing communications</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Data Retention</h2>
            <p>We retain your information for as long as necessary to provide our services and comply with our legal obligations. You can request deletion of your account and associated data at any time.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Contact Us</h2>
            <p>If you have any questions about this Privacy Policy or our data practices, please contact us at:</p>
            <p className="mt-2">Email: sktoxqui@gmail.com</p>
            <p>Website: https://sk-predictions-nextapp.vercel.app</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Changes to This Policy</h2>
            <p>We may update this privacy policy from time to time. We will notify you of any material changes by posting the new privacy policy on this page and updating the &quot;Last Updated&quot; date.</p>
            <p className="mt-2">Last updated: {new Date().toLocaleDateString()}</p>
          </section>
        </div>
      </div>
    </div>
  );
} 