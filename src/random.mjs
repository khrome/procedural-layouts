/*
import { isBrowser, isJsDom } from 'browser-or-node';
import * as mod from 'module';
import * as path from 'path';
let internalRequire = null;
if(typeof require !== 'undefined') internalRequire = require;
const ensureRequire = ()=> (!internalRequire) && (internalRequire = mod.createRequire(import.meta.url));
//*/

/**
* A JSON object
* @typedef { object } JSON
*/

'use strict';

var width = 256;// each RC4 output is 0 <= x < 256
var chunks = 6;// at least six RC4 outputs for each double
var digits = 52;// there are 52 significant digits in a double
var pool = [];// pool: entropy pool starts empty
var GLOBAL = typeof global === 'undefined' ? window : global;

//
// The following constants are related to IEEE 754 limits.
//
var startdenom = Math.pow(width, chunks),
    significance = Math.pow(2, digits),
    overflow = significance * 2,
    mask = width - 1;


var oldRandom = Math.random;

//
// seedrandom()
// This is the seedrandom function described above.
//
export const seedrandom = function(seed, options) {
    if (options && options.global === true) {
        options.global = false;
        Math.random = seedrandom(seed, options);
        options.global = true;
        return Math.random;
    }
    var use_entropy = (options && options.entropy) || false;
    var key = [];

    // Flatten the seed string or build one from local entropy if needed.
    /*var shortseed = */mixkey(flatten(
        use_entropy ? [seed, tostring(pool)] :
            0 in arguments ? seed : autoseed(), 
        3
    ), key);

    // Use the seed to initialize an ARC4 generator.
    var arc4 = new ARC4(key);

    // Mix the randomness into accumulated entropy.
    mixkey(tostring(arc4.S), pool);

    // Override Math.random

    // This function returns a random double in [0, 1) that contains
    // randomness in every bit of the mantissa of the IEEE 754 value.

    return function() {              // Closure to return a random double:
        var n = arc4.g(chunks),      // Start with a numerator n < 2 ^ 48
            d = startdenom,      //     and denominator d = 2 ^ 48.
            x = 0;               //     and no 'extra last byte'.
        while (n < significance) {   // Fill up all significant digits by
            n = (n + x) * width;     //     shifting numerator and
            d *= width;              //     denominator and generating a
            x = arc4.g(1);           //     new least-significant-byte.
        }
        while (n >= overflow) {      // To avoid rounding up, before adding
            n /= 2;                  //    last byte, shift everything
            d /= 2;                  //    right using integer Math until
            x >>>= 1;                //    we have exactly the desired bits.
        }
        return (n + x) / d;                                 // Form the number within [0, 1).
    };
};

export const resetGlobal = function () {
    Math.random = oldRandom;
};

//
// ARC4
//
// An ARC4 implementation.  The constructor takes a key in the form of
// an array of at most (width) integers that should be 0 <= x < (width).
//
// The g(count) method returns a pseudorandom integer that concatenates
// the next (count) outputs from ARC4.  Its return value is a number x
// that is in the range 0 <= x < (width ^ count).
//
/** @constructor */
function ARC4(key) {
    var t, keylen = key.length,
        me = this, i = 0, j = me.i = me.j = 0, s = me.S = [];

    // The empty key [] is treated as [0].
    if (!keylen) { key = [keylen++]; }

    // Set up S using the standard key scheduling algorithm.
    while (i < width) {
        s[i] = i++;
    }
    for (i = 0; i < width; i++) {
        s[i] = s[j = mask & (j + key[i % keylen] + (t = s[i]))];
        s[j] = t;
    }

    // The "g" method returns the next (count) outputs as one number.
    (me.g = function(count) {
        // Using instance members instead of closure state nearly doubles speed.
        var t, r = 0,
            i = me.i, j = me.j, s = me.S;
        while (count--) {
            t = s[i = mask & (i + 1)];
            r = r * width + s[mask & ((s[i] = s[j = mask & (j + t)]) + (s[j] = t))];
        }
        me.i = i; me.j = j;
        return r;
        // For robust unpredictability discard an initial batch of values.
        // See http://www.rsa.com/rsalabs/node.asp?id=2009
    })(width);
}

//
// flatten()
// Converts an object tree to nested arrays of strings.
//
function flatten(obj, depth) {
    var result = [], typ = (typeof obj)[0], prop;
    if (depth && typ == 'o') {
        for (prop in obj) {
            //eslint-disable-next-line  no-empty
            try { result.push(flatten(obj[prop], depth - 1)); } catch (e) {}
        }
    }
    return (result.length ? result : typ == 's' ? obj : obj + '\0');
}

//
// mixkey()
// Mixes a string seed into a key that is an array of integers, and
// returns a shortened string seed that is equivalent to the result key.
//
function mixkey(seed, key) {
    var stringseed = seed + '', smear, j = 0;
    while (j < stringseed.length) {
        key[mask & j] =
            mask & ((smear ^= key[mask & j] * 19) + stringseed.charCodeAt(j++));
    }
    return tostring(key);
}

