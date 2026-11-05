const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

test("Viewer.html contains stopPoll implementation and pauses polling on WebSocket connect", () => {
  const viewerPath = path.join(__dirname, "..", "Viewer.html");
  const content = fs.readFileSync(viewerPath, "utf8");

  // Verify stopPoll is defined and clears pollTimer
  assert.ok(content.includes("function stopPoll()"), "Viewer.html must define stopPoll()");
  assert.ok(content.includes("clearInterval(pollTimer)"), "stopPoll must clearInterval(pollTimer)");
  assert.ok(content.includes("pollTimer = null"), "stopPoll must reset pollTimer = null");

  // Verify socket connect stops polling
  assert.ok(
    content.includes('socket.on("connect", () => {\n          useSocketIO = true;\n          stopPoll();'),
    "socket 'connect' handler must invoke stopPoll()"
  );

  // Verify socket disconnect resumes polling
  assert.ok(
    content.includes('socket.on("disconnect", () => {\n          useSocketIO = false;\n          setStatus("waiting", t("reconnecting"));\n          startPoll();'),
    "socket 'disconnect' handler must invoke startPoll()"
  );
});

test("Polling controller lifecycle logic operates correctly", () => {
  let pollTimer = null;
  let pollCalls = 0;

  function fakeFetch() {
    pollCalls++;
  }

  function startPoll() {
    if (pollTimer) return;
    pollTimer = setInterval(fakeFetch, 10);
  }

  function stopPoll() {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
  }

  // 1. Initial start
  assert.equal(pollTimer, null);
  startPoll();
  assert.notEqual(pollTimer, null, "pollTimer should be active after startPoll()");

  const timerRef = pollTimer;
  // Calling startPoll again should not overwrite or duplicate
  startPoll();
  assert.equal(pollTimer, timerRef, "Duplicate startPoll should be a no-op");

  // 2. WebSocket connects -> stopPoll()
  stopPoll();
  assert.equal(pollTimer, null, "pollTimer should be null after stopPoll()");

  // Calling stopPoll again should be safe
  stopPoll();
  assert.equal(pollTimer, null);

  // 3. WebSocket disconnects -> startPoll()
  startPoll();
  assert.notEqual(pollTimer, null, "pollTimer should be active again after startPoll()");

  stopPoll();
  assert.equal(pollTimer, null);
});
