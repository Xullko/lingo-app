/* LingoCards settings. Edit prices, the free tier and links here. */
window.LINGO_CONFIG = {
  version: "2.0.0",

  // Accounts and payments run in DEMO mode: accounts live only in the browser,
  // passwords are not checked or stored, and checkout never charges anything.
  // To go live, replace the demo code in js/services.js with Supabase (accounts)
  // and Stripe (payments). See README.md.
  mode: "demo",

  // How many batches are free. Everything after this needs Premium.
  freeBatches: 3,

  currency: "USD",
  plans: [
    { id: "monthly", name: "Monthly", price: 4.99, period: "month", note: "Cancel anytime" },
    { id: "lifetime", name: "Lifetime", price: 19.99, period: null, note: "Pay once, keep it forever", badge: "Best value" }
  ],

  repoUrl: "https://github.com/Xullko/lingo-app"
};
