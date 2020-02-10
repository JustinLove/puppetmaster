## 3.3.0

- Forward unit changes to Bulk Paste Units
- Improve capture of unit info when rapidly changing units
- Use engine sim speed instead of local estimation

## 3.2.2

- Fix player names in gift announcments when rapidly changing players

## 3.2.1

- Fix image paths in player guide topic

## 3.2.0

- Changed interface with Bulk Create Units
- Enhanced security on unit creation

## 3.1.0

- Private chat message to players who receive gifts, if the puppetmaster has client mod support
- Include planet name in announcements in multi-planet systems
- Chat announcement in-game if sandbox mode wasn't turned on
- Ping/paste delay times account for sim speed
- Remove ping toggle on icon visiblity; pings aren't visible with icons off anyway.
- Add mod icon.
- Missed some flare puppet code
- raycast fixed, don't need own version anymore

## 3.0.0

- Extract preloaded nukes to separate mod
- Replace burntcustard's venerable drop pod effect with processed version, which has team colored laser sights.
- Remove local flare effect
- Account for scaled UI
- Add game-mode category tag

## 2.3.0

- Flares and pings will not be generated if strategic icons are turned off (default ctrl+y) The icon API is write-only; if it gets out of sync turn icons on (default state) and refresh the UI.

## 2.2.0

- Switch to titans nuke cost
- Fix changed api name
- Drop pods trigger combat alerts; it has the uber/avatar icon but may be lost in existing combats

## 2.1.0

- Use new raycast api to get location instead of drop pod death event
- Looks there may have been a longstanding issue with drops on other planets
- Ping is not as far ahead of unit appearance
- Immediate flare effect for puppetmaster

## 2.0.1

- Update help article for 82293

## 2.0.0

- Remove obsolete cheat triggers.  Sandbox option now required.
- Attempt to block sandbox related UI elements
- Use PAMM for scene mod loading
- Remove common.js shadow

## 1.5.2

- Update common.js to 78071

## 1.5.1

- Update for underwater sight on launchers

## 1.5.0

- Support Server Mod Help Chat
- Support Mod Help Player Guide

## 1.4.4

- Update common.js to 76456

## 1.4.3

- Update common.js to 75539

## 1.4.2

- Always define a handler on the main execution so events are sent to the scene

## 1.4.1

- Fix a conflict with alertsManager (in PAStats, among others)
- Fix incorrect announcements when rapidly switching units (mostly the radar/energy combo from the tournment)

## 1.4.0

- Units appear at end of drop pod effect
- Drop pod mechanism changed from death effect to noop death weapon
- Avatar factory tweaks removed
- Shadowed Nuke/Antinuke specs updated in line with 73939
- Update common.js to 73939 (local server port)

## 1.3.0

- Update common.js to match 72996
- Correct forum url to release topic
- Keybinding group changed due to localization; move to 'Mods'
- Update readme
- Ensure pasteCount is an integer

## 1.2.0

- Updated shadowed common.js to match 72332
- Support localization of unit names

## 1.1.0

- Major updates to stock common.js
- Update for change in keybind settings circa 71378
- Auto-open sandbox needs a small delay
