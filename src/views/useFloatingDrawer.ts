import { useCallback, useEffect, useRef, useState } from "react";

export const useFloatingDrawer = (hasLinks: boolean) => {
  const [isFloating, setIsFloating] = useState(false);
  const [userEnabledFloating, setUserEnabledFloating] = useState(false);
  const [isNoAnimation, setIsNoAnimation] = useState(false);
  const [showButton, setShowButton] = useState(false);

  const placeholderRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [placeholderHeight, setPlaceholderHeight] = useState<
    number | undefined
  >(undefined);

  // Actions
  const openFloating = useCallback(() => {
    setIsNoAnimation(false);
    setIsFloating(true);
    setUserEnabledFloating(true);
  }, []);

  const closeFloating = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsFloating(false);
    setUserEnabledFloating(false);
  }, []);

  // Layout preservation
  useEffect(() => {
    if (!isFloating && contentRef.current) {
      setPlaceholderHeight(contentRef.current.offsetHeight);
    }
  }, [isFloating]);

  // Scroll monitoring
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Docking
          setIsFloating(false);
          setShowButton(false);
          setIsNoAnimation(false);
        } else {
          // Undocking
          if (userEnabledFloating) {
            setIsNoAnimation(true);
            setIsFloating(true);
            setShowButton(false);
          } else {
            setShowButton(true);
          }
        }
      },
      {
        rootMargin: "0px 0px -50% 0px",
        threshold: 0,
      },
    );

    if (placeholderRef.current) {
      observer.observe(placeholderRef.current);
    }

    return () => observer.disconnect();
  }, [userEnabledFloating]);

  // Outside click detection
  useEffect(() => {
    if (!isFloating) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;

      // Orphaned node check
      if (!document.body.contains(target)) return;

      if (
        contentRef.current?.contains(target as Node) ||
        target.closest(".twohop-links-floating-button")
      ) {
        return;
      }

      closeFloating();
    };

    const timer = setTimeout(() => {
      document.addEventListener("click", handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isFloating, closeFloating]);

  return {
    isFloating,
    showButton,
    isNoAnimation,
    placeholderRef,
    contentRef,
    placeholderHeight,
    openFloating,
    closeFloating,
  };
};
