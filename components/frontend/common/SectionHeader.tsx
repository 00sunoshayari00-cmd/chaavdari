// components/frontend/common/SectionHeader.tsx
import React from "react";
interface SectionHeaderProps {
  title: string;
  className?: string;
}
function SectionHeader({ title, className }: SectionHeaderProps) {
  return (
    <header>
      <h2
        className={`text-[40px] font-berkshire gradient-text ${className ? ` ${className}` : "text-center"}`}
      >
        {title}
      </h2>
    </header>
  );
}

export default SectionHeader;
