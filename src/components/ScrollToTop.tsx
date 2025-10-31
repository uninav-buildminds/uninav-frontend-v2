import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Find the scrollable container
    const scrollableContainers = [
      document.querySelector(".scroll-surface"), // Dashboard scroll container
      window, // Fallback to window
    ];

    const scrollToTop = () => {
      scrollableContainers.forEach((container) => {
        if (container) {
          if (container === window) {
            window.scrollTo({
              top: 0,
              left: 0,
              behavior: "smooth",
            });
          } else {
            (container as HTMLElement).scrollTo({
              top: 0,
              left: 0,
              behavior: "smooth",
            });
          }
        }
      });
    };

    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(scrollToTop, 100);

    return () => clearTimeout(timeoutId);
  }, [pathname]);

  return null;
};

export default ScrollToTop;

