import Link from "next/link";
import { ArrowLeft, Book, Code2, Cpu, Share2, Blocks, Zap, Settings, PenTool } from "lucide-react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";

const pythonExample = `def fibonacci(n):
    if n <= 1:
        return n
    else:
        return fibonacci(n-1) + fibonacci(n-2)

# Test the function
print(fibonacci(10))`;

const javascriptExample = `const calculateFactorial = (n) => {
  if (n === 0) return 1;
  return n * calculateFactorial(n - 1);
};

console.log(calculateFactorial(5));`;

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Sidebar */}
      <nav className="fixed top-0 left-0 h-full w-64 bg-gray-900/50 backdrop-blur-sm border-r border-gray-800 p-6 hidden lg:block">
        <div className="flex items-center gap-2 mb-8">
          <Book className="h-6 w-6 text-blue-500" />
          <span className="text-lg font-semibold text-white">Documentation</span>
        </div>
        <div className="space-y-2">
          {sections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="block px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors"
            >
              {section.title}
            </a>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <div className="lg:pl-64">
        <div className="container mx-auto px-4 py-16 max-w-4xl">
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
              Documentation
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Everything you need to know about using our online code editor and compiler.
            </p>
          </div>

          {/* Documentation Sections */}
          <div className="space-y-16">
            {sections.map((section) => (
              <section key={section.id} id={section.id} className="scroll-mt-16">
                <div className="flex items-center gap-3 mb-6">
                  <div className="inline-flex rounded-lg bg-blue-500/10 p-2">
                    {section.icon}
                  </div>
                  <h2 className="text-3xl font-bold text-white">{section.title}</h2>
                </div>
                <div className="prose prose-invert max-w-none">
                  {section.content}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const sections = [
  {
    id: "getting-started",
    title: "Getting Started",
    icon: <Blocks className="h-6 w-6 text-blue-500" />,
    content: (
      <div className="space-y-6">
        <p>
          Welcome to our online code editor! This platform allows you to write,
          compile, and run code in multiple programming languages directly in your
          browser.
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
            <h3 className="text-lg font-semibold mb-2">1. Choose a Language</h3>
            <p className="text-gray-400">
              Select your preferred programming language from our wide range of
              supported options.
            </p>
          </div>
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
            <h3 className="text-lg font-semibold mb-2">2. Write Code</h3>
            <p className="text-gray-400">
              Use our feature-rich editor with syntax highlighting and
              auto-completion.
            </p>
          </div>
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
            <h3 className="text-lg font-semibold mb-2">3. Run & Test</h3>
            <p className="text-gray-400">
              Execute your code and see the output in real-time with our built-in
              compiler.
            </p>
          </div>
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
            <h3 className="text-lg font-semibold mb-2">4. Share & Collaborate</h3>
            <p className="text-gray-400">
              Share your code snippets with others and collaborate in real-time.
            </p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "code-editor",
    title: "Code Editor Features",
    icon: <Code2 className="h-6 w-6 text-blue-500" />,
    content: (
      <div className="space-y-6">
        <p>
          Our code editor comes packed with features to enhance your coding
          experience:
        </p>
        <ul className="space-y-4">
          <li className="flex items-start gap-3">
            <div className="rounded-full bg-blue-500/10 p-1">
              <PenTool className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Syntax Highlighting</h3>
              <p className="text-gray-400">
                Automatic language detection and beautiful syntax highlighting for
                better code readability.
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <div className="rounded-full bg-blue-500/10 p-1">
              <Settings className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Auto-Completion</h3>
              <p className="text-gray-400">
                Smart suggestions and auto-completion for faster coding.
              </p>
            </div>
          </li>
        </ul>
      </div>
    ),
  },
  {
    id: "examples",
    title: "Code Examples",
    icon: <Cpu className="h-6 w-6 text-blue-500" />,
    content: (
      <div className="space-y-6">
        <p>Here are some example code snippets you can try:</p>
        
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Python Example (Fibonacci)</h3>
          <div className="rounded-lg overflow-hidden">
            <SyntaxHighlighter
              language="python"
              style={atomOneDark}
              customStyle={{
                padding: "1.5rem",
                borderRadius: "0.5rem",
                margin: 0,
              }}
            >
              {pythonExample}
            </SyntaxHighlighter>
          </div>

          <h3 className="text-xl font-semibold mt-8">JavaScript Example (Factorial)</h3>
          <div className="rounded-lg overflow-hidden">
            <SyntaxHighlighter
              language="javascript"
              style={atomOneDark}
              customStyle={{
                padding: "1.5rem",
                borderRadius: "0.5rem",
                margin: 0,
              }}
            >
              {javascriptExample}
            </SyntaxHighlighter>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "sharing",
    title: "Sharing & Collaboration",
    icon: <Share2 className="h-6 w-6 text-blue-500" />,
    content: (
      <div className="space-y-6">
        <p>
          Share your code snippets with others and collaborate in real-time:
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
            <h3 className="text-lg font-semibold mb-2">Share Code</h3>
            <p className="text-gray-400">
              Generate a unique link to share your code with anyone. They can view,
              run, and even fork your code.
            </p>
          </div>
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
            <h3 className="text-lg font-semibold mb-2">Real-time Collaboration</h3>
            <p className="text-gray-400">
              Work together with team members in real-time with our collaborative
              editing features.
            </p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "pro-features",
    title: "Pro Features",
    icon: <Zap className="h-6 w-6 text-blue-500" />,
    content: (
      <div className="space-y-6">
        <p>
          Upgrade to Pro to unlock additional features and capabilities:
        </p>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
            <h3 className="text-lg font-semibold mb-2">Extended Runtime</h3>
            <p className="text-gray-400">
              Longer execution time limits for complex computations.
            </p>
          </div>
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
            <h3 className="text-lg font-semibold mb-2">Priority Execution</h3>
            <p className="text-gray-400">
              Your code runs first in our compilation queue.
            </p>
          </div>
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
            <h3 className="text-lg font-semibold mb-2">Advanced Features</h3>
            <p className="text-gray-400">
              Access to AI assistance and additional development tools.
            </p>
          </div>
        </div>
      </div>
    ),
  },
];
