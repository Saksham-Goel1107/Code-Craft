"use client";

import CodeBlock from "./CodeBlock";

function CommentContent({ content }: { content: string }) {
  // Split content into parts based on code blocks
  const parts = content.split(/(```[\w-]*\n[\s\S]*?\n```)/g);

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
            // Handle common language aliases
            const languageMap: {[key: string]: string} = {
              'js': 'javascript',
              'ts': 'typescript',
              'py': 'python',
            };
            const normalizedLanguage = languageMap[language] || language;
            
            const trimmedCode = code.trim();
            return (
              <div key={`code-${index}`} className="my-4 rounded-lg overflow-hidden">
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
