import {
  PanelSection,
  staticClasses,
  DropdownItem,
  ToggleField,
  PanelSectionRow,
} from "@decky/ui";
import { definePlugin } from "@decky/api";
import { useContext, useEffect, useState } from "react";
import { FaRegWindowRestore } from "react-icons/fa";

import { type AppWindowInfo, getWindowInfos } from "./window";
import {
  MappingsContext,
  MappingsContextProvider,
  type PersistentMappingsState,
} from "./mappings";
import {
  createTriggerListener,
  startInputWatcher,
  TRIGGER_BUTTONS,
  unregisterTriggerListener,
} from "./input";

function Content() {
  const { mappings, setMapping, enabled, toggleEnabled } =
    useContext(MappingsContext);

  const [windowInfos, setWindowInfos] = useState<AppWindowInfo[]>([]);

  useEffect(() => {
    (async function () {
      const wInfos = await getWindowInfos();
      setWindowInfos(wInfos);
    })();
  }, []);

  return (
    <PanelSection title="Mappings">
      <PanelSectionRow>
        <ToggleField
          label="Enable"
          bottomSeparator="standard"
          checked={enabled}
          onChange={toggleEnabled}
        />
      </PanelSectionRow>
      {TRIGGER_BUTTONS.map((button) => {
        const label = `Trigger: ${button}`;
        const currentWindowId = mappings[button]?.windowInfo.windowid;
        const currentIndex = windowInfos.findIndex(
          (info) => info.windowInfo.windowid == currentWindowId
        );

        return (
          <PanelSectionRow key={button}>
            <DropdownItem
              label={label}
              menuLabel={label}
              rgOptions={windowInfos.map((winfo, index) => ({
                data: index,
                label: winfo.windowInfo.strTitle,
              }))}
              selectedOption={currentIndex != -1 ? currentIndex : undefined}
              onChange={({ data }) => {
                setMapping(button, windowInfos[data]);
              }}
            />
          </PanelSectionRow>
        );
      })}
    </PanelSection>
  );
}

export default definePlugin(() => {
  const state: PersistentMappingsState = {
    mappings: {},
    enabled: true,
  };

  createTriggerListener(state);
  startInputWatcher();

  return {
    // The name shown in various decky menus
    name: "Window Switcher",
    // The element displayed at the top of your plugin's menu
    titleView: <div className={staticClasses.Title}>Window Switcher</div>,
    // The content of your plugin's menu
    content: (
      <MappingsContextProvider state={state}>
        <Content />
      </MappingsContextProvider>
    ),
    alwaysRender: true,
    // The icon displayed in the plugin list
    icon: <FaRegWindowRestore />,
    // The function triggered when your plugin unloads
    onDismount() {
      console.log("Unloading decky-window-switcher");
      unregisterTriggerListener();
    },
  };
});
