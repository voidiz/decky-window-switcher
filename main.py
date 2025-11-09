import struct

# The decky plugin module is located at decky-loader/plugin
# For easy intellisense checkout the decky-loader code repo
# and add the `decky-loader/plugin/imports` path to `python.analysis.extraPaths` in `.vscode/settings.json`
import decky
import asyncio
import hid


def find_dev_path():
    VENDOR_ID = 0x28DE
    PRODUCT_ID = 0x1205

    for d in hid.enumerate():
        # The mouse and keyboard devices have the same VID/PID, but we're not
        # interested in them. Serial number == "" is used as a heuristic to
        # find the controller hidraw device since the mouse and keyboard
        # devices have it set.
        if (
            d["vendor_id"] == VENDOR_ID
            and d["product_id"] == PRODUCT_ID
            and d["serial_number"] == ""
        ):
            return d["path"]

    return None


class Plugin:
    async def listen_for_input(self):
        dev_path = find_dev_path()
        decky.logger.info(f"Listening for input on {dev_path}")
        button_state = {"L4": False, "L5": False, "R4": False, "R5": False}

        with hid.Device(path=dev_path) as dev:
            last_state = 0

            while True:
                data = dev.read(64)
                if not data:
                    continue

                # See https://github.com/libsdl-org/SDL/blob/089dc86bcfebe6737965fcb4db9c36bcb2fbc7da/src/joystick/hidapi/steam/controller_structs.h#L432
                # for reference
                #
                # 4 bytes header
                # 4 bytes unPacketNum
                # 4 bytes ulButtons (contains L5 and R5 on bit 15 and 16 respectively)
                # 4 bytes ulUpperButtons (L4 and R5 on bit 9 and 10 respectively)

                ul_buttons = struct.unpack_from("<I", bytes(data[8:12]))[0]
                l5 = ul_buttons & 1 << 15
                r5 = ul_buttons & 1 << 16
                button_state["L5"] = bool(l5)
                button_state["R5"] = bool(r5)

                ul_upper_buttons = struct.unpack_from("<I", bytes(data[12:16]))[0]
                l4 = ul_upper_buttons & 1 << 9
                r4 = ul_upper_buttons & 1 << 10
                button_state["L4"] = bool(l4)
                button_state["R4"] = bool(r4)

                state = l5 | r5 | l4 | r4
                if state != last_state:
                    last_state = state
                    await decky.emit("button_state_changed", button_state)

    # Asyncio-compatible long-running code, executed in a task when the plugin is loaded
    async def _main(self):
        self.loop = asyncio.get_event_loop()
        decky.logger.info("Loaded decky-window-switcher")

    async def start_input_watcher(self):
        self.loop.create_task(self.listen_for_input())

    # Function called first during the unload process, utilize this to handle your plugin being stopped, but not
    # completely removed
    async def _unload(self):
        decky.logger.info("Unloaded decky-window-switcher")
        pass

    # Function called after `_unload` during uninstall, utilize this to clean up processes and other remnants of your
    # plugin that may remain on the system
    async def _uninstall(self):
        decky.logger.info("Uninstalled decky-window-switcher")
        pass

    # Migrations that should be performed before entering `_main()`.
    async def _migration(self):
        pass
