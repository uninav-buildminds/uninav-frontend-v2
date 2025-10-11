import React, { useState } from "react";

let globalSidebarState = {
  isCollapsed: false,
  setIsCollapsed: (collapsed: boolean) => {
    globalSidebarState.isCollapsed = collapsed;
    // Trigger re-render for components using this hook
    window.dispatchEvent(
      new CustomEvent("sidebar-toggle", { detail: { isCollapsed: collapsed } })
    );
  },
};

export const useSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(
    globalSidebarState.isCollapsed
  );

  // Listen for global sidebar changes
  React.useEffect(() => {
    const handleSidebarToggle = (event: CustomEvent) => {
      setIsCollapsed(event.detail.isCollapsed);
    };

    window.addEventListener(
      "sidebar-toggle",
      handleSidebarToggle as EventListener
    );
    return () => {
      window.removeEventListener(
        "sidebar-toggle",
        handleSidebarToggle as EventListener
      );
    };
  }, []);

  return {
    isCollapsed,
    setIsCollapsed: (collapsed: boolean) => {
      globalSidebarState.setIsCollapsed(collapsed);
    },
  };
};
