import { useEffect, useState, RefObject } from 'react';

export const useInView = (ref: RefObject<HTMLElement>, threshold = 0.1) => {
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          // Once in view, stop observing to keep the animation
          observer.unobserve(entry.target);
        }
      },
      {
        threshold,
        rootMargin: '0px 0px -100px 0px', // Trigger slightly before element comes into view
      }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [ref, threshold]);

  return isInView;
};
