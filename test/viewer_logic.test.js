const test = require("node:test");
const assert = require("node:assert");

test("polling control logic stops and resumes correctly", () => {
  let pollTimer = null;
  let pollCount = 0;

  function fakePollCallback() {
    pollCount++;
  }

  function startPoll() {
    if (pollTimer) return;
    pollTimer = setInterval(fakePollCallback, 10);
  }

  function stopPoll() {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
  }

  // Initial state: not polling
  assert.strictEqual(pollTimer, null);

  // Start polling
  startPoll();
  assert.notStrictEqual(pollTimer, null);

  const initialTimer = pollTimer;
  // startPoll is idempotent
  startPoll();
  assert.strictEqual(pollTimer, initialTimer);

  // Stop polling (e.g. on socket connect)
  stopPoll();
  assert.strictEqual(pollTimer, null);

  // stopPoll is idempotent
  stopPoll();
  assert.strictEqual(pollTimer, null);

  // Resume polling (e.g. on socket disconnect)
  startPoll();
  assert.notStrictEqual(pollTimer, null);
  stopPoll();
});
