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

  export interface Unregisterable {
    /**
     * Unregister the callback.
     */
    unregister(): void;
  }

  interface ControllerStateChange {
    unControllerIndex: number;
    unPacketNum: number;
    /**
     * Bitmask representing pressed upper buttons.
     * - Bit 0-8: Unknown (@todo Please provide more details if known)
     * - Bit 9: L4
     * - Bit 10: R4
     * - Bit 11-13: Unknown (@todo Please provide more details if known)
     * - Bit 14: Left Joystick Touch
     * - Bit 15: Right Joystick Touch
     * - Bit 16-17: Unknown (@todo Please provide more details if known)
     * - Bit 18: Quick Access Menu
     */
    ulUpperButtons: number;
    /**
     * Bitmask representing pressed buttons.
     * - Bit 0: R2
     * - Bit 1: L2
     * - Bit 2: R1
     * - Bit 3: L1
     * - Bit 4: Y
     * - Bit 5: B
     * - Bit 6: X
     * - Bit 7: A
     * - Bit 8: D-Pad Up
     * - Bit 9: D-Pad Right
     * - Bit 10: D-Pad Left
     * - Bit 11: D-Pad Down
     * - Bit 12: Select
     * - Bit 13: Steam/Home
     * - Bit 14: Start
     * - Bit 15: L5
     * - Bit 16: R5
     * - Bit 17: Left Touchpad Click
     * - Bit 18: Right Touchpad Click
     * - Bit 19: Left Touchpad Touch
     * - Bit 20: Right Touchpad Touch
     * - Bit 21: Unknown (@todo Please provide more details if known)
     * - Bit 22: L3
     * - Bit 23-25: Unknown (@todo Please provide more details if known)
     * - Bit 26: R3
     * - Bit 27-28: Unknown (@todo Please provide more details if known)
     * - Bit 29: Mute (Dualsense)
     * - Bit 30-31: Unknown (@todo Please provide more details if known)
     */
    ulButtons: number;
    sLeftPadX: number;
    sLeftPadY: number;
    sRightPadX: number;
    sRightPadY: number;
    sCenterPadX: number;
    sCenterPadY: number;
    sLeftStickX: number;
    sLeftStickY: number;
    sRightStickX: number;
    sRightStickY: number;
    sTriggerL: number;
    sTriggerR: number;
    flTrustedGravityVectorX: number;
    flTrustedGravityVectorY: number;
    flTrustedGravityVectorZ: number;
    flSoftwareQuatW: number;
    flSoftwareQuatX: number;
    flSoftwareQuatY: number;
    flSoftwareQuatZ: number;
    flSoftwareGyroDegreesPerSecondPitch: number;
    flSoftwareGyroDegreesPerSecondYaw: number;
    flSoftwareGyroDegreesPerSecondRoll: number;
    flHardwareQuatW: number;
    flHardwareQuatX: number;
    flHardwareQuatY: number;
    flHardwareQuatZ: number;
    flHardwareGyroDegreesPerSecondPitch: number;
    flHardwareGyroDegreesPerSecondYaw: number;
    flHardwareGyroDegreesPerSecondRoll: number;
    flGyroNoiseLength: number;
    flGyroCalibrationProgress: number;
    flGravityVectorX: number;
    flGravityVectorY: number;
    flGravityVectorZ: number;
    flAccelerometerNoiseLength: number;
    sBatteryLevel: number;
    sPressurePadLeft: number;
    sPressurePadRight: number;
    sPressureBumperLeft: number;
    sPressureBumperRight: number;
    unHardwareUpdateInMicrosec: number;
  }

  interface Input {
    /**
     * Registers a callback for changes in the controller state (buttons presses, triggers presses, joystick changes etc...).
     * @param callback The callback function for controller state changes.
     * @returns An object that can be used to unregister the callback.
     */
    RegisterForControllerStateChanges(
      callback: (controllerStateChanges: ControllerStateChange[]) => void
    ): Unregisterable;

    UnregisterForControllerStateChanges(): void;
  }

  // Use this as a workaround since we cannot override types.
  interface SteamClientV2 extends Omit<typeof SteamClient, "System"> {
    System: System;
    Input: Input;
  }
}
