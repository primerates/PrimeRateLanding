import { useEffect, useRef } from 'react';

export default function AdminDraftLoanStatus() {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptsInjected = useRef(false);

  useEffect(() => {
    if (!containerRef.current || scriptsInjected.current) return;

    // Fetch the complete HTML dashboard
    fetch('/loan-status-dashboard.html')
      .then(response => response.text())
      .then(html => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        if (containerRef.current) {
          // Inject styles from the HTML
          const styles = doc.querySelectorAll('style');
          styles.forEach(style => {
            const newStyle = document.createElement('style');
            newStyle.textContent = style.textContent;
            document.head.appendChild(newStyle);
          });

          // Inject body content
          const bodyContent = doc.body.innerHTML;
          containerRef.current.innerHTML = bodyContent;
          
          // Execute all scripts
          const scripts = doc.querySelectorAll('script');
          scripts.forEach(script => {
            const newScript = document.createElement('script');
            if (script.src) {
              newScript.src = script.src;
            } else {
              newScript.textContent = script.textContent;
            }
            document.body.appendChild(newScript);
          });

          scriptsInjected.current = true;
        }
      })
      .catch(error => {
        console.error('Error loading dashboard:', error);
        if (containerRef.current) {
          containerRef.current.innerHTML = `
            <div style="color: white; padding: 2rem; text-align: center;">
              <h2>Error loading dashboard</h2>
              <p>${error.message}</p>
            </div>
          `;
        }
      });

    return () => {
      // Cleanup if needed
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      style={{
        width: '100%',
        minHeight: '100vh'
      }}
      data-testid="container-loan-status-dashboard"
    >
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #581c87 50%, #0f172a 100%)',
        color: 'white',
        fontSize: '1.5rem'
      }}>
        Loading Complete Dashboard...
      </div>
    </div>
  );
}
