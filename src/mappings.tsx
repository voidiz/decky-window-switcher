import React, { createContext, useCallback, useEffect, useState } from "react";

import { focusWindow, type AppWindowInfo } from "./window";
import { ControllerStateChange, SteamClientV2 } from "@decky/ui";

type ControllerInput = (typeof inputs)[number];

export type Label = ControllerInput["label"];

export type InputMappings = {
  [K in Label]?: AppWindowInfo;
};

export type PersistentMappingsState = {
  mappings: InputMappings;
  enabled: boolean;
};

type MappingsState = {
  mappings: InputMappings;
  setMapping: (label: Label, window: AppWindowInfo) => void;
  enabled: boolean;
  toggleEnabled: () => void;
};

export const inputs = [
  { label: "L4", key: "ulUpperButtons", value: 512 },
  { label: "R4", key: "ulUpperButtons", value: 1024 },
  { label: "L5", key: "ulButtons", value: 32768 },
  { label: "R5", key: "ulButtons", value: 65536 },
] as const;

export const MappingsContext = createContext<MappingsState>({
  mappings: {},
  setMapping: (_label: Label, _window: AppWindowInfo) => {},
  enabled: true,
  toggleEnabled: () => {},
});

const handleTrigger =
  (mappings: InputMappings) => (changes: ControllerStateChange[]) => {
    const lowerMasks = {
      L5: 1 << 15,
      R5: 1 << 16,
    };

    const upperMasks = {
      L4: 1 << 9,
      R4: 1 << 10,
    };

    for (const change of changes) {
      for (const [label, mask] of Object.entries(lowerMasks)) {
        if ((change.ulButtons & mask) == mask) {
          const wInfo = mappings[label as Label];

          // If bound
          if (wInfo) {
            focusWindow(wInfo.appId, wInfo.windowInfo);
          }
        }
      }

      for (const [label, mask] of Object.entries(upperMasks)) {
        if ((change.ulUpperButtons & mask) == mask) {
          const wInfo = mappings[label as Label];

          // If bound
          if (wInfo) {
            focusWindow(wInfo.appId, wInfo.windowInfo);
          }
        }
      }
    }
  };

function createTriggerListener(mappings: InputMappings) {
  return (SteamClient as SteamClientV2).Input.RegisterForControllerStateChanges(
    handleTrigger(mappings)
  );
}

export function unregisterTriggerListener() {
  (SteamClient as SteamClientV2).Input.UnregisterForControllerStateChanges();
}

export function MappingsContextProvider({
  state,
  children,
}: {
  state: PersistentMappingsState;
  children: React.ReactNode;
}) {
  const [mappings, setMappings] = useState<InputMappings>(state.mappings);
  const [enabled, setEnabled] = useState<boolean>(state.enabled);

  const setMapping = useCallback(
    (label: Label, window: AppWindowInfo) => {
      state.mappings[label] = window;
      setMappings((prev) => ({ ...prev, [label]: window }));
    },
    [state]
  );

  const toggleEnabled = useCallback(() => {
    state.enabled = !state.enabled;
    setEnabled((prevEnabled) => !prevEnabled);
  }, []);

  useEffect(() => {
    if (enabled) {
      unregisterTriggerListener();
      createTriggerListener(mappings);
    } else {
      unregisterTriggerListener();
    }
  }, [enabled, mappings]);

  return (
    <MappingsContext.Provider
      value={{ mappings, setMapping, enabled, toggleEnabled }}
    >
      {children}
    </MappingsContext.Provider>
  );
}
