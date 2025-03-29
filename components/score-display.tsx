"use client"

import { motion } from "framer-motion"

interface ScoreDisplayProps {
  score: number
  totalQuestions: number
  animate: boolean
}

export function ScoreDisplay({ score, totalQuestions, animate }: ScoreDisplayProps) {
  return (
    <motion.div
      className="bg-card/80 backdrop-blur-sm rounded-xl p-4 shadow-lg relative z-10"
      animate={animate ? { scale: [1, 1.05, 1] } : {}}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Current Score</p>
          <div className="flex items-center">
            <motion.p
              className="text-2xl font-bold text-primary"
              animate={animate ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.5 }}
            >
              {score}
            </motion.p>
            <p className="text-lg text-muted-foreground ml-1">/ {totalQuestions}</p>
          </div>
        </div>

        <div className="flex items-center">
          <div className="relative w-32 h-8">
            <div className="absolute inset-0 bg-muted rounded-full"></div>
            <motion.div
              className="absolute inset-y-0 left-0 bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(score / totalQuestions) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-xs font-medium text-primary-foreground">
                {Math.round((score / totalQuestions) * 100)}%
              </p>
            </div>
          </div>

          <div className="ml-3 flex">
            {Array.from({ length: Math.min(3, score) }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: animate ? 0 : 1 }}
                animate={{ scale: 1, rotate: animate ? [0, 15, -15, 0] : 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="w-6 h-6 -ml-1 flex items-center justify-center text-xs"
              >
                ⭐
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

