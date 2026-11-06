/* LingoCards accounts and payments.
   DEMO VERSION: everything is stored in this browser's localStorage.
   - Passwords are NOT checked or saved. Never use this for real accounts.
   - Checkout never charges anything.
   To go live, keep the same function names and swap the insides:
   auth.*    -> Supabase Auth (supabase.auth.signUp / signInWithPassword / signOut)
   billing.* -> Stripe Checkout or Payment Links, with a server webhook that marks
                the user as Premium in your database. */
(function () {
  "use strict";
  const CFG = window.LINGO_CONFIG;
  const ACCOUNTS = "lingocards:accounts:v1";
  const CURRENT = "lingocards:current-user:v1";
  const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const read = k => { try { const s = localStorage.getItem(k); return s ? JSON.parse(s) : null; } catch (e) { return null; } };
  const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const fail = msg => { throw new Error(msg); };
  const accounts = () => read(ACCOUNTS) || {};
  const newId = () => "u_" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
  function saveUser(u) { const a = accounts(); a[u.email] = u; write(ACCOUNTS, a); return u; }

  const auth = {
    mode: CFG.mode,

    current() {
      const id = read(CURRENT);
      if (!id) return null;
      return Object.values(accounts()).find(u => u.id === id) || null;
    },

    async signUp({ name, email, password }) {
      await wait(400);
      name = (name || "").trim();
      email = (email || "").trim().toLowerCase();
      if (!name) fail("Enter your name.");
      if (!EMAIL.test(email)) fail("Enter a valid email address.");
      if ((password || "").length < 8) fail("Use a password with at least 8 characters.");
      if (accounts()[email]) fail("An account with this email already exists. Log in instead.");
      const u = { id: newId(), name, email, createdAt: Date.now(), plan: null };
      saveUser(u);
      write(CURRENT, u.id);
      return u;
    },

    async logIn({ email, password }) {
      await wait(400);
      email = (email || "").trim().toLowerCase();
      if (!EMAIL.test(email)) fail("Enter a valid email address.");
      if (!password) fail("Enter your password.");
      const u = accounts()[email];
      if (!u) fail("No account uses this email yet. Create one instead.");
      write(CURRENT, u.id);
      return u;
    },

    async logOut() {
      try { localStorage.removeItem(CURRENT); } catch (e) {}
    },

    async updateName(name) {
      name = (name || "").trim();
      if (!name) fail("Enter your name.");
      const u = auth.current();
      if (!u) fail("Log in first.");
      u.name = name;
      return saveUser(u);
    }
  };

  const billing = {
    mode: CFG.mode,

    isPremium(u) {
      if (!u || !u.plan) return false;
      return u.plan.id === "lifetime" || (u.plan.renewsAt || 0) > Date.now();
    },

    // Live version: return { redirect: "<Stripe checkout URL>" } and the app follows it.
    async startCheckout(planId) {
      if (!CFG.plans.some(p => p.id === planId)) fail("Pick a plan first.");
      return { demo: true };
    },

    async completeDemoPurchase(planId) {
      await wait(1300);
      const u = auth.current();
      if (!u) fail("Log in first.");
      const now = Date.now();
      u.plan = planId === "lifetime"
        ? { id: "lifetime", since: now }
        : { id: "monthly", since: now, renewsAt: now + 30 * 864e5, cancelled: false };
      return saveUser(u);
    },

    // Monthly plans stay active until the paid period ends.
    async cancel() {
      await wait(300);
      const u = auth.current();
      if (u && u.plan && u.plan.id === "monthly") { u.plan.cancelled = true; saveUser(u); }
      return u;
    },

    async resume() {
      const u = auth.current();
      if (u && u.plan && u.plan.id === "monthly") { u.plan.cancelled = false; saveUser(u); }
      return u;
    }
  };

  window.LingoServices = { auth, billing };
})();
