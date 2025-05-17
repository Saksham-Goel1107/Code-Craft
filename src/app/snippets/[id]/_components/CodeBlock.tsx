import SyntaxHighlighter from "react-syntax-highlighter";
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";
import CopyButton from "./CopyButton";
import { Code } from "lucide-react";
import { useEffect, useState } from "react";
import Image from "next/image";
import { getLanguageColor, getLanguageDisplayName } from "@/utils/languageUtils";

const CodeBlock = ({ language, code }: { language: string; code: string }) => {
  const [iconExists, setIconExists] = useState(true);
  
  const trimmedCode = code
    .split("\n") // split into lines
    .map((line) => line.trimEnd()) // remove trailing spaces from each line
    .join("\n"); // join back into a single string
    
  useEffect(() => {
    // Check if language icon exists
    const img = new window.Image(); // Use window.Image to avoid conflict with Next.js Image component
    img.onerror = () => setIconExists(false);
    img.src = `/${language}.png`;
  }, [language]);

  // Get display name and color for the language
  const displayLanguage = getLanguageDisplayName(language);
  const languageColor = getLanguageColor(language);

  return (
    <div className="my-4 bg-[#0a0a0f] rounded-lg overflow-hidden border border-[#ffffff0a]">
      {/* header bar showing language and copy button */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#ffffff08]">
        {/* language indicator with icon */}
        <div className="flex items-center gap-2">
          {iconExists ? (
            <Image 
              src={`/${language}.png`} 
              alt={language} 
              width={16} 
              height={16}
              className="size-4 object-contain" 
            />
          ) : (
            <Code className={`size-4 ${languageColor}`} />
          )}
          <span className={`text-sm font-medium ${languageColor}`}>{displayLanguage}</span>
        </div>
        {/* button to copy code to clipboard */}
        <CopyButton code={trimmedCode} />
      </div>

      {/* code block with syntax highlighting */}
      <div className="relative">
        <SyntaxHighlighter
          language={language || "plaintext"}
          style={atomOneDark} // dark theme for the code
          customStyle={{
            padding: "1rem",
            background: "transparent",
            margin: 0,
            borderRadius: 0,
            fontSize: "14px",
          }}
          showLineNumbers={true}
          wrapLines={true} // wrap long lines
          lineNumberStyle={{ opacity: 0.4, minWidth: "2.5em" }}
        >
          {trimmedCode}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};


export default CodeBlock;
