import NetInfo from "@react-native-community/netinfo";
import { onlineManager } from "@tanstack/react-query";

// React Native has no `navigator.onLine`, so React Query can't tell when the
// device is offline on its own. Wire its onlineManager to NetInfo: when
// connectivity drops, mutations pause and queue; when it returns, paused
// mutations resume automatically (the offline check-in queue).
export function setupOnlineManager() {
  onlineManager.setEventListener((setOnline) => {
    return NetInfo.addEventListener((state) => {
      setOnline(Boolean(state.isConnected));
    });
  });
}
