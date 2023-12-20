/* global describe:false */
import { chai } from '@environment-safe/chai';
import { it } from '@open-automaton/moka';
import { Adventure, Rogue, Zelda, Metroid, seed } from '../src/index.mjs';
import { File, Path } from '@environment-safe/file';
import testCases from "./test-cases.json" assert { type: "json" };

const should = chai.should();


describe('procedural-layout', ()=>{
    describe.skip('generic test', ()=>{
        it(`debugging seed`, async ()=>{
            seed('fooz');
            const level = new Roguelike({
                width: 64, // Max Width of the world
                height: 64, // Max Height of the world
                retry: 100, // How many times should we try to add a room?
                special: true, // Should we generate a "special" room?
                room: {
                    ideal: 35, // Give up once we get this number of rooms
                    min_width: 3,
                    max_width: 7,
                    min_height: 3,
                    max_height: 7
                }
            });
            const result = level.render();
            should.exist({});
        });
    });
    
    describe('adventure layout', ()=>{
        testCases.adventure.forEach((testCase)=>{
            it(`correctly generates layout with seed ${testCase.seed}`, async ()=>{
                seed(testCase.seed);
                const fileName = Path.join(
                    '..', 'test-data', `${testCase.seed}-adventure.text`
                );
                const level = new Adventure(testCase.options);
                const result = level.render();
                const file = new File(fileName);
                await file.load();
                const canonical = file.body().cast('string');
                
                canonical.should.equal(result);
                should.exist({});
            });
        }); //*/
    });
    
    describe('rogue layout', ()=>{
        testCases.roguelike.forEach((testCase)=>{
            //*
            it(`correctly generates layout with seed ${testCase.seed}`, async ()=>{
                seed(testCase.seed);
                const fileName = Path.join(
                    '..', 'test-data', `${testCase.seed}-roguelike.text`
                );
                const level = new Rogue(testCase.options);
                const result = level.render();
                const file = new File(fileName);
                await file.load();
                const canonical = file.body().cast('string');
                canonical.should.equal(result);
                should.exist({});
            }); //*/
        });
    });
    
    describe('zelda layout', ()=>{
        testCases.zelda.forEach((testCase)=>{
            it(`correctly generates layout with seed ${testCase.seed}`, async ()=>{
                seed(testCase.seed);
                const fileName = Path.join(
                    '..', 'test-data', `${testCase.seed}-zelda.text`
                );
                const level = new Zelda(testCase.options);
                const result = level.render();
                const file = new File(fileName);
                await file.load();
                const canonical = file.body().cast('string');
                
                canonical.should.equal(result);
                should.exist({});
            });
        }); //*/
    });
    
    describe.skip('metroid layout', ()=>{
        
        it(`debugging layout`, async ()=>{
            seed('foozle');
            const level = new Metroid({
                rooms: 10, 
                keys: 3,
                special: 2,
                width: 20,
                height: 16
            });
            const result = level.render();
            console.log(JSON.stringify(result, null, '  '));
            should.exist({});
        });
    });
});

