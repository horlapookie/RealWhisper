import { useEffect, useState } from "react";

interface FloatingElement {
  id: number;
  left: number;
  animationDelay: number;
  size: number;
}

export default function ModernBackground() {
  const [elements, setElements] = useState<FloatingElement[]>([]);

  useEffect(() => {
    const newElements: FloatingElement[] = [];
    
    // Create floating elements for background
    for (let i = 0; i < 15; i++) {
      newElements.push({
        id: i,
        left: Math.random() * 100,
        animationDelay: Math.random() * 6,
        size: Math.random() * 20 + 10,
      });
    }
    
    setElements(newElements);
  }, []);

  return (
    <div className="modern-bg">
      {elements.map((element) => (
        <div
          key={element.id}
          className="floating-element"
          style={{
            left: `${element.left}%`,
            animationDelay: `${element.animationDelay}s`,
            width: `${element.size}px`,
            height: `${element.size}px`,
            top: `${Math.random() * 100}%`,
          }}
        />
      ))}
    </div>
  );
}