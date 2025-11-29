// ScrollableArea.tsx
import React, { FC, ReactNode } from "react";

interface ScrollableAreaProps {
  children: ReactNode;
  height?: string; // Optional height for the scroll area
  width?: string; // Optional width for the scroll area
}

const ScrollableArea: FC<ScrollableAreaProps> = ({
  children,
  height = "300px",
  width = "100%",
}) => {
  const containerStyle: React.CSSProperties = {
    height: height,
    width: width,
    overflowY: "auto", // Enables vertical scrolling
    border: "1px solid #ccc", // Optional: for visual clarity
    padding: "10px",
  };

  return <div style={containerStyle}>{children}</div>;
};

export default ScrollableArea;
