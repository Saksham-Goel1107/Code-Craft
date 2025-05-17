"use client";

import CodeBlock from "./CodeBlock";

function CommentContent({ content }: { content: string }) {
  // Enhanced regex to better detect code blocks in various formats
  const parts = content.split(/(```[\w-]*\n[\s\S]*?\n```)/g);
  
  // Extended language mapping for better language support
  const languageMap: {[key: string]: string} = {
    'js': 'javascript',
    'ts': 'typescript',
    'py': 'python',
    'rb': 'ruby',
    'go': 'go',
    'rs': 'rust',
    'java': 'java',
    'kt': 'kotlin',
    'c': 'c',
    'cpp': 'cpp',
    'c++': 'cpp',
    'cs': 'csharp',
    'php': 'php',
    'sh': 'bash',
    'yml': 'yaml',
    'yaml': 'yaml',
    'json': 'json',
    'md': 'markdown',
    'html': 'html',
    'css': 'css',
    'sass': 'sass',
    'scss': 'scss',
    'sql': 'sql',
    'jsx': 'javascript',
    'tsx': 'typescript',
    'xml': 'xml',
    'dockerfile': 'dockerfile',
    'docker': 'dockerfile',
    'swift': 'swift',
    'dart': 'dart',
    'r': 'r',
    'lua': 'lua',
    'perl': 'perl',
  };

  return (
    <div className="max-w-none text-white">
      {parts.map((part, index) => {
        if (part.startsWith("```")) {
          // Extract language and code - support both ```js and ```javascript formats
          const match = part.match(/```([\w-]*)\n([\s\S]*?)\n```/);

          if (match) {
            const [, lang, code] = match;
            // Normalize language name
            const language = lang?.toLowerCase() || 'plaintext';
            // Use the extended language map
            const normalizedLanguage = languageMap[language] || language;
            
            const trimmedCode = code.trim();
            return (
              <div key={`code-${index}`} className="my-4">
                <CodeBlock 
                  language={normalizedLanguage} 
                  code={trimmedCode}
                />
              </div>
            );
          }
        }

        return part.split("\n").map((line, lineIdx) => (
          <p key={`text-${index}-${lineIdx}`} className="mb-4 text-gray-300 last:mb-0">
            {line}
          </p>
        ));
      })}
    </div>
  );
}

export default CommentContent;
