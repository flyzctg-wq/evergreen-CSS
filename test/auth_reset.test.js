const test = require("node:test");
const assert = require("node:assert");
const resetHandler = require("../api/auth/reset");
const authUtils = require("../api/auth_utils");

test("password reset request handler does not expose reset token or debugResetUrl in response", async () => {
  // Mock user for reset test
  const testEmail = "test-reset-security@example.com";
  await authUtils.saveUser({
    email: testEmail,
    name: "Security Test User",
    passwordHash: authUtils.hashPassword("123456"),
    role: "standard"
  });

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
      return res;
    },
    json: (data) => {
      responseData = data;
      return res;
    },
    end: () => res
  };

  await resetHandler(req, res);

  assert.strictEqual(responseStatus, 200);
  assert.strictEqual(responseData.success, true);
  assert.strictEqual(responseData.debugResetUrl, undefined, "debugResetUrl must not be exposed in API response");

  // Ensure response does not leak reset url or tokens in stringified output
  const responseStr = JSON.stringify(responseData);
  assert.strictEqual(responseStr.includes("resetToken="), false, "Response body must not contain reset token");

  // Cleanup file DB changes created during test
  const fs = require("fs");
  const path = require("path");
  const localDbPath = path.join(__dirname, "..", "server", "users.json");
  if (fs.existsSync(localDbPath)) {
    const list = JSON.parse(fs.readFileSync(localDbPath, "utf8"));
    const filtered = list.filter(u => u.email !== testEmail);
    fs.writeFileSync(localDbPath, JSON.stringify(filtered, null, 2), "utf8");
  }
});
