import { useEffect, useState } from "react";

export default function LoadingScreen() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="loading-screen animate-fadeIn">
      <div className="text-center">
        <div className="text-6xl mb-4">👑</div>
        <h1 className="text-2xl font-mono mb-4 glow-text" style={{ color: "var(--matrix-green)" }}>
          Loading your kingdom...
        </h1>
        <div className="flex space-x-2 justify-center">
          <div 
            className="w-3 h-3 rounded-full animate-bounce" 
            style={{ backgroundColor: "var(--matrix-green)", animationDelay: "0s" }}
          ></div>
          <div 
            className="w-3 h-3 rounded-full animate-bounce" 
            style={{ backgroundColor: "var(--matrix-green)", animationDelay: "0.1s" }}
          ></div>
          <div 
            className="w-3 h-3 rounded-full animate-bounce" 
            style={{ backgroundColor: "var(--matrix-green)", animationDelay: "0.2s" }}
          ></div>
        </div>
      </div>
    </div>
  );
}
