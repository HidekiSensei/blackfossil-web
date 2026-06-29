// ── BlackFossil — Abo / Ränge ────────────────────────────────────────────────
// KONFIG: nach dem PayPal-Setup hier eintragen (paypal-setup.mjs gibt die Plan-IDs aus).
const CONFIG = {
  // Client-ID der PayPal-REST-App (Live, öffentlich).
  PAYPAL_CLIENT_ID: 'AdSOEMMb552-NRxFJrxWdIZgnvYW85y8Isncet2zkpYiSwbQ0QAzLluON1j330mYdEsQCa4OVe2OrC35',
  PLANS: {
    knochen:   'P-5FD17211XC090620DNJBOHKA',
    bernstein: 'P-04205520F4014394WNJBOHKA',
    obsidian:  'P-0CM96815S9809034NNJBOHKI',
  },
  // Basis des token-service (Discord-Web-Login)
  TOKEN_BASE: 'https://voice.blackfossil.de',
};

const $ = (id) => document.getElementById(id);
const RETURN_URL = location.origin + location.pathname; // ohne Query

// ── 1) Login-Status aus URL (nach Discord-Rücksprung) oder localStorage ──────
(function captureLogin() {
  const q = new URLSearchParams(location.search);
  const did = q.get('discord_id');
  if (did) {
    localStorage.setItem('bf_discord_id', did);
    localStorage.setItem('bf_discord_name', q.get('name') || 'Spieler');
    // Query aus der URL entfernen (Discord-ID nicht sichtbar lassen)
    history.replaceState({}, '', RETURN_URL);
  }
})();

function isLoggedIn() { return !!localStorage.getItem('bf_discord_id'); }

function renderLoginState() {
  const logged = isLoggedIn();
  $('loginBox').hidden = logged;
  $('userBox').hidden = !logged;
  if (logged) $('userName').textContent = localStorage.getItem('bf_discord_name') || 'Spieler';
}

$('loginBtn').addEventListener('click', () => {
  location.href = `${CONFIG.TOKEN_BASE}/auth/web/login?return=${encodeURIComponent(RETURN_URL)}`;
});
$('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('bf_discord_id');
  localStorage.removeItem('bf_discord_name');
  renderLoginState();
  location.reload();
});

renderLoginState();

// ── 2) PayPal-SDK laden (nur wenn konfiguriert) ──────────────────────────────
const configured =
  !CONFIG.PAYPAL_CLIENT_ID.startsWith('PASTE') &&
  !Object.values(CONFIG.PLANS).some((p) => p.startsWith('PASTE'));

if (!configured) {
  $('setupNote').hidden = false;
} else {
  const s = document.createElement('script');
  s.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(CONFIG.PAYPAL_CLIENT_ID)}` +
          `&vault=true&intent=subscription&currency=EUR`;
  s.onload = renderButtons;
  s.onerror = () => { $('setupNote').hidden = false; };
  document.head.appendChild(s);
}

function renderButtons() {
  const tiers = [
    { key: 'knochen',   el: 'pp-knochen'   },
    { key: 'bernstein', el: 'pp-bernstein' },
    { key: 'obsidian',  el: 'pp-obsidian'  },
  ];
  for (const t of tiers) {
    window.paypal.Buttons({
      style: { layout: 'vertical', color: 'gold', shape: 'pill', label: 'subscribe', height: 44 },
      // Vor dem Kauf: Login erzwingen, damit die Discord-ID als custom_id mitgeht
      onClick: (data, actions) => {
        if (!isLoggedIn()) {
          alert('Bitte logge dich zuerst mit Discord ein, damit dein Rang im richtigen Account landet.');
          return actions.reject();
        }
        return actions.resolve();
      },
      createSubscription: (data, actions) => {
        const did = localStorage.getItem('bf_discord_id') || '';
        const code = ($('creatorCode')?.value || '').trim();
        // custom_id trägt Discord-ID + optional den Creator-Code (max. 127 Zeichen).
        return actions.subscription.create({
          plan_id: CONFIG.PLANS[t.key],
          custom_id: code ? `${did}|${code}` : did,
        });
      },
      onApprove: () => { $('thanks').hidden = false; },
      onError: (err) => { console.error('PayPal-Fehler:', err); alert('Bei der Zahlung ist etwas schiefgelaufen. Bitte versuche es erneut.'); },
    }).render('#' + t.el);
  }
}
