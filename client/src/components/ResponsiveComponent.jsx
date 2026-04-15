import { useState, useEffect } from 'react';

export default function ResponsiveComponent() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div>
      {isMobile ? (
        <div className="mobile-layout">Mobile View</div>
      ) : (
        <div className="desktop-layout">Desktop View</div>
      )}
    </div>
  );
}
