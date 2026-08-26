const assert = require('node:assert/strict');
const { computeDynamicSeverity, priorityFromScore } = require('../controllers/pipelineController');

const lowExample = {
  urgency: 10,
  duration: 15,
  affected_population: 15,
  vulnerability: 5,
  essential_service: 10,
  recurrence: 5,
};

const criticalExample = {
  urgency: 95,
  duration: 90,
  affected_population: 92,
  vulnerability: 88,
  essential_service: 96,
  recurrence: 85,
};

const lowResult = computeDynamicSeverity(lowExample, 0);
const criticalResult = computeDynamicSeverity(criticalExample, 8);

console.log('LOW:', lowResult.score, lowResult.level, lowResult.priority || priorityFromScore(lowResult.score));
console.log('CRITICAL:', criticalResult.score, criticalResult.level, criticalResult.priority || priorityFromScore(criticalResult.score));

assert.equal(lowResult.level, 'LOW', `Expected LOW for low example, got ${lowResult.level}`);
assert.equal(criticalResult.level, 'CRITICAL', `Expected CRITICAL for critical example, got ${criticalResult.level}`);
assert.ok(lowResult.score < 35, `Low example should stay below medium threshold, got ${lowResult.score}`);
assert.ok(criticalResult.score >= 80, `Critical example should exceed 80, got ${criticalResult.score}`);
assert.equal(priorityFromScore(criticalResult.score), 'CRITICAL');

console.log('Dynamic severity validation passed.');
