import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Handles GitHub Pages SPA redirect
 * When 404.html redirects with ?p= query param,
 * this hook navigates to the correct route
 */
export function useGitHubPagesRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const redirectPath = params.get('p');

    if (redirectPath) {
      const query = params.get('q');
      const fullPath = '/' + redirectPath + 
        (query ? '?' + query.replace(/~and~/g, '&') : '') + 
        window.location.hash;
      
      // Clean up the URL and navigate
      window.history.replaceState(null, '', window.location.pathname);
      navigate(fullPath, { replace: true });
    }
  }, [navigate]);
}
