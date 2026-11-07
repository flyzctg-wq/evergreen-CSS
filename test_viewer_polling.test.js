const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");

test("Viewer.html contains stopPoll function and integrates with Socket.io lifecycle", () => {
  const html = fs.readFileSync("Viewer.html", "utf8");

  assert.match(
    html,
    /function stopPoll\(\)\s*\{[\s\S]*clearInterval\(pollTimer\)[\s\S]*pollTimer\s*=\s*null;/,
    "stopPoll should clear pollTimer and set it to null"
  );

  assert.match(
    html,
    /socket\.on\("connect",\s*\(\)\s*=>\s*\{[\s\S]*stopPoll\(\);/,
    "socket connect handler should call stopPoll()"
  );

  assert.match(
    html,
    /socket\.on\("disconnect",\s*\(\)\s*=>\s*\{[\s\S]*startPoll\(\);/,
    "socket disconnect handler should re-enable polling via startPoll()"
  );
});

test("Polling lifecycle state simulation", () => {
  let pollTimer = null;
  let pollCount = 0;

  function startPoll() {
    if (pollTimer) return;
    pollTimer = setInterval(() => {
      pollCount++;
    }, 10);
  }

  function stopPoll() {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
  }

  // Initial boot: start polling
  startPoll();
  assert.ok(pollTimer !== null, "Polling should be active");

  // On Socket.io connect: stop polling
  stopPoll();
  assert.strictEqual(pollTimer, null, "Polling should be stopped on socket connect");

  // On Socket.io disconnect: restart polling
  startPoll();
  assert.ok(pollTimer !== null, "Polling should resume on socket disconnect");

  stopPoll();
  assert.strictEqual(pollTimer, null);
});
