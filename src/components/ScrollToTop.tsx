import { useEffect } from 'react';
import { useLocation, Outlet } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll window to top
    window.scrollTo(0, 0);
    
    // Also try to find main content areas and scroll them to top
    const mainContent = document.querySelector('main');
    if (mainContent) {
      mainContent.scrollTop = 0;
    }
  }, [pathname]);

  return <Outlet />;
};

export default ScrollToTop;
