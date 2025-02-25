import { motion } from "framer-motion";

interface LoadingIndicatorProps {
  step: number;
  message: string;
}

export function LoadingIndicator({ step, message }: LoadingIndicatorProps) {
  if (step === 1) {
    return (
      <motion.div
        key="loading1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex flex-col items-center justify-center py-20"
      >
        <div className="relative h-20 w-20">
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-primary"
            style={{ borderTopColor: "transparent" }}
            animate={{ rotate: 360 }}
            transition={{
              duration: 1,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          />
        </div>
        <p className="mt-4 text-center text-muted-foreground">{message}</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      key="loading2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center py-20"
    >
      <div className="relative">
        <motion.div
          className="h-20 w-20 rounded-lg bg-primary/10"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute inset-0 h-20 w-20 rounded-lg bg-primary/20"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [180, 360, 180],
          }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 0.2,
          }}
        />
      </div>
      <p className="mt-4 text-center text-muted-foreground">{message}</p>
    </motion.div>
  );
}
