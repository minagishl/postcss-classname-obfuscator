const postcss = require('postcss');
const assert = require('assert');
const { test } = require('node:test');
const fs = require('fs');
const path = require('path');

// swc is not working properly so npm run build.
const plugin = require('./dist');

const options = {
  // Options
  length: 6,
  method: 'random',
  hashAlgorithm: 'sha512',
  // type: 'nextjs',
  // directory: 'test',
  inspectDirectory: { input: 'test', output: 'test' },
};

async function run(input, opts = {}, type) {
  if (type === 'test') {
    let result = await postcss([plugin(opts)]).process(input, { from: undefined });
    assert.equal(result.warnings().length, 0);
  } else {
    let result = await postcss([plugin(opts)]).process(input, { from: undefined });
    fs.writeFileSync(path.join(__dirname, './test/output.css'), result.css, { flag: 'w' });
    assert.equal(result.warnings().length, 0);
  }
}

const inputCss = fs.readFileSync(path.join(__dirname, './test/input.css'), 'utf8');

test('does something', async () => {
  await run(inputCss, options);
});

// test('speed test', async () => {
//   const iterations = 20;
//   let totalTime = 0;

//   for (let i = 0; i < iterations; i++) {
//     const startTime = Date.now();
//     await run(inputCss, options, 'test');
//     const endTime = Date.now();
//     const elapsedTime = endTime - startTime;
//     totalTime += elapsedTime;
//   }

//   const averageTime = (totalTime / iterations).toFixed(2);
//   console.log(`Average time taken: ${averageTime}ms\n`);
// });
