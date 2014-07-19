scene_mod_list['live_game'].unshift('coui://ui/mods/puppetmaster/live_game.js');

if (window.location.href != 'coui://ui/main/game/live_game/live_game.html') {
  (function() {
    var originalCall = engine.call
    engine.call = function(method) {
      if (method == 'unit.debug.paste') {
        console.log("Sorry, you're a puppet")
        return undefined;
      } else {
        return originalCall.apply(this, arguments);
      }
    }
  })()
}