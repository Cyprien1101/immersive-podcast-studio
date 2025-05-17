
import { useEffect, useRef } from 'react';

type AnimationOptions = {
  threshold?: number;
  rootMargin?: string;
  animation?: string;
  delay?: number;
};

export function useScrollAnimation<T extends HTMLElement = HTMLDivElement>(
  options: AnimationOptions = {}
) {
  const {
    threshold = 0.1,
    rootMargin = '0px',
    animation = 'animate-fade-in',
    delay = 0
  } = options;
  
  const ref = useRef<T>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              if (ref.current) {
                ref.current.classList.add(...animation.split(' '));
                ref.current.style.opacity = '1';
              }
            }, delay);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );
    
    if (ref.current) {
      ref.current.style.opacity = '0';
      observer.observe(ref.current);
    }
    
    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [animation, delay, rootMargin, threshold]);
  
  return ref;
}
