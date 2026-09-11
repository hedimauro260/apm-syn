import { useEffect, useState } from "react";
import type { AvatarId } from "../types/settings.types";
import {
  getAvatar,
  SETTINGS_CHANGED_EVENT,
} from "../storage";

export function useUserAvatar(): AvatarId {
  const [avatar, setAvatar] = useState<AvatarId>(() => getAvatar());

  useEffect(() => {
    const refresh = () => setAvatar(getAvatar());
    window.addEventListener(SETTINGS_CHANGED_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(SETTINGS_CHANGED_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  return avatar;
}