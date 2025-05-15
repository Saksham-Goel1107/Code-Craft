import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { getChat, setChat } from "@/utils/redis";
import { generateImage } from "@/utils/imageGeneration";
import { v4 as uuidv4 } from 'uuid';

const apiKey = process.env.GEMINI_API_KEY;
console.log('API Key length:', apiKey?.length || 0); 
if (!apiKey) {
  throw new Error('GEMINI_API_KEY is not properly configured in environment variables. Please check your .env.local file.');
}
if (typeof apiKey !== 'string' || apiKey.trim() === '') {
  throw new Error('GEMINI_API_KEY is empty or invalid');
}
const genAI = new GoogleGenerativeAI(apiKey);

const SYSTEM_CONTEXT = `You are an AI assistant for Code Craft, a modern online code editor and compiler platform. Code Craft allows developers to write, compile, and share code with support for multiple programming languages, AI assistance, and real-time collaboration.

Key Features:
• Multi-Language Support
  - Python, JavaScript, TypeScript
  - Java, C++, Ruby, Go
  - C#, Swift, Rust
  - Real-time syntax highlighting
  - Language-specific autocompletion

• Code Execution Environment
  - Secure sandboxed execution
  - Multiple runtime environments
  - Real-time output display
  - Error handling and debugging
  - Memory usage monitoring
  - Execution time tracking

• Intelligent Features
  - AI-powered code assistance
  - Code suggestions and completion
  - Natural language explanations
  - Image generation with @image command
  - Voice commands support
  - Smart error detection

• Code Sharing & Collaboration
  - Instant code snippet sharing
  - Unique shareable links
  - Code comments and discussions
  - Version history tracking
  - Star favorite snippets
  - Public/private code options

• Modern Development Experience
  - VS Code-like interface
  - Multiple themes support
  - Customizable editor settings
  - Keyboard shortcuts
  - Responsive design
  - Real-time preview

Technical Stack:
• Frontend: Next.js 14+ with App Router
• Authentication: Clerk
• Database: Convex
• Code Execution: Secure containers
• Editor: Monaco Editor
• AI: Google Gemini
• Real-time: WebSocket
• UI: Tailwind CSS

Pro Features:
• Extended runtime limits
• Priority code execution
• Advanced AI features
• Private snippets
• Custom themes
• API access

I can help users with:
1. Code Execution
   - Writing and running code
   - Debugging errors
   - Understanding output
   - Memory optimization
   - Runtime configuration

2. Editor Usage
   - Code formatting
   - Theme selection
   - Keyboard shortcuts
   - Language features
   - Editor customization

3. Code Sharing
   - Creating shareable links
   - Managing permissions
   - Collaborating with others
   - Version control
   - Code organization

4. AI Assistance
   - Code explanations
   - Best practices
   - Bug fixing suggestions
   - Image generation
   - Voice commands

5. Technical Support
   - Language-specific help
   - Editor features
   - Account management
   - Performance tips
   - API usage

Response Formatting:
• Use clear headings for sections
• Include bullet points (•) for lists
• Use proper indentation
• Add line breaks between sections
• Highlight important code or terms
• Include code examples when relevant
• Keep responses concise and technical
• Use proper spacing after punctuation
• Start new points on new lines
• Format code blocks with proper syntax

Keep responses focused on helping users write, execute, and share code effectively.`;

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  imageUrl?: string;
}

export async function POST(req: NextRequest) {
  try {
    const { message, sessionId = uuidv4() } = await req.json();
    
    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const history = await getChat(sessionId) as ChatMessage[];

    // Check for image generation command
    if (message.toLowerCase().startsWith('@image ')) {
      try {
        const imagePrompt = message.slice(7); // Remove '@image '
        const imageUrl = await generateImage(imagePrompt);
        const responseText = `🎨 Generated image for prompt: "${imagePrompt}"`;
        
        const updatedHistory = [
          ...history,
          { role: 'user', content: message },
          { role: 'assistant', content: responseText, imageUrl }
        ];
        await setChat(sessionId, updatedHistory);

        return NextResponse.json({ 
          response: responseText,
          imageUrl,
          timestamp: new Date().toISOString(),
          sessionId
        });
      } catch (error) {
        console.error('Image generation error:', error);
        return NextResponse.json(
          { error: "Failed to generate image. Please try again." },
          { status: 500 }
        );
      }
    }

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash",
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 1000,
      }    });   

    const conversationContext: string = history.length > 0 
      ? history.map((msg: ChatMessage) => `${msg.role}: ${msg.content}`).join('\n\n')
      : '';
    
    // Create a chat with history
    const chat = model.startChat({
      history: [],
      generationConfig: {
        maxOutputTokens: 1000,
      },
    });

    const result = await chat.sendMessage(`${SYSTEM_CONTEXT}\n\n${conversationContext}\n\nUser: ${message}`);
    const response = await result.response;
    let responseText = response.text();
    if (!responseText) {
      return NextResponse.json(
        { error: "No response generated. Please try again." },
        { status: 500 }
      );
    }    responseText = responseText
      .replace(/\n{3,}/g, '\n\n')
      .replace(/([.!?])\s*(\w)/g, '$1 $2')
      
      .replace(/^[-*]\s/gm, '• ')
      .replace(/^\t[-*]\s/gm, '    • ') 
      .replace(/^\d+\.\s/gm, (match) => match.trim() + ' ')
      
      .replace(/\*\*(.*?)\*\*/g, (_, text) => `**${text.trim()}**`) 
      .replace(/\*(.*?)\*/g, (_, text) => `*${text.trim()}*`)       
      .replace(/`(.*?)`/g, (_, text) => `\`${text.trim()}\``)       
      .replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang: string | undefined, code: string) => {
        const formattedCode = code.split('\n')
          .map((line: string) => line.trim())
          .join('\n    '); 
        return `\`\`\`${lang || ''}\n    ${formattedCode}\n\`\`\``;
      })
      
      .replace(/^(•|\d+\.)\s*/gm, '$1 ')
      
      .replace(/^(\s{2,})/gm, '    ')
      
      .trim();

    const updatedHistory = [
      ...history,
      { role: 'user', content: message },
      { role: 'assistant', content: responseText }
    ];
    await setChat(sessionId, updatedHistory);

    return NextResponse.json({ 
      response: responseText,
      timestamp: new Date().toISOString(),
      sessionId
    });} catch (err) {
  const error = err as Error; // cast to Error type

  console.error('AI Chat Error:', error);

  if (error.message?.includes('API_KEY_INVALID') || error.message?.includes('API key not valid')) {
    return NextResponse.json(
      { error: "Invalid API configuration. Please contact the administrator." },
      { status: 500 }
    );
  }

    return NextResponse.json(
      { error: "Failed to generate response, please try again later." },
      { status: 500 }
    );
  }
}
