import { callable } from "@decky/api";
import { addEventListener, removeEventListener } from "@decky/api";

import { Label, PersistentMappingsState } from "./mappings";
import { focusWindow } from "./window";

export const TRIGGER_BUTTONS = ["L4", "L5", "R4", "R5"] as const;

export type TriggerButton = (typeof TRIGGER_BUTTONS)[number];
export type TriggerState = Record<TriggerButton, boolean>;

export const startInputWatcher = callable<[], void>("start_input_watcher");

let TRIGGER_HANDLER: ((triggerState: TriggerState) => void) | null = null;

const handleTrigger =
  (state: PersistentMappingsState) => (triggerState: TriggerState) => {
    if (!state.enabled) {
      return;
    }

    for (const [label, active] of Object.entries(triggerState)) {
      if (!active) {
        continue;
      }

      const wInfo = state.mappings[label as Label];

      // If bound
      if (wInfo) {
        focusWindow(wInfo.appId, wInfo.windowInfo);
      }
    }
  };

export function createTriggerListener(state: PersistentMappingsState) {
  TRIGGER_HANDLER = addEventListener(
    "button_state_changed",
    handleTrigger(state)
  );
}

export function unregisterTriggerListener() {
  if (TRIGGER_HANDLER !== null) {
    removeEventListener<[TriggerState]>(
      "button_state_changed",
      TRIGGER_HANDLER
    );
  }
}
