import { useUser } from "@clerk/clerk-react";
import { SettingsSection, SettingsGroup, SettingsRow } from "../settings-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, Mail, Key, Trash2 } from "lucide-react";

export function AccountSettings() {
  const { user } = useUser();

  const email = user?.emailAddresses?.[0]?.emailAddress ?? "Not set";
  const name = user?.fullName ?? user?.firstName ?? "Not set";
  const createdAt = user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Unknown";
  const lastSignIn = user?.lastSignInAt ? new Date(user.lastSignInAt).toLocaleDateString() : "Unknown";

  return (
    <SettingsSection
      title="Account"
      description="Manage your profile and security settings."
    >
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
