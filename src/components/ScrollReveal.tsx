import React, { useEffect, useRef, useState } from 'react';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number; // Delay in milliseconds
  key?: React.Key | null | undefined;
}

export function ScrollReveal({ children, className = '', delay = 0 }: ScrollRevealProps) {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setIsVisible(true);
      return;
    }

    let observer: IntersectionObserver | null = null;
    const currentRef = elementRef.current;

    try {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            if (delay > 0) {
              setTimeout(() => {
                setIsVisible(true);
              }, delay);
            } else {
              setIsVisible(true);
            }
            
            if (currentRef && observer) {
              observer.unobserve(currentRef);
            }
          }
        },
        {
          threshold: 0.05, // Trigger as soon as 5% of the card is visible
          rootMargin: '0px 0px -40px 0px' // Offset slightly so it triggers smoothly during scrolling
        }
      );

      if (currentRef) {
        observer.observe(currentRef);
      }
    } catch (e) {
      console.warn('ScrollReveal: IntersectionObserver initialization failed. Displaying contents by default.', e);
      setIsVisible(true);
    }

    return () => {
      if (currentRef && observer) {
        try {
          observer.unobserve(currentRef);
        } catch (err) {
          // Ignore
        }
      }
    };
  }, [delay]);

  return (
    <div
      ref={elementRef}
      className={`transition-all duration-800 ease-[cubic-bezier(0.16,1,0.3,1)] transform will-change-[transform,opacity] ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      } ${className}`}
    >
      {children}
    </div>
  );
}
