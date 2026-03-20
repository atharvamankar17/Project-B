import { motion } from 'framer-motion';

const SYSTEM_GREEN = '#34C759';
const SYSTEM_ORANGE = '#FF9F0A';
const SYSTEM_RED = '#FF453A';

interface CircularProgressProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
}

function getColor(p: number) {
  if (p > 75) return SYSTEM_GREEN;
  if (p >= 74.5 && p <= 75.5) return SYSTEM_ORANGE;
  return SYSTEM_RED;
}

export default function CircularProgress({ percentage, size = 160, strokeWidth = 12 }: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (Math.max(0, Math.min(100, percentage)) / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="transparent" strokeWidth={strokeWidth}
          className="stroke-secondary"
        />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="transparent" stroke={getColor(percentage)}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-light tracking-tighter tabular">
          {percentage.toFixed(2)}%
        </span>
      </div>
    </div>
  );
}
