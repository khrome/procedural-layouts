import fs from 'fs';
import path from 'path';
import { Adventure, Roguelike } from '../src/index.mjs';
import { seed } from '../src/random.mjs';
import testCases from "./test-cases.json" assert { type: "json" };

testCases.adventure.forEach((testCase)=>{
    seed(testCase.seed);
    const result = (new Adventure(testCase.options)).render();
    const fileName = `test-data/${testCase.seed}-adventure.text`;
    console.log(fileName, result);
    fs.writeFileSync(
        fileName, 
        result
    );
});

testCases.roguelike.forEach((testCase)=>{
    seed(testCase.seed);
    const result = (new Roguelike(testCase.options)).render();
    const fileName = `./test-data/${testCase.seed}-roguelike.text`;
    console.log(fileName, result);
    fs.writeFileSync(
        fileName, 
        result
    );
});