import { type GameWindowInfo, Router, type SteamClientV2 } from "@decky/ui";

export type AppWindowInfo = Awaited<ReturnType<typeof getWindowInfos>>[number];

export function focusWindow(appId: number, windowInfo: GameWindowInfo) {
  // Set foreground app.
  Router.SetRunningApp(appId);

  // Set foreground window.
  Router.WindowStore?.SetFocusedAppWindowID(appId, windowInfo.windowid);
}

export async function getWindowInfos() {
  const appIds = Router.RunningApps.map((app) => +app.appid);
  const appWindows = appIds.map((appId) => {
    // Unpack the array proxy into an actual array
    // TODO: Better error handling when WindowStore is undefined (can it be?).
    const windowIdsObj = Router.WindowStore?.GetAppWindowIDs(appId) ?? {};
    const windowIds: number[] = [];
    for (const [index, windowId] of Object.entries(windowIdsObj)) {
      windowIds[+index] = windowId;
    }

    return {
      appId,
      windowIds,
    };
  });

  const wInfo = (
    await Promise.all(
      appWindows.map(
        // TODO: Cast can be removed when the SteamClient type is updated.
        async ({ appId, windowIds }) => {
          const gameWindowsInfo = await (
            SteamClient as unknown as SteamClientV2
          ).System.UI.GetGameWindowsInfo(appId, windowIds);

          return gameWindowsInfo.map((windowInfo) => ({
            appId,
            windowInfo,
          }));
        }
      )
    )
  ).flat();

  return wInfo;
}
