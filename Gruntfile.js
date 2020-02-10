var spec = require('./lib/spec')
var prompt = require('prompt')
prompt.start()

var modPath = '../../server_mods/com.wondible.pa.puppetmaster/'
//var modPath = '../../client_mods/com.wondible.pa.puppetmaster.client/'
var stream = 'stable'
var media = require('./lib/path').media(stream)
var hack = require('./lib/path').media('hack')
var build = 'ui/main/shared/js/build.js'
var drop_pod = 'pa/puppetmaster/drop_pod.pfx'
var live_game = 'ui/mods/puppetmaster/live_game.js'
var live_game_devmode = 'ui/mods/puppetmaster/live_game_devmode.js'
var live_game_players = 'ui/mods/puppetmaster/live_game_players.js'
var live_game_sandbox = 'ui/mods/puppetmaster/live_game_sandbox.js'

module.exports = function(grunt) {
  // Project configuration.
  grunt.initConfig({
    copy: {
      back: {
        files: [
          {
            src: modPath + live_game,
            dest: live_game,
          },
          {
            src: modPath + live_game_devmode,
            dest: live_game_devmode,
          },
          {
            src: modPath + live_game_players,
            dest: live_game_players,
          },
          {
            src: modPath + live_game_sandbox,
            dest: live_game_sandbox,
          },
        ],
      },
      mod: {
        files: [
          {
            src: [
              'modinfo.json',
              'LICENSE.txt',
              'README.md',
              'CHANGELOG.md',
              'com.wondible.pa.puppetmaster/**',
              'icon.png',
              'ui/**',
              'pa/**'],
            dest: modPath,
          },
        ],
      },
      hack: {
        files: [
          {
            src: drop_pod,
            dest: hack + drop_pod,
          },
        ],
      },
    },
    jsonlint: {
      all: {
        src: [
          'pa/ammo/**/*.json',
          'pa/tools/**/*.json',
          'pa/units/**/*.json'
        ]
      },
    },
    json_schema: {
      all: {
        files: {
          'lib/schema.json': [
            'pa/ammo/**/*.json',
            'pa/tools/**/*.json',
            'pa/units/**/*.json'
          ]
        },
      },
    },
    proc: {
      droppod: {
        src: [
          'pa/effects/specs/default_commander_landing.pfx'
        ],
        cwd: media,
        dest: drop_pod,
        process: function(spec) {
          spec.emitters = spec.emitters.filter(function(emit) {
            // white shell / smoke shell
            return emit.spec.papa != '/pa/effects/fbx/particles/sphere_ico16seg.papa' &&
              emit.spec.shader != 'meshParticle_clip_smoke_bend'
          })
          spec.emitters.forEach(function(emit) {
            if (emit.spec.baseTexture == '/pa/effects/textures/particles/ring.papa') {
              emit.spec.red = emit.spec.green = emit.spec.blue = 2
              emit.useArmyColor = 1
            } else if (emit.spec.baseTexture == '/pa/effects/textures/particles/flat.papa') {
              emit.spec.green = emit.spec.red
              emit.spec.blue = emit.spec.red
              emit.useArmyColor = 1
              emit.lifetime = emit.emitterLifetime = 5
              emit.spec.sizeY = [[0, 0], [0.1, 1], [0.3, 1], [1,0]]
            } else if (emit.spec.baseTexture == '/pa/effects/textures/particles/sharp_flare.papa' && emit.offsetZ == 900) {
              emit.spec.red = emit.spec.green = emit.spec.blue = 1
              if (emit.sizeX > 75) {
                emit.useArmyColor = 1
              } else {
                emit.useArmyColor = 2
              }
            } else if (emit.spec.baseTexture == '/pa/effects/textures/particles/softSmoke.papa' && emit.type == 'Cylinder_Z') {
              // large expanding dust
              emit.alpha[0][1] = 0.15
            } else if (emit.spec.shape == 'pointlight') {
              // bright blusih glow
              emit.alpha = 0.05
            }
          })
          return spec
        }
      },
    }
  });

  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-jsonlint');
  grunt.loadNpmTasks('grunt-json-schema');

  grunt.registerMultiTask('proc', 'Process unit files', function() {
    if (this.data.targets) {
      var specs = spec.copyPairs(grunt, this.data.targets, media)
      spec.copyUnitFiles(grunt, specs, this.data.process)
    } else {
      var specs = this.filesSrc.map(function(s) {return grunt.file.readJSON(media + s)})
      var out = this.data.process.apply(this, specs)
      grunt.file.write(this.data.dest, JSON.stringify(out, null, 2))
    }
  })

  // Default task(s).
  grunt.registerTask('default', ['proc', 'copy:mod']);

};

