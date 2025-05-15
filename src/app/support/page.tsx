import Link from "next/link";
import { Mail, MessageCircle, Book, ArrowLeft, Github } from "lucide-react";

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="relative isolate overflow-hidden">
        {/* Background gradient */}
        <div 
          className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-gray-900 to-transparent" 
          aria-hidden="true"
        />
        
        <div className="container mx-auto px-4 py-16">
          {/* Back button */}
          <Link
            href="/"
            className="inline-flex items-center text-sm text-gray-400 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>

          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600 mb-4">
              How Can We Help?
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Get the help you need with our comprehensive support resources and direct assistance options.
            </p>
          </div>

          {/* Contact Options Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {/* Email Support Card */}
            <div className="group relative rounded-2xl border border-gray-800 bg-gray-900/50 p-6 backdrop-blur-sm transition-all hover:border-gray-700 hover:bg-gray-900/75">
              <div className="relative z-10">
                <div className="mb-4 inline-flex rounded-lg bg-blue-500/10 p-2">
                  <Mail className="h-6 w-6 text-blue-500" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-white">Email Support</h3>
                <p className="mb-4 text-gray-400">
                  Get in touch with our support team directly through email.
                </p>
                <a
                  href="mailto:sakshamgoel107@gmail.com"
                  className="inline-flex items-center text-blue-500 hover:text-blue-400 transition-colors"
                >
                  Send us an email
                  <svg
                    className="ml-2 h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </a>
              </div>
            </div>

            {/* Community Support Card */}
            <div className="group relative rounded-2xl border border-gray-800 bg-gray-900/50 p-6 backdrop-blur-sm transition-all hover:border-gray-700 hover:bg-gray-900/75">
              <div className="relative z-10">
                <div className="mb-4 inline-flex rounded-lg bg-purple-500/10 p-2">
                  <MessageCircle className="h-6 w-6 text-purple-500" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-white">Community</h3>
                <p className="mb-4 text-gray-400">
                  Join our Discord community for real-time support and discussions.
                </p>
                <a
                  href="https://discord.gg/codecraft"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-purple-500 hover:text-purple-400 transition-colors"
                >
                  Join Discord
                  <svg
                    className="ml-2 h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </a>
              </div>
            </div>

            {/* GitHub Issues Card */}
            <div className="group relative rounded-2xl border border-gray-800 bg-gray-900/50 p-6 backdrop-blur-sm transition-all hover:border-gray-700 hover:bg-gray-900/75">
              <div className="relative z-10">
                <div className="mb-4 inline-flex rounded-lg bg-green-500/10 p-2">
                  <Github className="h-6 w-6 text-green-500" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-white">Bug Reports</h3>
                <p className="mb-4 text-gray-400">
                  Found a bug? Report it on our GitHub repository.
                </p>
                <a
                  href="https://github.com/codecraft/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-green-500 hover:text-green-400 transition-colors"
                >
                  Open an issue
                  <svg
                    className="ml-2 h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-white mb-8">Frequently Asked Questions</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-gray-800 bg-gray-900/50 p-6 backdrop-blur-sm"
                >
                  <h3 className="text-lg font-semibold text-white mb-2">{faq.question}</h3>
                  <p className="text-gray-400">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Documentation Section */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Need More Help?</h2>
            <p className="text-gray-400 mb-6">
              Check out our comprehensive documentation for detailed guides and tutorials.
            </p>
            <a              href="/docs"
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700 transition-colors group"
            >
              <Book className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
              View Documentation
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

const faqs = [
  {
    question: "How do I upgrade to Pro?",
    answer: "Visit our pricing page and click on the 'Upgrade to Pro' button. Follow the simple checkout process to upgrade your account.",
  },
  {
    question: "What programming languages are supported?",
    answer: "We support a wide range of languages including Python, JavaScript, TypeScript, Java, C++, Ruby, and more. Check our documentation for the full list.",
  },
  {
    question: "Can I share my code snippets?",
    answer: "Yes! You can easily share your code snippets by clicking the 'Share' button in the editor. You'll get a unique link to share with others.",
  },
  {
    question: "How do I reset my password?",
    answer: "Click on the 'Forgot Password' link on the login page. You'll receive an email with instructions to reset your password.",
  },
  {
    question: "Is there a limit on code execution time?",
    answer: "Free accounts have a 10-second execution limit. Pro accounts enjoy extended limits and priority execution.",
  },
  {
    question: "Do you offer student discounts?",
    answer: "Yes! Students can get 50% off Pro accounts. Contact our support team with your student email for verification.",
  },
];
