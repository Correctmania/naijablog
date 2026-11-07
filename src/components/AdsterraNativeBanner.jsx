import React, { useEffect, useRef } from 'react';

export default function AdsterraNativeBanner() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Prevent duplicate script injection on re-renders
    if (container.querySelector('script')) return;

    const script = document.createElement('script');
    script.async = true;
    script.setAttribute('data-cfasync', 'false');
    // Replace this URL with the exact src URL from your Adsterra "Get Ad Code" snippet
    script.src = 'https://pl23456789.effectivegatecpm.com/YOUR_PLACEMENT_KEY/invoke.js';

    container.appendChild(script);

    return () => {
      // Cleanup on unmount
      if (container) {
        container.innerHTML = '';
      }
    };
  }, []);

  return (
    <div className="my-8 flex justify-center">
      {/* Replace the ID below with the exact container ID from your Adsterra snippet */}
      <div id="container-YOUR_PLACEMENT_KEY" ref={containerRef} className="w-full max-w-4xl" />
    </div>
  );
}