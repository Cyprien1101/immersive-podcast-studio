
import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface ScrollAnimationWrapperProps {
  children: React.ReactNode;
  animation?: 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'zoom-in' | 'zoom-out' | string;
  className?: string;
  threshold?: number;
  delay?: number;
  rootMargin?: string;
  once?: boolean;
  duration?: number;
}

const ScrollAnimationWrapper: React.FC<ScrollAnimationWrapperProps> = ({
  children,
  animation = 'fade-up',
  className = '',
  threshold = 0.1,
  delay = 0,
  rootMargin = '0px',
  once = true,
  duration = 800,
}) => {
  const elementRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const element = elementRef.current;
    
    if (!element) return;
    
    // Set initial styles
    element.style.opacity = '0';
    element.style.transition = `opacity ${duration}ms ease-out, transform ${duration}ms ease-out`;
    if (delay > 0) {
      element.style.transitionDelay = `${delay}ms`;
    }
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Add animation class when element is in view
            setTimeout(() => {
              if (element) {
                element.style.opacity = '1';
                element.style.transform = 'none';
              }
            }, 100);
            
            if (once) {
              observer.unobserve(entry.target);
            }
          } else if (!once) {
            // Remove animation class when element is out of view
            element.style.opacity = '0';
            
            // Reset transform based on animation type
            switch (animation) {
              case 'fade-up':
                element.style.transform = 'translateY(30px)';
                break;
              case 'fade-down':
                element.style.transform = 'translateY(-30px)';
                break;
              case 'fade-left':
                element.style.transform = 'translateX(-30px)';
                break;
              case 'fade-right':
                element.style.transform = 'translateX(30px)';
                break;
              case 'zoom-in':
                element.style.transform = 'scale(0.9)';
                break;
              case 'zoom-out':
                element.style.transform = 'scale(1.1)';
                break;
              default:
                element.style.transform = 'translateY(30px)';
            }
          }
        });
      },
      { threshold, rootMargin }
    );
    
    // Set initial transform based on animation type
    switch (animation) {
      case 'fade-up':
        element.style.transform = 'translateY(30px)';
        break;
      case 'fade-down':
        element.style.transform = 'translateY(-30px)';
        break;
      case 'fade-left':
        element.style.transform = 'translateX(-30px)';
        break;
      case 'fade-right':
        element.style.transform = 'translateX(30px)';
        break;
      case 'zoom-in':
        element.style.transform = 'scale(0.9)';
        break;
      case 'zoom-out':
        element.style.transform = 'scale(1.1)';
        break;
      default:
        element.style.transform = 'translateY(30px)';
    }
    
    observer.observe(element);
    
    return () => {
      if (element) observer.unobserve(element);
    };
  }, [animation, delay, duration, once, rootMargin, threshold]);
  
  return (
    <div ref={elementRef} className={cn(className)}>
      {children}
    </div>
  );
};

export default ScrollAnimationWrapper;
