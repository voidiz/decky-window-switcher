import "@decky/ui";

declare module "*.svg" {
  const content: string;
  export default content;
}

declare module "*.png" {
  const content: string;
  export default content;
}

declare module "*.jpg" {
  const content: string;
  export default content;
}

// Extended types
declare module "@decky/ui" {
  interface Router {
    // Set the foreground app.
    SetRunningApp: (appId: number) => void;
  }

  interface WindowStore {
    // Get window IDs for a running app.
    // Actually returns a Proxy(number), but it takes too much effort to type.
    GetAppWindowIDs: (appId: number) => Record<number, number>;

    // Set the focused window ID for a running app. Will not display the window
    // unless the given app is in the foreground.
    SetFocusedAppWindowID: (appId: number, windowId: number) => void;
  }

  export interface GameWindowInfo {
    bCanClose: boolean;
    strTitle: string;
    windowid: number;
  }

  interface UI {
    GetGameWindowsInfo: (
      appId: number,
      windowIds: number[]
    ) => Promise<GameWindowInfo[]>;
  }

  interface System {
    UI: UI;
  }

  // Use this as a workaround since we cannot override types.
  interface SteamClientV2 extends Omit<typeof SteamClient, "System"> {
    System: System;
  }
}
