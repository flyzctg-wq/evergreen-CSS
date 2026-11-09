const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const authUtils = require("../api/auth_utils");
const resetHandler = require("../api/auth/reset");

const USERS_FILE = path.join(__dirname, "..", "server", "users.json");

test.describe("Password Reset Security", () => {
  let originalUsersBackup = null;

  test.before(() => {
    if (fs.existsSync(USERS_FILE)) {
      originalUsersBackup = fs.readFileSync(USERS_FILE, "utf8");
    }
  });

  test.after(() => {
    if (originalUsersBackup !== null) {
      fs.writeFileSync(USERS_FILE, originalUsersBackup, "utf8");
    }
  });

  test("reset request should not leak reset token or debug URL in response", async () => {
    const testEmail = "test@example.com";
    let responseStatus = 200;
    let responseData = null;

    const req = {
      method: "POST",
      headers: { host: "localhost:3847" },
      body: { action: "request", email: testEmail }
    };

    const res = {
      setHeader: () => {},
      status: (code) => {
        responseStatus = code;
        return {
          json: (data) => {
            responseData = data;
          }
        };
      },
      json: (data) => {
        responseData = data;
      }
    };

    await resetHandler(req, res);

    assert.equal(responseStatus, 200);
    assert.equal(responseData.success, true);
    assert.equal(responseData.debugResetUrl, undefined, "debugResetUrl must not be exposed");
    assert.equal(responseData.token, undefined, "token must not be exposed");
    assert.equal(
      responseData.message,
      "If this email is registered, a password recovery link has been generated."
    );
  });

  test("reset request returns identical message for non-existent users", async () => {
    let responseData = null;

    const req = {
      method: "POST",
      headers: { host: "localhost:3847" },
      body: { action: "request", email: "nonexistent-user-123456@example.com" }
    };

    const res = {
      setHeader: () => {},
      status: () => ({ json: (data) => { responseData = data; } }),
      json: (data) => { responseData = data; }
    };

    await resetHandler(req, res);

    assert.equal(responseData.success, true);
    assert.equal(responseData.debugResetUrl, undefined);
    assert.equal(
      responseData.message,
      "If this email is registered, a password recovery link has been generated."
    );
  });

  test("reset confirmation succeeds with valid token and rejects invalid token", async () => {
    const testEmail = "test@example.com";
    const validToken = authUtils.signJWT({ email: testEmail }, authUtils.RESET_SECRET, 3600);

    let confirmResponseData = null;
    const confirmReq = {
      method: "POST",
      headers: { host: "localhost:3847" },
      body: { action: "confirm", token: validToken, newPassword: "654321" }
    };
    const confirmRes = {
      setHeader: () => {},
      status: () => ({ json: (data) => { confirmResponseData = data; } }),
      json: (data) => { confirmResponseData = data; }
    };

    await resetHandler(confirmReq, confirmRes);
    assert.equal(confirmResponseData.success, true);

    // Verify invalid token is rejected
    let invalidTokenStatus = null;
    let invalidTokenData = null;
    const invalidReq = {
      method: "POST",
      headers: { host: "localhost:3847" },
      body: { action: "confirm", token: "tampered.or.invalid.token", newPassword: "654321" }
    };
    const invalidRes = {
      setHeader: () => {},
      status: (code) => {
        invalidTokenStatus = code;
        return { json: (data) => { invalidTokenData = data; } };
      },
      json: (data) => { invalidTokenData = data; }
    };

    await resetHandler(invalidReq, invalidRes);
    assert.equal(invalidTokenStatus, 400);
    assert.match(invalidTokenData.error, /invalid or expired/i);
  });
});
