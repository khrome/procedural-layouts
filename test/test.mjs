/* global describe:false */
import { chai } from '@environment-safe/chai';
import { it } from '@open-automaton/moka';
import { Adventure, Roguelike, seed } from '../src/index.mjs';
import { File, Path } from '@environment-safe/file';
import testCases from "./test-cases.json" assert { type: "json" };

const should = chai.should();


describe('procedural-layout', ()=>{
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
        });
    });
    
    describe('roguelike layout', ()=>{
        testCases.roguelike.forEach((testCase)=>{
            it(`correctly generates layout with seed ${testCase.seed}`, async ()=>{
                seed(testCase.seed);
                const fileName = Path.join(
                    '..', 'test-data', `${testCase.seed}-roguelike.text`
                );
                const level = new Roguelike(testCase.options);
                const result = level.render();
                const file = new File(fileName);
                await file.load();
                const canonical = file.body().cast('string');
                canonical.should.equal(result);
                should.exist({});
            });
        });
    });
});

