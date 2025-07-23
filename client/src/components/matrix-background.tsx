import { useEffect, useRef } from "react";

export default function MatrixBackground() {
  const backgroundRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const createMatrixBackground = () => {
      if (!backgroundRef.current) return;

      const container = backgroundRef.current;
      container.innerHTML = ""; // Clear existing columns
      
      const columns = Math.floor(window.innerWidth / 20);
      
      for (let i = 0; i < columns; i++) {
        const column = document.createElement("div");
        column.className = "matrix-column";
        column.style.left = i * 20 + "px";
        column.style.animationDelay = Math.random() * 5 + "s";
        column.style.animationDuration = (3 + Math.random() * 4) + "s";
        
        let binaryString = "";
        for (let j = 0; j < 80; j++) {
          binaryString += Math.random() > 0.5 ? "1" : "0";
          if (j % 8 === 0) binaryString += "<br>";
        }
        column.innerHTML = binaryString;
        
        container.appendChild(column);
      }
    };

    createMatrixBackground();

    const handleResize = () => {
      createMatrixBackground();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return <div ref={backgroundRef} className="matrix-bg" />;
}
