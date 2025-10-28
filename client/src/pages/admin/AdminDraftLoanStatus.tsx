import { useEffect, useRef } from 'react';

export default function AdminDraftLoanStatus() {
  const dashboardRef = useRef<HTMLDivElement>(null);
  const styleRef = useRef<HTMLStyleElement | null>(null);

  useEffect(() => {
    if (!dashboardRef.current) return;

    // Inject CSS styles scoped to this dashboard
    if (!styleRef.current) {
      const styleElement = document.createElement('style');
      styleElement.textContent = `
        /* Scoped styles for loan status dashboard */
        #loan-status-dashboard-root {
          min-height: 100vh;
          background: linear-gradient(135deg, #0f172a 0%, #581c87 50%, #0f172a 100%);
          padding: 2rem;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
        }
        
        #loan-status-dashboard-root * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
      `;
      document.head.appendChild(styleElement);
      styleRef.current = styleElement;
    }

    // Load the complete dashboard HTML
    fetch('/loan-status-dashboard.html')
      .then(response => response.text())
      .then(html => {
        // Extract the body content (excluding <html>, <head>, <body> tags)
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const bodyContent = doc.body.innerHTML;
        
        if (dashboardRef.current) {
          dashboardRef.current.innerHTML = bodyContent;
          
          // Execute inline scripts from the HTML
          const scripts = doc.querySelectorAll('script');
          scripts.forEach(script => {
            const newScript = document.createElement('script');
            newScript.textContent = script.textContent;
            dashboardRef.current?.appendChild(newScript);
          });
          
          // Inject styles from the HTML
          const styles = doc.querySelectorAll('style');
          styles.forEach(style => {
            const newStyle = document.createElement('style');
            newStyle.textContent = style.textContent;
            document.head.appendChild(newStyle);
          });
        }
      })
      .catch(error => {
        console.error('Error loading dashboard:', error);
        if (dashboardRef.current) {
          dashboardRef.current.innerHTML = `
            <div style="color: white; padding: 2rem; text-align: center;">
              <h2>Error loading dashboard</h2>
              <p>Please check the console for details.</p>
            </div>
          `;
        }
      });

    return () => {
      // Cleanup: remove injected style
      if (styleRef.current) {
        styleRef.current.remove();
        styleRef.current = null;
      }
    };
  }, []);

  return (
    <div 
      id="loan-status-dashboard-root" 
      ref={dashboardRef}
      data-testid="container-loan-status-dashboard"
      style={{
        width: '100%',
        minHeight: '100vh',
        overflow: 'auto'
      }}
    >
      {/* Loading placeholder */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        height: '100vh',
        color: 'white',
        fontSize: '1.5rem'
      }}>
        Loading Loan Status Dashboard...
      </div>
    </div>
  );
}
