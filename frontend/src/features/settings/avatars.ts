import {
  Rocket,
  Orbit,
  Sparkles,
  Zap,
  ShieldCheck,
  Crown,
  MoonStar,
  Flame,
} from "lucide-react";
import type { AvatarId } from "./types/settings.types";

export interface AvatarOption {
  id: AvatarId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
}

export const AVATAR_OPTIONS: AvatarOption[] = [
  { id: "rocket", label: "Rocket", icon: Rocket, gradient: "bg-gradient-to-br from-sky-500 to-blue-600" },
  { id: "planet", label: "Planet", icon: Orbit, gradient: "bg-gradient-to-br from-emerald-500 to-teal-600" },
  { id: "sparkles", label: "Sparkles", icon: Sparkles, gradient: "bg-gradient-to-br from-violet-500 to-purple-600" },
  { id: "zap", label: "Lightning", icon: Zap, gradient: "bg-gradient-to-br from-amber-400 to-orange-500" },
  { id: "shield", label: "Shield", icon: ShieldCheck, gradient: "bg-gradient-to-br from-slate-500 to-slate-700" },
  { id: "crown", label: "Crown", icon: Crown, gradient: "bg-gradient-to-br from-yellow-400 to-amber-600" },
  { id: "moon", label: "Moon", icon: MoonStar, gradient: "bg-gradient-to-br from-indigo-500 to-slate-800" },
  { id: "flame", label: "Flame", icon: Flame, gradient: "bg-gradient-to-br from-rose-500 to-red-600" },
];

export function getAvatarOption(id: AvatarId): AvatarOption | undefined {
  return AVATAR_OPTIONS.find((opt) => opt.id === id);
}