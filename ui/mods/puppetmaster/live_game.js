(function() {
  "use strict";

  console.log('puppetmaster')

  // Pointer tracking
  var mouseX = 0
  var mouseY = 0
  var hdeck = model.holodeck
  var mousetrack = function(e) {
    mouseX = e.offsetX
    mouseY = e.offsetY
    hdeck = $(this).data('holodeck')
  }

  // sim speed tracking
  var now = function() { return new Date().getTime() }
  var previousSimTime = 0
  var previousUITime = now()
  var simSamples = []
  var uiSamples = []
  var simSpeed = 1

  var base_time = handlers.time
  handlers.time = function(payload) {
    base_time(payload)

    var simStep = (payload.end_time - previousSimTime) * 1000
    previousSimTime = payload.end_time

    if (simStep == 0) {
      return
    }

    var t = now()
    var uiStep = t - previousUITime
    previousUITime = t

    simSamples.unshift(simStep)
    uiSamples.unshift(uiStep)
  }

  var sum = function(a, b) {return a + b}
  var average = function(samples) {
    return samples.reduce(sum, 0) / samples.length
  }
  var summarize = function() {
    simSpeed = Math.max(0.001, average(simSamples) / average(uiSamples))
    simSamples.splice(20)
    uiSamples.splice(20)
  }

  var tick = function() {
    summarize()
    setTimeout(tick, 1000)
  }
  tick()

  // Ping
  var commanderIds = []

  var armyIndex = ko.computed(function() {
    return model.playerControlFlags().indexOf(true)
  })

  model.playerControlFlags.subscribe(function(flags) {
    if (armyIndex() != -1 && !commanderIds[armyIndex()]) {
      setTimeout(api.select.commander, 500)
    }
  })

  var liveGameSelection = handlers.selection
  handlers.selection = function(payload) {
    try {
      if (armyIndex() != -1 && !commanderIds[armyIndex()]) {
        var specs = payload.spec_ids
        var keys = Object.keys(specs)
        if (keys.length == 1) {
          commanderIds[armyIndex()] = specs[keys[0]][0]
          api.select.empty()
          return
        }
      }
    } catch(e) {
      console.error(e.stack)
    }
    liveGameSelection(payload)
  }

  var ping = function(armyIdx, location) {
    hdeck.view.sendOrder({
      units: [commanderIds[armyIdx]],
      command: 'ping',
      location: location,
    })
  }


  // Spectator Announcement, including drop-pod effect
  var lastHover = {name: '', spec: ''}
  var selectedUnit = lastHover

  handlers.puppetmasterUnitSelected = function(spec) {
    var unit = model.unitSpecs[spec]
    selectedUnit = {spec: spec, name: (unit && loc(unit.name)) || 'unknown'}
  }

  var liveGameHover = handlers.hover
  handlers.hover = function(payload) {
    liveGameHover(payload)

    if (payload) {
      lastHover = {spec: payload.spec_id || '', name: loc(payload.name) || 'unknown'}
    }
  }

  var announceGift = function(who, count, what, planet) {
    var where = ''
    if (model.celestialViewModels().length > 2) { // length includes sun
      where = ' on ' + model.celestialViewModels()[planet].name()
    }
    model.send_message("team_chat_message",
      {message: ['Puppetmaster gives', who.name, count.toString(), what].join(' ') + where});

    who.slots.forEach(function(name) {
      api.Panel.message('uberbar', 'sendChat', {
        displayName: name,
        message: [count.toString(), what].join(' ') + where,
      })
    })
  }

  var selectedPlayer = ko.computed(function() {
    if (armyIndex() == -1) {
      return {name: 'nobody', slots: []}
    } else {
      return model.players()[armyIndex()]
    }
  })

  var dropPodSpec = "/pa/puppetmaster/drop_pod_launcher.json"

  var live_game_unit_specs = handlers.unit_specs
  handlers.unit_specs = function(payload) {
    payload[dropPodSpec] = {
      name: 'Drop Pod Launcher',
      sicon_override: 'avatar',
    }
    live_game_unit_specs(payload)
  }

  // Count tracking
  var pasteCount = ko.observable(0)
  pasteCount.subscribe(function(count) {
    api.panels.devmode && api.panels.devmode.message('pasteCount', parseInt(count, 10));
  })
  var pasteUnit = {spec: '', name: ''}
  var pastePlanet = 0
  var pasteReset = null
  var resetCount = function() {
    if (pasteCount() > 0) {
      announceGift(selectedPlayer(), pasteCount(), pasteUnit.name, pastePlanet)
    }

    pasteCount(0)
    clearTimeout(pasteReset)
    pasteReset = null
  }
  var increment = function(n, planet) {
    if (selectedUnit.spec != pasteUnit.spec) {
      resetCount()
    }
    if (planet != pastePlanet) {
      resetCount()
    }
    pasteUnit = selectedUnit
    pastePlanet = planet
    pasteCount(pasteCount() + parseInt(n, 10))
    clearTimeout(pasteReset)
    pasteReset = setTimeout(resetCount, 2000)
  }

  // API Hook
  var engineCall = engine.call
  var puppet = function(method) {
    if (method == 'unit.debug.paste') {
      console.log("Sorry, you're a puppet")
      return undefined;
    } else {
      return engineCall.apply(this, arguments);
    }
  }
  var puppetmaster = function(method) {
    if (method == 'unit.debug.paste') {
      pasteUnits(1)
      return
    } else if (method == 'unit.debug.copy') {
      selectedUnit = lastHover
    } else if (method == 'unit.debug.setSpecId') {
      var spec = arguments[1]
      var unit = model.unitSpecs[spec]
      selectedUnit = {spec: spec, name: (unit && loc(unit.name)) || 'unknown'}
    }

    return engineCall.apply(this, arguments);
  }

  var showAR = true
  action_sets.general.show_hide_ar = function () {
    api.arch.toggleAR()
    showAR = !showAR
  }

  var pasteUnits = function(n) {
    if (!model.cheatAllowCreateUnit()) return
    if (n < 1) return
    if (!selectedUnit.spec || selectedUnit.spec == '') return
    if (armyIndex() == -1) return
    var army_id = model.players()[armyIndex()].id

    var scale = api.settings.getSynchronous('ui', 'ui_scale') || 1.0;

    var x = Math.floor(mouseX * scale);
    var y = Math.floor(mouseY * scale);

    hdeck.raycast(x, y).then(function(result) {
      if (showAR) {
        setTimeout(ping, 4000 / simSpeed, armyIndex(), result)
      }

      var drop = {
        army: army_id,
        what: dropPodSpec,
        planet: result.planet,
        location: result.pos,
      }
      pasteUnits3D(1, drop)
      drop.what = selectedUnit.spec
      setTimeout(pasteUnits3D, 5000 / simSpeed, n, drop)

      increment(n, result.planet)
    })
  }

  var pasteUnits3D = function(n, config) {
    if (!model.cheatAllowCreateUnit()) return
    if (n < 1) return
    if (!config.what || config.what == '') return

    for (var i = 0;i < n;i++) {
      model.send_message('create_unit', config)
    }
  }

  model.pasteBurst = 10
  // stub: for Bulk Paste Units compatibility
  if (action_sets.hacks.bulk_paste_unit.stub) {
    action_sets.hacks.bulk_paste_unit = function() {
      pasteUnits(model.pasteBurst)
    }
  }

  // Power control
  var live_game_server_state = handlers.server_state
  handlers.server_state = function(msg) {
    if (msg.data && msg.data.client && msg.data.client.game_options) {
      if (!msg.data.client.game_options.sandbox && model.isSpectator()) {
        model.send_message("chat_message",
          {message: "Oh Noes! Sandbox isn't on and Puppetmaster won't work"});
      }
      msg.data.client.game_options.sandbox = false
    }

    live_game_server_state.call(this, msg)
  }

  var hasBeenPlayer = !model.isSpectator()

  model.isSpectator.subscribe(function(value) {
    if (value == false) {
      hasBeenPlayer = true
    }
  })

  var enableCheats = function() {
    if (hasBeenPlayer) return

    model.cheatAllowChangeControl(true)
    model.cheatAllowCreateUnit(true)
    model.sandbox(true)
    model.gameOptions.sandbox(true)
    model.reviewMode(false)
    engine.call = puppetmaster
    $('body').on('mousemove', 'holodeck', mousetrack)
    setTimeout(function() {
      api.panels.sandbox && api.panels.sandbox.message('puppetmasterOpenSandbox')
    }, 100)
  }

  var disableCheats = function() {
    model.devMode(false)
    model.cheatAllowChangeControl(false)
    model.cheatAllowCreateUnit(false)
    model.sandbox(false)
    model.gameOptions.sandbox(false)
    engine.call = puppet
    $('body').off('mousemove', 'holodeck', mousetrack)
  }

  var toggleCheats = function() {
    console.log('toggle')
    if (model.cheatAllowCreateUnit()) {
      disableCheats()
    } else {
      enableCheats()
    }
  }

  action_sets.hacks.toggle_puppetmaster = toggleCheats

  // Enable spectator panel updates while open
  var previousPlayerControl = -1
  handlers.puppetmasterSpectatorPanelStatus = function(status) {
    if (model.cheatAllowChangeControl()) {
      if (status) {
        previousPlayerControl = model.playerControlFlags().indexOf(true)
        model.observerModeCalledOnce(false)
        model.startObserverMode()
      } else if (previousPlayerControl != -1) {
        model.reviewMode(false)
        api.panels.devmode.message('puppetmasterRestoreControl', previousPlayerControl)
      }
    }
  }

  model.pasteUnits = pasteUnits

  api.Panel.message('', 'inputmap.reload');
  disableCheats()
})()
