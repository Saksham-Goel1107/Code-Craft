import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <Link
          href="/"
          className="inline-flex items-center mb-8 text-sm hover:opacity-80 transition"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          Back to Home
        </Link>

        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>

        <div className="space-y-8 text-lg leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Agreement to Terms</h2>
            <p>
              By accessing our website, you agree to be bound by these Terms of
              Service and all applicable laws and regulations. If you do not agree
              with any of these terms, you are prohibited from using or accessing
              this site.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Use License</h2>
            <p>Permission is granted to temporarily use our service for:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Personal, non-commercial use</li>
              <li>Educational purposes</li>
              <li>Code compilation and execution</li>
              <li>Sharing code snippets</li>
            </ul>
            <p className="mt-4">This license shall automatically terminate if you violate any of these restrictions.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
            <p>When creating an account, you agree to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your account</li>
              <li>Accept responsibility for all activities under your account</li>
              <li>Not share your account credentials</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Service Rules</h2>
            <p>You agree not to use the service to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Execute malicious or harmful code</li>
              <li>Violate any laws or regulations</li>
              <li>Infringe upon others&apos; intellectual property rights</li>
              <li>Share inappropriate or offensive content</li>
              <li>Attempt to breach our security measures</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Premium Services</h2>
            <p>
              Some features of our service require a paid subscription. By
              purchasing a premium plan, you agree to:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Provide valid payment information</li>
              <li>Pay all charges at the prices in effect</li>
              <li>Accept our refund and cancellation policies</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Disclaimer</h2>
            <p>
              Our service is provided &quot;as is&quot; without any warranties, expressed
              or implied. We do not guarantee that the service will be
              uninterrupted, secure, or error-free.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Limitation of Liability</h2>
            <p>
              We shall not be liable for any indirect, incidental, special,
              consequential, or punitive damages resulting from your use of our
              service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. We will
              notify users of any material changes via email or through our
              website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Contact Information</h2>
            <p>
              For any questions regarding these terms, please contact us at:{" "}
              <a href="mailto:sakshamgoel1107@gmail.com" className="text-blue-500 hover:underline">
                sakshamgoel1107@gmail.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
