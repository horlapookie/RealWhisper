import { useEffect, useRef } from "react";

export default function ChatBinaryBackground() {
  const backgroundRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const createChatBinaryBackground = () => {
      if (!backgroundRef.current) return;

      const container = backgroundRef.current;
      container.innerHTML = ""; // Clear existing columns
      
      const columns = Math.floor(window.innerWidth / 25);
      
      for (let i = 0; i < columns; i++) {
        const column = document.createElement("div");
        column.className = "chat-binary-column";
        column.style.left = i * 25 + "px";
        column.style.animationDelay = Math.random() * 8 + "s";
        column.style.animationDuration = (10 + Math.random() * 6) + "s";
        
        let binaryString = "";
        for (let j = 0; j < 60; j++) {
          binaryString += Math.random() > 0.5 ? "1" : "0";
          if (j % 6 === 0) binaryString += "<br>";
        }
        column.innerHTML = binaryString;
        
        container.appendChild(column);
      }
    };

    createChatBinaryBackground();

    const handleResize = () => {
      createChatBinaryBackground();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return <div ref={backgroundRef} className="chat-binary-bg" />;
}