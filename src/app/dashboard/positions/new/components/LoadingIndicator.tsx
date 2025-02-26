import { motion } from "framer-motion";
import { IconCloud } from "~/components/magicui/icon-cloud";

interface LoadingIndicatorProps {
  step: number;
  message: string;
}

export function LoadingIndicator({ step, message }: LoadingIndicatorProps) {
  // Create an array with multiple instances of the logo for a more interesting effect
  const logoImages = Array(15).fill("/logo.png");

  return (
    <motion.div
      key={`loading-step-${step}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center py-10"
    >
      <div className="relative flex h-[300px] w-[300px] items-center justify-center overflow-hidden rounded-lg">
        <IconCloud images={logoImages} />
      </div>
      <p className="mt-4 text-center text-lg font-medium text-verbo-dark">
        {message}
      </p>
    </motion.div>
  );
}
