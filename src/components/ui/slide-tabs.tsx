import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";

interface SlideTabsProps {
  tabs: string[];
  onChange?: (index: number) => void;
  defaultTab?: number;
  activeTab?: number; // Added for controlled mode
  className?: string;
}

export const SlideTabs: React.FC<SlideTabsProps> = ({ 
  tabs, 
  onChange, 
  defaultTab = 0,
  activeTab,
  className = ""
}) => {
  const [position, setPosition] = useState({
    left: 0,
    width: 0,
    opacity: 0,
  });
  
  // Use activeTab if provided, otherwise fallback to internal state
  const [selectedState, setSelectedState] = useState(defaultTab);
  const selected = activeTab !== undefined ? activeTab : selectedState;

  const tabsRef = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    const selectedTab = tabsRef.current[selected];
    if (selectedTab) {
      const { width } = selectedTab.getBoundingClientRect();
      setPosition({
        left: selectedTab.offsetLeft,
        width,
        opacity: 1,
      });
    }
  }, [selected, tabs]); // Added tabs dependency to recalculate on tab change/mount

  const handleTabClick = (index: number) => {
    if (activeTab === undefined) {
        setSelectedState(index);
    }
    if (onChange) {
      onChange(index);
    }
  };

  return (
    <ul
      onMouseLeave={() => {
        const selectedTab = tabsRef.current[selected];
        if (selectedTab) {
            const { width } = selectedTab.getBoundingClientRect();
            setPosition({
                left: selectedTab.offsetLeft,
                width,
                opacity: 1,
            });
        }
      }}
      className={`relative mx-auto flex w-fit rounded-full border border-white/10 bg-black/50 p-1 backdrop-blur-md ${className}`}
    >
      {tabs.map((tab, i) => (
         <Tab
            key={tab}
            ref={(el) => { tabsRef.current[i] = el; }}
            setPosition={setPosition}
            onClick={() => handleTabClick(i)}
            isSelected={selected === i}
          >
            {tab}
        </Tab>
      ))}

      <Cursor position={position} />
    </ul>
  );
};

interface TabProps {
  children: React.ReactNode;
  setPosition: (position: { left: number; width: number; opacity: number }) => void;
  onClick: () => void;
  isSelected: boolean;
}

const Tab = React.forwardRef<HTMLLIElement, TabProps>(({ children, setPosition, onClick, isSelected }, ref) => {
  return (
    <li
      ref={ref}
      onClick={onClick}
      onMouseEnter={(e) => {
        const element = e.currentTarget;
        const { width } = element.getBoundingClientRect();

        setPosition({
          left: element.offsetLeft,
          width,
          opacity: 1,
        });
      }}
      // Fixed colors: Text should be white to invert to black when over the white cursor (mix-blend-difference)
      className="relative z-10 block cursor-pointer px-4 py-2 text-sm font-medium uppercase text-white mix-blend-difference transition-colors md:px-6 md:py-2.5 md:text-sm"
    >
      {children}
    </li>
  );
});

const Cursor = ({ position }: { position: { left: number; width: number; opacity: number } }) => {
  return (
    <motion.li
      animate={{
        left: position.left,
        width: position.width,
        opacity: position.opacity,
      }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="absolute z-0 h-[calc(100%-8px)] top-1 rounded-full bg-white"
    />
  );
};
