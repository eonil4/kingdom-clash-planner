interface UnitLevelBadgeProps {
  level: number;
  size?: string;
  fontSize?: string;
}

export default function UnitLevelBadge({ level, size = '24px', fontSize = '0.75rem' }: UnitLevelBadgeProps) {
  return (
    <div
      className="absolute -top-0.5 -right-0.5 flex items-center justify-center bg-blue-600 border-2 border-blue-400 shadow-lg"
      style={{
        width: size,
        height: size,
        minWidth: size.includes('%') ? '12px' : undefined,
        minHeight: size.includes('%') ? '12px' : undefined,
        clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
      }}
      aria-hidden="true"
    >
      <span className="font-bold text-white" style={{ fontSize }}>
        {level}
      </span>
    </div>
  );
}
