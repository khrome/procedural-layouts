"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.zelda = exports.Zelda = void 0;
var _adventure = require("./adventure.cjs");
var TILE = {
  VOID: 0,
  FLOOR: 1,
  WALL: 2,
  DOOR: 3,
  SPECIAL_DOOR: 4,
  ENTER: 5,
  EXIT: 6
};
var DEFAULT_RENDER = {
  VOID: ' ',
  FLOOR: '.',
  WALL: '#',
  DOOR: '/',
  SPECIAL_DOOR: 'X',
  ENTER: '>',
  EXIT: '<'
};
const toCharGrid = (string = '') => {
  return string.split('\n').map(line => line.split(''));
};
class Grid {
  constructor(str = '') {
    this.grid = toCharGrid(str);
  }
  overlay(subgrid, y, x) {
    const grid = toCharGrid(subgrid);
    for (let row = 0; row < grid.length; row++) {
      for (let col = 0; col < grid[row].length; col++) {
        //console.log(x+row, y+col);
        if (!this.grid[x + row]) this.grid[x + row] = [];
        this.grid[x + row][y + col] = grid[row][col];
      }
    }
  }
  toString() {
    return this.grid.map(chars => chars.join('')).join('\n');
  }
}
class Zelda {
  constructor(config = {}) {
    this.adventure = new _adventure.Adventure(config);
    this.options = config;
  }
  render(options = {}, blt) {
    var built = blt || this.build();
    var world = built.world;

    //var end = new Date();

    let result = '';
    // Crude mechanism for drawing level
    const MAP = options.map || DEFAULT_RENDER;
    for (var y = 0; y < world.length; y++) {
      var row = '';
      for (var x = 0; x < world[y].length; x++) {
        var tile = parseInt(world[y][x]);
        if (tile === TILE.VOID) {
          row += MAP.VOID;
        } else if (tile === TILE.FLOOR) {
          row += MAP.FLOOR;
        } else if (tile === TILE.WALL) {
          row += MAP.WALL;
        } else if (tile === TILE.DOOR) {
          row += MAP.DOOR;
        } else if (tile === TILE.SPECIAL_DOOR) {
          row += MAP.SPECIAL_DOOR;
        } else if (tile === TILE.ENTER) {
          row += MAP.ENTER;
        } else if (tile === TILE.EXIT) {
          row += MAP.EXIT;
        } else {
          row += world[y][x];
        }
      }
      result += row + '\n';
      //console.log(row + '| ' + y);
    }
    return result;
  }
  renderWorld(options = {}, blt) {
    const opt = name => options[name] || this.options[name];
    const width = opt('width');
    const height = opt('height');
    const built = blt || this.build();
    const generated = built;
    const grid = generated.grid;
    const output = new Grid();
    let rendered = null;
    for (let y = 0; y < generated.size.height; y++) {
      for (let x = 0; x < generated.size.width; x++) {
        let roomId = grid[y][x];
        let room = generated.rooms[roomId];
        if (room) {
          rendered = this.buildRoom({
            doors: room.doors
          });
        } else {
          rendered = this.emptyRoom({});
        }
        output.overlay(rendered, x * width, y * height);
      }
    }
    return output.grid;
  }
  buildRoom(options = {}) {
    const inDoorRange = (n, max, range) => {
      const half = Math.floor(max / 2);
      const odd = !!(max % 2);
      const halfRange = Math.floor(range / 2);
      if (odd) {
        if (n === half && range) {
          //in center
          return true;
        } else {
          if (n < half) {
            return n > half - halfRange;
          } else {
            return n < half + halfRange;
          }
        }
      } else {
        if (n <= half) {
          return n >= half - halfRange;
        } else {
          return n < half + halfRange;
        }
      }
    };
    const opt = name => options[name] || this.options[name];
    const width = opt('width');
    const height = opt('height');
    let lines = [];
    for (let y = 0; y < height; y++) {
      let row = '';
      for (let x = 0; x < width; x++) {
        if (x === 0 || x === width - 1) {
          //TODO: doors
          if (x === 0) {
            if (options.doors.w && inDoorRange(y, height, 2)) {
              row += TILE.DOOR;
            } else {
              row += TILE.WALL;
            }
          } else {
            if (options.doors.e && inDoorRange(y, height, 2)) {
              row += TILE.DOOR;
            } else {
              row += TILE.WALL;
            }
          }
        } else {
          if (y === 0 || y === height - 1) {
            if (y === 0) {
              if (options.doors.n && inDoorRange(x, width, 2)) {
                row += TILE.DOOR;
              } else {
                row += TILE.WALL;
              }
            } else {
              if (options.doors.s && inDoorRange(x, width, 2)) {
                row += TILE.DOOR;
              } else {
                row += TILE.WALL;
              }
            }
          } else {
            row += TILE.FLOOR;
          }
        }
      }
      lines.push(row);
    }
    return lines.join('\n');
  }
  emptyRoom(options = {}) {
    const opt = name => options[name] || this.options[name];
    const width = opt('width');
    const height = opt('height');
    let result = '';
    for (let y = 0; y < height; y++) {
      let row = '';
      for (let x = 0; x < width; x++) {
        row += TILE.VOID;
      }
      result += row + '\n';
    }
    return result;
  }
  build() {
    const adventureBuild = this.adventure.build();
    adventureBuild.world = this.renderWorld({}, adventureBuild);
    return adventureBuild;
  }

  /**
   * Creates a 2D array of VOID tiles
   */
  createVoid() {
    var world = [];
    for (var y = 0; y < this.max_height; y++) {
      world[y] = [];
      for (var x = 0; x < this.max_width; x++) {
        world[y][x] = TILE.VOID;
      }
    }
    this.world = world;
  }
}
exports.Zelda = Zelda;
const zelda = function (config) {
  var level = new Zelda(config);
  return level.build();
};
exports.zelda = zelda;