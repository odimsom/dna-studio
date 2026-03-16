import { cn } from "@/lib/utils";

interface ColorSwatchProps {
  color: string;
  name?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ColorSwatch({
  color,
  size = "md",
  className,
}: ColorSwatchProps) {
  const sizes = {
    sm: "w-6 h-6",
    md: "w-12 h-12",
    lg: "w-20 h-20",
  };

  return (
    <div
      className={cn(
        "rounded-full border border-white/5",
        sizes[size],
        className
      )}
      style={{ backgroundColor: color }}
      title={color}
    />
  );
}

export function ColorPalette({
  colors,
  size = "md",
}: {
  colors: string[];
  size?: "sm" | "md" | "lg";
}) {
  return (
    <div className="flex gap-2">
      {colors.map((color) => (
        <ColorSwatch key={color} color={color} size={size} />
      ))}
    </div>
  );
}
