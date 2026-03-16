import { cn } from "@/lib/utils";

interface ColorSwatchProps {
  color: string;
  name?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ColorSwatch({
  color,
  name,
  size = "md",
  className,
}: ColorSwatchProps) {
  const sizes = {
    sm: "w-6 h-6",
    md: "w-10 h-10",
    lg: "w-14 h-14",
  };

  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      <div
        className={cn(
          "rounded-lg border border-white/10 shadow-inner",
          sizes[size]
        )}
        style={{ backgroundColor: color }}
        title={name || color}
      />
      {name && <span className="text-[10px] text-muted">{name}</span>}
    </div>
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
