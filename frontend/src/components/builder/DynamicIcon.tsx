import type React from "react";
import * as Icons from "lucide-react";

interface DynamicIconProps {
  name: string;
  className?: string;
  size?: number | string;
  color?: string;
  style?: React.CSSProperties;
}

export const POPULAR_ICONS = [
  'Sparkles',
  'Star',
  'Heart',
  'Check',
  'CheckCircle',
  'Shield',
  'ShieldCheck',
  'Zap',
  'Rocket',
  'Flame',
  'Award',
  'Crown',
  'ArrowRight',
  'ChevronRight',
  'Send',
  'ExternalLink',
  'Mail',
  'Phone',
  'MapPin',
  'Globe',
  'ShoppingCart',
  'CreditCard',
  'Tag',
  'Users',
  'UserCheck',
  'MessageCircle',
  'HelpCircle',
  'Play',
  'Code',
  'Layers',
  'Smartphone',
  'Laptop',
];

export default function DynamicIcon({
  name,
  className = "",
  size = 24,
  color,
  style = {},
}: DynamicIconProps) {
  // Lucide exports icons by their PascalCase names
  const IconComponent = (Icons as Record<string, any>)[name] || Icons.Sparkles;

  return (
    <IconComponent
      className={className}
      size={size}
      color={color}
      style={style}
    />
  );
}
