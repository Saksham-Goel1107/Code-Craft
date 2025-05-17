"use client";

// A utility function to get language display name from code identifier
export function getLanguageDisplayName(language: string): string {
  if (!language) return "plaintext";
  
  const languageMap: Record<string, string> = {
    'js': 'JavaScript',
    'javascript': 'JavaScript',
    'jsx': 'JavaScript (JSX)',
    'ts': 'TypeScript',
    'typescript': 'TypeScript',
    'tsx': 'TypeScript (TSX)',
    'py': 'Python',
    'python': 'Python',
    'rb': 'Ruby',
    'ruby': 'Ruby',
    'go': 'Go',
    'rust': 'Rust',
    'rs': 'Rust',
    'java': 'Java',
    'kt': 'Kotlin',
    'kotlin': 'Kotlin',
    'c': 'C',
    'cpp': 'C++',
    'c++': 'C++',
    'cs': 'C#',
    'csharp': 'C#',
    'php': 'PHP',
    'sh': 'Shell',
    'bash': 'Bash',
    'yml': 'YAML',
    'yaml': 'YAML',
    'json': 'JSON',
    'md': 'Markdown',
    'markdown': 'Markdown',
    'html': 'HTML',
    'css': 'CSS',
    'sass': 'Sass',
    'scss': 'SCSS',
    'sql': 'SQL',
    'xml': 'XML',
    'dockerfile': 'Dockerfile',
    'docker': 'Dockerfile',
    'swift': 'Swift',
    'dart': 'Dart',
    'r': 'R',
    'lua': 'Lua',
    'perl': 'Perl',
    'plaintext': 'Plaintext',
  };
  
  return languageMap[language.toLowerCase()] || language;
}

// Get color theme for a language
export function getLanguageColor(language: string): string {
  if (!language) return "text-gray-400";
  
  const languageColors: Record<string, string> = {
    'javascript': 'text-yellow-400',
    'js': 'text-yellow-400',
    'jsx': 'text-yellow-400',
    'typescript': 'text-blue-400',
    'ts': 'text-blue-400',
    'tsx': 'text-blue-400',
    'python': 'text-green-400',
    'py': 'text-green-400',
    'ruby': 'text-red-400',
    'rb': 'text-red-400',
    'go': 'text-blue-300',
    'rust': 'text-orange-400',
    'rs': 'text-orange-400',
    'java': 'text-orange-400',
    'kotlin': 'text-purple-400',
    'kt': 'text-purple-400',
    'c': 'text-blue-500',
    'cpp': 'text-blue-500',
    'c++': 'text-blue-500',
    'csharp': 'text-purple-500',
    'cs': 'text-purple-500',
    'php': 'text-indigo-400',
    'bash': 'text-green-500',
    'sh': 'text-green-500',
    'yaml': 'text-yellow-500',
    'yml': 'text-yellow-500',
    'json': 'text-yellow-500',
    'markdown': 'text-gray-400',
    'md': 'text-gray-400',
    'html': 'text-orange-500',
    'css': 'text-pink-400',
    'sass': 'text-pink-500',
    'scss': 'text-pink-400',
    'sql': 'text-blue-400',
    'xml': 'text-orange-400',
    'dockerfile': 'text-blue-300',
    'docker': 'text-blue-300',
    'swift': 'text-orange-500',
    'dart': 'text-blue-400',
    'r': 'text-blue-500',
    'lua': 'text-blue-400',
    'perl': 'text-purple-400',
  };
  
  return languageColors[language.toLowerCase()] || "text-gray-400";
}

// Check if a language has syntax highlighting support
export function hasHighlightSupport(language: string): boolean {
  if (!language) return false;

  const supportedLanguages = [
    'javascript', 'js', 'jsx', 'typescript', 'ts', 'tsx',
    'python', 'py', 'ruby', 'rb', 'go', 'rust', 'rs',
    'java', 'kotlin', 'kt', 'c', 'cpp', 'c++', 'csharp', 'cs',
    'php', 'bash', 'sh', 'yaml', 'yml', 'json', 'markdown', 'md',
    'html', 'css', 'sass', 'scss', 'sql', 'xml', 'dockerfile',
    'docker', 'swift', 'dart', 'r', 'lua', 'perl'
  ];

  return supportedLanguages.includes(language.toLowerCase());
}
