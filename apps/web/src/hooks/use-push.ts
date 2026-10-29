import { useCallback, useState } from "react";
import {
  isPushSupported,
  subscribeToPush,
  unsubscribeFromPush,
  type PushEnableResult,
} from "@/lib/push";

export interface UsePushResult {
  isSupported: boolean;
  permission: NotificationPermission;
  isBusy: boolean;
  enable: () => Promise<PushEnableResult>;
  disable: () => Promise<void>;
}

function currentPermission(): NotificationPermission {
  return typeof Notification !== "undefined" ? Notification.permission : "denied";
}

export function usePush(): UsePushResult {
  const [isSupported] = useState(isPushSupported);
  const [permission, setPermission] = useState<NotificationPermission>(
    currentPermission,
  );
  const [isBusy, setIsBusy] = useState(false);

  const enable = useCallback(async (): Promise<PushEnableResult> => {
    setIsBusy(true);
    try {
      const result = await subscribeToPush();
      setPermission(currentPermission());
      return result;
    } catch {
      return "dismissed";
    } finally {
      setIsBusy(false);
    }
  }, []);

  const disable = useCallback(async (): Promise<void> => {
    setIsBusy(true);
    try {
      await unsubscribeFromPush();
    } catch {
    } finally {
      setIsBusy(false);
    }
  }, []);

  return { isSupported, permission, isBusy, enable, disable };
}
