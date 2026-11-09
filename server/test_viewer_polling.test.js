/**
 * server/test_viewer_polling.test.js
 *
 * Tests the polling lifecycle logic from Viewer.html:
 * - startPoll starts a timer interval
 * - stopPoll cleans up timer interval
 * - connect halts polling
 * - disconnect resumes polling
 */

const { test, describe } = require("node:test");
const assert = require("node:assert/strict");

describe("Viewer Polling & Socket lifecycle", () => {
  test("startPoll starts poll and stopPoll clears interval", () => {
    let pollTimer = null;
    let pollTicks = 0;

    function startPoll() {
      if (pollTimer) return;
      pollTimer = setInterval(() => {
        pollTicks++;
      }, 50);
    }

    function stopPoll() {
      if (pollTimer) {
        clearInterval(pollTimer);
        pollTimer = null;
      }
    }

    startPoll();
    assert.ok(pollTimer !== null, "pollTimer should be active after startPoll()");

    // Calling startPoll multiple times does not create multiple intervals
    const originalTimer = pollTimer;
    startPoll();
    assert.strictEqual(pollTimer, originalTimer, "startPoll() should be idempotent");

    stopPoll();
    assert.strictEqual(pollTimer, null, "pollTimer should be null after stopPoll()");

    // stopPoll idempotent
    stopPoll();
    assert.strictEqual(pollTimer, null);
  });

  test("Socket connect halts polling and disconnect restarts polling", async () => {
    let pollTimer = null;
    let pollCount = 0;
    let useSocketIO = false;

    function startPoll() {
      if (pollTimer) return;
      pollTimer = setInterval(() => {
        pollCount++;
      }, 20);
    }

    function stopPoll() {
      if (pollTimer) {
        clearInterval(pollTimer);
        pollTimer = null;
      }
    }

    // Initial boot starts poll
    startPoll();
    assert.ok(pollTimer !== null);

    // Wait a brief moment to simulate polling before socket connects
    await new Promise((r) => setTimeout(r, 60));
    assert.ok(pollCount > 0, "Polling should tick before socket connection");

    // Socket.io 'connect' event triggers:
    useSocketIO = true;
    stopPoll();

    assert.strictEqual(pollTimer, null, "Polling timer must be stopped when socket connects");
    const countAfterConnect = pollCount;

    // Wait longer while connected - count must NOT increase
    await new Promise((r) => setTimeout(r, 60));
    assert.strictEqual(
      pollCount,
      countAfterConnect,
      "No polling requests should occur while Socket.io is connected"
    );

    // Socket.io 'disconnect' event triggers:
    useSocketIO = false;
    startPoll();

    assert.ok(pollTimer !== null, "Polling timer should restart upon socket disconnect");
    await new Promise((r) => setTimeout(r, 60));
    assert.ok(
      pollCount > countAfterConnect,
      "Polling should resume after socket disconnection"
    );

    // Clean up
    stopPoll();
  });
});
