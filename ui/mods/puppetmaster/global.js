(function() {
  // stub: for Bulk Paste Units compatibility
  var stub = function() {}
  stub.stub = true

  action_sets.hacks.toggle_puppetmaster = stub
  api.settings.definitions.keyboard.settings.toggle_puppetmaster = {
    title: 'toggle puppetmaster',
    type: 'keybind',
    set: 'mods',
    display_group: 'mods',
    display_sub_group: 'puppetmaster',
    default: 'alt+ctrl+shift+p'
  }

  action_sets.hacks.bulk_paste_unit = 
    action_sets.hacks.bulk_paste_unit || stub
  api.settings.definitions.keyboard.settings.bulk_paste_unit =
    api.settings.definitions.keyboard.settings.bulk_paste_unit || {
      title: 'bulk paste unit',
      type: 'keybind',
      set: 'mods',
      display_group: 'mods',
      display_sub_group: 'puppetmaster',
      default: 'shift+ctrl+v'
    }
})()

if (window.location.href != 'coui://ui/main/game/live_game/live_game.html') {
  (function() {
    var originalCall = engine.call
    engine.call = function(method) {
      if (method == 'unit.debug.setSpecId') {
        api.Panel.message(api.Panel.parentId, 'puppetmasterUnitSelected', arguments[1]); 
      }

      if (method == 'unit.debug.paste') {
        console.log("Sorry, you're a puppet")
        return undefined;
      } else if (method == 'conn_send_message' &&
                 arguments[1].match('"message_type":"create_unit"')) {
        console.log("Sorry, you're a puppet")
        return undefined;
      } else {
        return originalCall.apply(this, arguments);
      }
    }
  })()
}
