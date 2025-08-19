import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(
    undefined,
  );

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isMobile;
}

export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = React.useState<string>("lg");

  React.useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setBreakpoint("base"); // 2 columns
      } else if (width < 768) {
        setBreakpoint("sm"); // 3 columns
      } else if (width < 1024) {
        setBreakpoint("md"); // 4 columns
      } else {
        setBreakpoint("lg"); // 5 columns
      }
    };

    updateBreakpoint();
    window.addEventListener("resize", updateBreakpoint);
    return () => window.removeEventListener("resize", updateBreakpoint);
  }, []);

  return breakpoint;
}

export function useColumnCount() {
  const breakpoint = useBreakpoint();
  
  const columnCount = React.useMemo(() => {
    switch (breakpoint) {
      case 'lg':
        return 5; // lg:grid-cols-5
      case 'md':
        return 4; // md:grid-cols-4
      case 'sm':
        return 3; // sm:grid-cols-3
      default:
        return 2; // grid-cols-2 (base)
    }
  }, [breakpoint]);

  return columnCount;
}