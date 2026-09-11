import { useUser } from "@clerk/clerk-react";
import { cn } from "@/lib/utils";
import { useUserAvatar } from "@/features/settings/hooks/use-user-avatar";
import { getAvatarOption } from "@/features/settings/avatars";

const sizeClasses = {
  sm: "h-8 w-8 text-sm",
  md: "h-10 w-10 text-sm",
  lg: "h-20 w-20 text-2xl",
};

const iconClasses = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-9 w-9",
};

export interface UserAvatarProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function UserAvatar({ size = "md", className }: UserAvatarProps) {
  const { user } = useUser();
  const avatar = useUserAvatar();

  const userName = user?.fullName || user?.firstName || "User";
  const userInitials =
    userName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  if (avatar !== "initials") {
    const option = getAvatarOption(avatar);
    const Icon = option?.icon;

    return (
      <div
        className={cn(
          "rounded-full flex items-center justify-center overflow-hidden select-none shrink-0",
          option?.gradient ?? "bg-primary",
          sizeClasses[size],
          className
        )}
      >
        {Icon && <Icon className={cn("text-white", iconClasses[size])} />}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold select-none shrink-0",
        sizeClasses[size],
        className
      )}
    >
      {userInitials}
    </div>
  );
}