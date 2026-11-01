import { cn } from "../../utils/cn";
import { motion } from "framer-motion";
import React, { useMemo } from "react";

export const Meteors = ({ number, className }) => {
  // Memoize the random delays/durations so parent re-renders don't restart
  // every meteor's animation
  const meteorStyles = useMemo(() => {
    const meteorCount = number || 20;
    return new Array(meteorCount).fill(true).map((_, idx) => ({
      top: "-40px",
      left: idx * (800 / meteorCount) - 400 + "px",
      animationDelay: Math.random() * 5 + "s",
      animationDuration: Math.floor(Math.random() * (10 - 5) + 5) + "s",
    }));
  }, [number]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, delay: 0.5 }}
      className="absolute inset-0"
    >
      {meteorStyles.map((style, idx) => (
        <span
          key={"meteor" + idx}
          className={cn(
            "animate-meteor-effect absolute h-0.5 w-0.5 rotate-[45deg] rounded-[9999px] bg-slate-500 shadow-[0_0_0_1px_#ffffff10]",
            "before:absolute before:top-1/2 before:h-[1px] before:w-[50px] before:-translate-y-[50%] before:transform before:bg-gradient-to-r before:from-[#64748b] before:to-transparent before:content-['']",
            className
          )}
          style={style}
        />
      ))}
    </motion.div>
  );
};
