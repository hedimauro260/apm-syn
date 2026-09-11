import { useUser } from "@clerk/clerk-react";
import { SettingsSection, SettingsGroup, SettingsRow } from "../settings-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserAvatar } from "@/components/ui/user-avatar";
import { AVATAR_OPTIONS } from "@/features/settings/avatars";
import type {
  AvatarId,
  UserSettings,
} from "@/features/settings/types/settings.types";
import { Shield, Mail, Key, Trash2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface AccountSettingsProps {
  settings: UserSettings;
  onUpdate: (path: string, value: unknown) => void;
}

export function AccountSettings({ settings, onUpdate }: AccountSettingsProps) {
  const { user } = useUser();

  const email = user?.emailAddresses?.[0]?.emailAddress ?? "Not set";
  const name = user?.fullName ?? user?.firstName ?? "Not set";
  const createdAt = user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Unknown";
  const lastSignIn = user?.lastSignInAt ? new Date(user.lastSignInAt).toLocaleDateString() : "Unknown";

  const initials =
    user
      ?.fullName?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "U";

  const selectedAvatar = settings.account.avatar;

  const selectAvatar = (id: AvatarId) => onUpdate("account.avatar", id);

  const avatarOptions: (AvatarId | "initials")[] = [
    "initials",
    ...AVATAR_OPTIONS.map((opt) => opt.id),
  ];

  return (
    <SettingsSection
      title="Account"
      description="Manage your profile, avatar, and security settings."
    >
      <SettingsGroup title="Avatar">
        <div className="flex flex-col sm:flex-row sm:items-start gap-6">
          <div className="flex flex-col items-center gap-2 shrink-0">
            <UserAvatar size="lg" />
            <span className="text-xs text-foreground-muted">Current</span>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground mb-3">
              Choose an avatar
            </p>
            <div className="grid grid-cols-4 sm:grid-cols-4 gap-2.5">
              {avatarOptions.map((id) => {
                const isSelected = selectedAvatar === id;

                if (id === "initials") {
                  return (
                    <button
                      key={id}
                      onClick={() => selectAvatar("initials")}
                      title="Use my initials"
                      className={cn(
                        "relative h-14 w-14 rounded-full transition-transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-border",
                        isSelected && "ring-2 ring-primary ring-offset-2"
                      )}
                    >
                      <div className="h-14 w-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                        {initials}
                      </div>
                      {isSelected && (
                        <span className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                          <Check className="h-3 w-3" />
                        </span>
                      )}
                    </button>
                  );
                }

                const option = AVATAR_OPTIONS.find((o) => o.id === id)!;
                const Icon = option.icon;

                return (
                  <button
                    key={id}
                    onClick={() => selectAvatar(id)}
                    title={option.label}
                    className={cn(
                      "relative h-14 w-14 rounded-full transition-transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-border",
                      option.gradient,
                      isSelected && "ring-2 ring-primary ring-offset-2"
                    )}
                  >
                    <Icon className="h-6 w-6 text-white mx-auto" />
                    {isSelected && (
                      <span className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                        <Check className="h-3 w-3" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-foreground-muted mt-3">
              Your avatar is shown in the top menu and appears across the app.
            </p>
          </div>
        </div>
      </SettingsGroup>

      <SettingsGroup title="Profile">
        <SettingsRow label="Name" description="Your display name across the application.">
          <div className="flex items-center gap-2">
            <Input
              value={name}
              readOnly
              className="w-64 bg-background"
            />
            <Button variant="ghost" size="sm" className="text-xs">
              Edit
            </Button>
          </div>
        </SettingsRow>

        <SettingsRow label="Email" description="Your primary email address.">
          <div className="flex items-center gap-2">
            <Badge variant="default">
              <Mail className="h-3 w-3" />
              {email}
            </Badge>
          </div>
        </SettingsRow>

        <SettingsRow label="Account created" description="When you first joined APM SYN.">
          <span className="text-sm text-foreground-secondary">{createdAt}</span>
        </SettingsRow>

        <SettingsRow label="Last sign in" description="Your most recent login.">
          <span className="text-sm text-foreground-secondary">{lastSignIn}</span>
        </SettingsRow>
      </SettingsGroup>

      <SettingsGroup title="Security">
        <SettingsRow
          label="Password"
          description="Manage your password through your authentication provider."
        >
          <Button variant="outline" size="sm" className="text-xs">
            <Key className="h-3.5 w-3.5" />
            Manage
          </Button>
        </SettingsRow>

        <SettingsRow
          label="Two-factor authentication"
          description="Add an extra layer of security to your account."
        >
          <Badge variant="info">
            <Shield className="h-3 w-3" />
            Via Clerk
          </Badge>
        </SettingsRow>
      </SettingsGroup>

      <SettingsGroup title="Danger Zone">
        <SettingsRow
          label="Delete account"
          description="Permanently delete your account and all associated data. This action cannot be undone."
        >
          <Button variant="danger" size="sm" className="text-xs">
            <Trash2 className="h-3.5 w-3.5" />
            Delete account
          </Button>
        </SettingsRow>
      </SettingsGroup>
    </SettingsSection>
  );
}