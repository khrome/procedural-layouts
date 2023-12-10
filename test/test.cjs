const { chai } = require('@environment-safe/chai');
const { it } = require('@open-automaton/moka');
const should = require('chai').should();
const fs = require('fs');
const { File, Path } = require('@environment-safe/file');
const { Adventure, Roguelike, seed } = require('../dist/index.cjs');
const testCases = require('./test-cases.json');


describe('procedural-layout', ()=>{
    describe('adventure layout', ()=>{
        testCases.adventure.forEach((testCase)=>{
            it(`correctly generates layout with seed ${testCase.seed}`, async ()=>{
                seed(testCase.seed);
                const fileName = `../test-data/${testCase.seed}-adventure.text`;
                const level = new Adventure(testCase.options);
                const result = level.render();
                //fs.promise.readFile()
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
                const fileName = `../test-data/${testCase.seed}-roguelike.text`;
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

