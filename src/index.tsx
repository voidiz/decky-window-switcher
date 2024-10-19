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
  inputs,
  MappingsContext,
  MappingsContextProvider,
  type PersistentMappingsState,
  unregisterTriggerListener,
} from "./mappings";

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
      {inputs.map((input) => {
        const label = `Trigger: ${input.label}`;

        return (
          <PanelSectionRow key={input.label}>
            <DropdownItem
              label={label}
              menuLabel={label}
              rgOptions={windowInfos.map((winfo) => ({
                data: winfo.index,
                label: winfo.windowInfo.strTitle,
              }))}
              selectedOption={mappings[input.label]?.index}
              onChange={({ data }) => {
                setMapping(input.label, windowInfos[data]);
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
      unregisterTriggerListener();
    },
  };
});
