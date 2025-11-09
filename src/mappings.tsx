import React, { createContext, useCallback, useState } from "react";

import type { AppWindowInfo } from "./window";
import type { TriggerButton } from "./input";

export type Label = TriggerButton;

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

export const MappingsContext = createContext<MappingsState>({
  mappings: {},
  setMapping: (_label: Label, _window: AppWindowInfo) => {},
  enabled: true,
  toggleEnabled: () => {},
});

export function MappingsContextProvider({
  state,
  children,
}: {
  state: PersistentMappingsState;
  children: React.ReactNode;
}) {
  const [mappings, setMappings] = useState<InputMappings>(state.mappings);
  const [enabled, setEnabled] = useState<boolean>(state.enabled);

  const setMapping = useCallback((label: Label, window: AppWindowInfo) => {
    state.mappings[label] = window;
    setMappings((prev) => ({ ...prev, [label]: window }));
  }, []);

  const toggleEnabled = useCallback(() => {
    state.enabled = !state.enabled;
    setEnabled((prevEnabled) => !prevEnabled);
  }, []);

  return (
    <MappingsContext.Provider
      value={{ mappings, setMapping, enabled, toggleEnabled }}
    >
      {children}
    </MappingsContext.Provider>
  );
}
