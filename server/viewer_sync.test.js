const test = require("node:test");
const assert = require("node:assert");

// Simulates the viewer polling and socket lifecycle implemented in Viewer.html
function createViewerSyncManager() {
  let pollTimer = null;
  let pollCount = 0;
  let useSocketIO = false;
  let status = "connecting";

  function startPoll() {
    if (pollTimer) return;
    pollTimer = setInterval(() => {
      pollCount++;
    }, 1000);
  }

  function stopPoll() {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
  }

  function onSocketConnect() {
    useSocketIO = true;
    stopPoll();
    status = "live";
  }

  function onSocketDisconnect() {
    status = "waiting";
    startPoll();
  }

  function onSocketError() {
    useSocketIO = false;
    status = "waiting";
    startPoll();
  }

  return {
    startPoll,
    stopPoll,
    onSocketConnect,
    onSocketDisconnect,
    onSocketError,
    isPolling: () => pollTimer !== null,
    getStatus: () => status,
    isSocketActive: () => useSocketIO,
    cleanup: () => stopPoll()
  };
}

test("Viewer sync starts polling initially and halts polling when WebSocket connects", () => {
  const sync = createViewerSyncManager();

  // Initially starts polling as backup
  sync.startPoll();
  assert.strictEqual(sync.isPolling(), true, "Polling should be active before Socket.io connects");

  // On WebSocket connect
  sync.onSocketConnect();
  assert.strictEqual(sync.isPolling(), false, "Polling should be stopped when WebSocket is active");
  assert.strictEqual(sync.isSocketActive(), true);
  assert.strictEqual(sync.getStatus(), "live");

  // On WebSocket disconnect
  sync.onSocketDisconnect();
  assert.strictEqual(sync.isPolling(), true, "Polling should resume when WebSocket disconnects");
  assert.strictEqual(sync.getStatus(), "waiting");

  // On reconnect
  sync.onSocketConnect();
  assert.strictEqual(sync.isPolling(), false, "Polling should stop again when WebSocket reconnects");

  sync.cleanup();
});

test("Viewer sync resumes polling on connection error", () => {
  const sync = createViewerSyncManager();
  sync.startPoll();
  sync.onSocketConnect();
  assert.strictEqual(sync.isPolling(), false);

  sync.onSocketError();
  assert.strictEqual(sync.isPolling(), true, "Polling should be active upon connection error");
  assert.strictEqual(sync.isSocketActive(), false);

  sync.cleanup();
});
