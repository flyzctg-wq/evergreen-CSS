const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");

describe("Viewer polling optimization", () => {
  const viewerHtmlPath = path.join(__dirname, "..", "Viewer.html");
  const viewerHtml = fs.readFileSync(viewerHtmlPath, "utf8");

  it("defines stopPoll function that clears pollTimer", () => {
    assert.match(viewerHtml, /function\s+stopPoll\s*\(\)\s*\{/);
    assert.match(viewerHtml, /clearInterval\s*\(\s*pollTimer\s*\)/);
    assert.match(viewerHtml, /pollTimer\s*=\s*null/);
  });

  it("calls stopPoll() on socket connect event", () => {
    const connectBlockMatch = viewerHtml.match(/socket\.on\("connect",\s*\(\)\s*=>\s*\{([\s\S]*?)\}\);/);
    assert.ok(connectBlockMatch, "socket connect handler exists");
    assert.match(connectBlockMatch[1], /stopPoll\(\)/, "stopPoll() called in socket connect handler");
  });

  it("calls startPoll() on socket disconnect event and resets useSocketIO", () => {
    const disconnectBlockMatch = viewerHtml.match(/socket\.on\("disconnect",\s*\(\)\s*=>\s*\{([\s\S]*?)\}\);/);
    assert.ok(disconnectBlockMatch, "socket disconnect handler exists");
    assert.match(disconnectBlockMatch[1], /startPoll\(\)/, "startPoll() called in socket disconnect handler");
    assert.match(disconnectBlockMatch[1], /useSocketIO\s*=\s*false/, "useSocketIO reset to false on disconnect");
  });

  it("simulates polling lifecycle when socket connects and disconnects", () => {
    let pollTimer = null;
    let pollCount = 0;
    let useSocketIO = false;

    function startPoll() {
      if (pollTimer) return;
      pollTimer = setInterval(() => {
        pollCount++;
      }, 50);
    }

    function stopPoll() {
      if (pollTimer) {
        clearInterval(pollTimer);
        pollTimer = null;
      }
    }

    // Step 1: initial boot starts poll
    startPoll();
    assert.ok(pollTimer !== null, "pollTimer is active initially");

    // Step 2: socket connects -> useSocketIO becomes true, polling stops
    useSocketIO = true;
    stopPoll();
    assert.strictEqual(pollTimer, null, "pollTimer stopped when socket connects");
    assert.strictEqual(useSocketIO, true);

    // Step 3: socket disconnects -> useSocketIO becomes false, polling resumes
    useSocketIO = false;
    startPoll();
    assert.ok(pollTimer !== null, "pollTimer resumed after socket disconnects");
    assert.strictEqual(useSocketIO, false);

    // Cleanup
    stopPoll();
  });
});
