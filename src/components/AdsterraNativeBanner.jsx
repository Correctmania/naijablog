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
    script.src = 'https://bicea.org/21/ffc2e2ccb428145034451e06a3946756';

    container.appendChild(script);

    return () => {
      if (container) {
        container.innerHTML = '';
      }
    };
  }, []);

  return (
    <div className="my-8 flex justify-center">
      <div id="container-ffc2e2ccb428145034451e06a3946756" ref={containerRef} className="w-full max-w-4xl" />
    </div>
  );
}