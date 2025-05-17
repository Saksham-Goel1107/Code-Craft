"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Code } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const router = useRouter();
  
  // Track mouse position for 3D effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      
      setMousePosition({ x, y });
    };
    
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);
  
  // Floating animation for code elements
  const codeElements = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 20 + 10,
    speed: Math.random() * 2 + 0.5,
    direction: Math.random() > 0.5 ? 1 : -1,
  }));
  
  return (
    <main 
      ref={containerRef}
      className="relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-gray-950 overflow-hidden"
    >
      {/* Floating code symbols */}
      {codeElements.map((element) => (
        <div
          key={element.id}
          className="absolute text-blue-500/20 animate-float"
          style={{
            left: `${element.x}%`,
            top: `${element.y}%`,
            fontSize: `${element.size}px`,
            animation: `float ${element.speed}s infinite ${element.direction > 0 ? 'alternate' : 'alternate-reverse'} ease-in-out`,
          }}
        >
          <Code size={element.size} />
        </div>
      ))}
      
      {/* Main 3D card */}
      <div 
        className="z-10 bg-gray-800/50 backdrop-blur-lg p-12 rounded-2xl shadow-2xl border border-gray-700/50 max-w-lg w-full text-center transition-transform duration-200 ease-out"
        style={{
          transform: `perspective(1000px) rotateX(${mousePosition.y * -5}deg) rotateY(${mousePosition.x * 5}deg)`,
        }}
      >
        <div className="relative">
          {/* Glowing 404 text */}
          <h1 className="text-8xl font-bold mb-6 text-white relative inline-block">
            <span className="absolute inset-0 text-blue-500 blur-[20px] animate-pulse">404</span>
            404
          </h1>
          
          {/* Animated underline */}
          <div className="h-1 w-0 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mb-8 animate-expand"></div>
          
          <h2 className="text-2xl font-semibold mb-4 text-gray-200">Page Not Found</h2>
          <p className="text-gray-400 mb-8">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 perspective-1000">
  {/* Go Back Button */}
  <button
    onClick={() => router.back()}
    className="group relative inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-lg shadow-lg transition-transform duration-300 ease-out transform hover:-translate-y-1 hover:shadow-2xl active:translate-y-1 active:shadow-md"
  >
    <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 rounded-lg transition duration-300 pointer-events-none"></span>
    <ArrowLeft size={16} />
    Go Back
  </button>

  {/* Return Home Link */}
  <Link
    href="/"
    className="group relative inline-flex items-center px-6 py-3 bg-slate-800 text-white font-semibold rounded-lg shadow-lg transition-transform duration-300 ease-out transform hover:-translate-y-1 hover:bg-cyan-700 hover:shadow-2xl active:translate-y-1 active:shadow-md"
  >
    <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 rounded-lg transition duration-300 pointer-events-none"></span>
    Return Home
  </Link>
</div>

        </div>
      </div>
      
      {/* Background gradient */}
      <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-blue-500/10 to-transparent"></div>
    </main>
  );
}