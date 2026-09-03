// End-to-end smoke test against the live RandomRep API.
// Exercises the real authenticated path: Neon Auth sign-up -> profile
// (onboarding) -> AI plan generation (OpenRouter) -> plan fetch.
//
// Usage:
//   node scripts/e2e-smoke.mjs
//   BASE_URL=https://randomrep.vercel.app node scripts/e2e-smoke.mjs
//   AUTH_URL=<your-neon-auth-base> node scripts/e2e-smoke.mjs

const BASE_URL = process.env.BASE_URL ?? "https://randomrep.vercel.app";
const AUTH_URL = process.env.AUTH_URL;

const API = `${BASE_URL}/api`;
const EMAIL_DOMAIN = "example.com";
const EMAIL = `e2e-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@${EMAIL_DOMAIN}`;
const PASSWORD = "Sup3rSecret!x";

function ok(step, message) {
  console.log(`  \u2713 ${step}: ${message}`);
}

function fail(step, message) {
  console.error(`  \u2717 ${step}: ${message}`);
  process.exitCode = 1;
}

// Node's fetch doesn't keep a cookie jar, so extract the session cookie
// from the Set-Cookie header and forward it on subsequent auth calls.
function cookieFrom(setCookieHeader) {
  const [cookie] = String(setCookieHeader).split(";");
  return cookie;
}

async function signUp() {
  const url = `${AUTH_URL}/sign-up/email`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-requested-with": "XMLHttpRequest",
      Origin: BASE_URL,
    },
    body: JSON.stringify({ name: "E2E Smoke", email: EMAIL, password: PASSWORD }),
  });
  const body = await res.json();
  if (!res.ok || !body.token) {
    throw new Error(`sign-up failed (${res.status}): ${JSON.stringify(body)}`);
  }
  const cookie = cookieFrom(res.headers.get("set-cookie"));
  if (!cookie) throw new Error("sign-up did not set a session cookie");

  // Replicate the @neondatabase/auth client: after signing up it calls
  // getSession(), which returns a JWT via the `set-auth-jwt` response header.
  // The API server verifies that JWT against the Neon JWKS.
  const sres = await fetch(`${AUTH_URL}/get-session`, {
    headers: {
      Cookie: cookie,
      "x-requested-with": "XMLHttpRequest",
      Origin: BASE_URL,
    },
  });
  if (!sres.ok) {
    throw new Error(`get-session failed (${sres.status})`);
  }
  const jwt = sres.headers.get("set-auth-jwt");
  if (!jwt) {
    throw new Error("get-session did not return a set-auth-jwt JWT");
  }
  return { token: jwt, userId: body.user.id };
}

async function api(path, token, body) {
  const res = await fetch(`${API}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  let data = null;
  try {
    data = await res.json();
  } catch {
    /* ignore non-JSON */
  }
  return { status: res.status, data };
}

async function tutorial() {
  console.log(`\nBase:    ${BASE_URL}`);
  console.log(`Auth:    ${AUTH_URL ?? "(from VITE_NEON_AUTH_URL)"}`);
  console.log(`Email:   ${EMAIL}`);
  console.log(`Password:${PASSWORD}\n`);
}

async function main() {
  if (!AUTH_URL) {
    console.error(
      "AUTH_URL is required. Set it to your Neon Auth base URL, e.g.\n" +
        "  AUTH_URL=https://<project>.neonauth.c-3.us-west-2.aws.neon.tech/neondb/auth node scripts/e2e-smoke.mjs",
    );
    process.exit(1);
  }

  await tutorial();
  console.log("[1/4] Sign-up via Neon Auth");
  let session;
  try {
    session = await signUp();
    ok("sign-up", `user ${session.userId} obtained session JWT`);
  } catch (e) {
    fail("sign-up", e.message);
    return;
  }
  const token = session.token;

  console.log("[2/4] Submit profile (onboarding)");
  const profile = {
    goal: "recomp",
    experience: "intermediate",
    daysPerWeek: 4,
    sessionLength: 60,
    equipment: "full_gym",
    injuries: "",
    preferredSplit: "upper_lower",
  };
  let r = await api("/profile", token, profile);
  if (r.status === 200 && r.data?.success) ok("POST /api/profile", "profile saved");
  else fail("POST /api/profile", `${r.status}: ${JSON.stringify(r.data)}`);

  console.log("[3/4] Generate AI training plan (OpenRouter)");
  r = await api("/plan/generate", token, {});
  if (r.status === 200 && r.data?.id && r.data?.version) {
    ok("POST /api/plan/generate", `plan id=${r.data.id} version=${r.data.version}`);
  } else {
    fail("POST /api/plan/generate", `${r.status}: ${JSON.stringify(r.data)}`);
    return;
  }

  console.log("[4/4] Fetch current plan");
  const res = await fetch(`${API}/plan/current`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
  const cur = await res.json();
  if (res.status === 200 && cur?.planJson) {
    ok("GET /api/plan/current", `returned version ${cur.version} plan`);
  } else {
    fail("GET /api/plan/current", `${res.status}: ${JSON.stringify(cur)}`);
  }

  console.log(`\nTEST ${process.exitCode ? "FAILED" : "PASSED"}`);
}

main().catch((e) => {
  console.error("Unexpected error:", e);
  process.exit(1);
});