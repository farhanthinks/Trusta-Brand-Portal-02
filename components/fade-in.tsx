"use client";

import { motion } from "framer-motion";

/**
 * One subtle page-level entrance, applied once around dashboard content
 * rather than per-card — keeps every section a plain server component
 * instead of forcing each into "use client" just for its own animation.
 */
export function FadeIn({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
