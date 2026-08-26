const assert = require('node:assert/strict');
const { scoreSemanticDuplicate } = require('../services/aiEngine');

const waterA = 'No water supply in Ward 12 for three days';
const waterB = 'Water not available in ward 12, pipeline issue and no drinking water for days';
const roadC = 'Pothole on Main Road near the bus stand';
const lightD = 'Streetlight not working on Main Road near the school';

const ab = scoreSemanticDuplicate(waterA, waterB);
const ac = scoreSemanticDuplicate(waterA, roadC);
const ad = scoreSemanticDuplicate(waterA, lightD);

console.log(`A-B: ${ab.toFixed(4)}`);
console.log(`A-C: ${ac.toFixed(4)}`);
console.log(`A-D: ${ad.toFixed(4)}`);

assert.ok(ab > ac, `True duplicate should outrank unrelated road complaint (A-B=${ab}, A-C=${ac})`);
assert.ok(ab > ad, `True duplicate should outrank different service complaint (A-B=${ab}, A-D=${ad})`);
assert.ok(ab > 0.45, `Water duplicate should exceed threshold (score=${ab})`);
assert.ok(ac < 0.3, `Road complaint should remain below the duplicate threshold (score=${ac})`);
assert.ok(ad < 0.3, `Streetlight complaint should remain below the duplicate threshold (score=${ad})`);

console.log('Semantic duplicate validation passed.');