//
// autoseed()
// Returns an object for autoseeding, using window.crypto if available.
//
/** @param {Uint8Array=} seed */
function autoseed(seed) {
    try {
        GLOBAL.crypto.getRandomValues(seed = new Uint8Array(width));
        return tostring(seed);
    } catch (e) {
        return [+new Date, GLOBAL, GLOBAL.navigator && GLOBAL.navigator.plugins,
            GLOBAL.screen, tostring(pool)];
    }
}

//
// tostring()
// Converts an array of charcodes to a string
//
function tostring(a) {
    return String.fromCharCode.apply(0, a);
}

//
// When seedrandom.js is loaded, we immediately mix a few bits
// from the built-in RNG into the entropy pool.  Because we do
// not want to intefere with determinstic PRNG state later,
// seedrandom will not call Math.random on its own again after
// initialization.
//
mixkey(Math.random(), pool);

//eslint-disable-next-line no-useless-escape
const DICE = /^(?:(\d+)?d(\d+))?\s*([\+\-])?\s*(\d+)?$/;

const rand = seedrandom;
class Random{
    constructor(options={}){
        this.options = options;
        this.rnd = rand(options.seed || 'default');
    }
    
    ratio(){
        return this.rnd();
    }
    
    float(upperBound=Number.MAX_VALUE, lowerBound=0){
        const delta = upperBound - lowerBound;
        return lowerBound + delta * this.rnd();
    }
    
    integer(upperBound=Math.floor(Number.MAX_VALUE), lowerBound=0){
        return Math.floor(this.float(upperBound, lowerBound));
    }
    
    array(array){
        return array[this.integer(array.length)];
    }
    
    string(parts, max){
        const numParts = this.integer(max);
        let lcv=0;
        let result = '';
        for(;lcv < numParts; lcv++){
            result += this.array(parts);
        }
        return result;
    }
    
}
const seedValue = (Math.random() + 1).toString(36).substring(7);
let randomInstance = new Random({seed: seedValue});

/**
 * Clones and sorts an array randomly
 */
export const shuffle = (arr)=>{
    let res = arr.slice(0);
    for (let j, x, i = res.length; i; j = Math.floor(randomInstance.float() * i), x = res[--i], res[i] = res[j], res[j] = x);
    return res;
};
    
export const random=()=>{ //simple Math.random() replacement
    const r = randomInstance.ratio();
    return r;
};
    
export const seed = (seed)=>{
    randomInstance = new Random({seed});
    //const r = randomInstance.ratio();
    //console.log('RAT', r)
};

/**
 * Clones an array, keeps order but shifts the results. E.g.
 * 0,1,2,3 -> 2,3,0,1
 */
export const shift = (arr)=>{
    let res = arr.slice(0);
    return res.splice(this.range(0, res.length)).concat(res);
};

/**
 * Get a random integer between min and max, inclusive
 */
export const range = (min, max)=>{
    return Math.floor(randomInstance.float() * ((max+1) - min)) + min;
};

/**
 * Get a random element from an array
 */
export const element = (arr)=>{
    return arr[Math.floor(randomInstance.float() * arr.length)];
};

/**
 * Like element(), but with matching weight array
 *
 * Usage: fn([1,2,3,4], [50, 100, 50, 10]);
 */
export const elementWeighted =(collection, weights)=>{
    if (collection.length !== weights.length) {
        return null;
    }

    weights = weights.slice(0);

    let total = 0;

    // Each value is now the sum of itself and predecessors
    for (let i = 0; i < weights.length; i++) {
        total += weights[i];
        weights[i] = total;
    }

    let strata = randomInstance.float() * total;
    let element = null;

    for (let i = 0; i < weights.length; i++) {
        if (strata <= weights[i]) {
            element = i;
            break;
        }
    }

    if (element === null) {
        return null;
    }

    return collection[element];
};

/**
 * Simulates a dice roll. E.g. 3d8 - 4
 * Accepts: d6, 1d6, 1d6+1, 1d6-1
 * Also accepts constants: -3, 17
 * Whitespace will be stripped out
 * Operators allowed are + and - only.
 */
export const dice = (syntax, allowNegative = false)=>{
    const result = DICE.exec(syntax);

    if (!result) {
        throw new TypeError(`Invalid dice syntax: ${syntax}`);
    }


    let [, count, size, operator, mod] = result;

    size = Number(size) || 0;
    count = Number(count) || 0;
    mod = Number(mod) || 0;

    if (!count && size) count = 1;

    let total = 0;

    if (size) {
        for (let i = 0; i < count; i++) {
            total += this.range(1, size);
        }
    }

    if (!operator && mod || operator === '+') {
        total += mod;
    } else if (operator === '-') {
        total -= mod;
    }

    if (total < 0 && !allowNegative) {
        total = 0;
    }

    return total;
};

/**
 * Make a boolean decision based on a probability threshold
 */
export const decide = (threshold)=>{
    if (threshold >= 1) {
        return true;
    }

    if (threshold <= 0) {
        return false;
    }

    return randomInstance.float() <= threshold;
};

