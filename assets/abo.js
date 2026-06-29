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

// Abo-Ränge in aufsteigender Reihenfolge + hübsche Labels.
const ABO_ORDER = ['knochen', 'bernstein', 'obsidian'];
const RANK_LABEL = { knochen: 'Knochen', bernstein: 'Bernstein', obsidian: 'Obsidian' };

const $ = (id) => document.getElementById(id);
const RETURN_URL = location.origin + location.pathname; // ohne Query

// ── 1) Login-Status aus URL (nach Discord-Rücksprung) oder localStorage ──────
(function captureLogin() {
  const q = new URLSearchParams(location.search);
  const did = q.get('discord_id');
  if (did) {
    localStorage.setItem('bf_discord_id', did);
    localStorage.setItem('bf_discord_name', q.get('name') || 'Spieler');
    // Aktuellen Abo-Rang merken (kommt vom token-service; leer = kein Rang).
    if (q.has('abo')) localStorage.setItem('bf_abo_tier', q.get('abo') || '');
    // Query aus der URL entfernen (Discord-ID nicht sichtbar lassen)
    history.replaceState({}, '', RETURN_URL);
  }
})();

function isLoggedIn() { return !!localStorage.getItem('bf_discord_id'); }

// Aktueller Abo-Rang als Key ('knochen'|'bernstein'|'obsidian') oder null.
function currentAboKey() {
  const t = (localStorage.getItem('bf_abo_tier') || '').trim().toLowerCase();
  return ABO_ORDER.includes(t) ? t : null;
}

function renderLoginState() {
  const logged = isLoggedIn();
  $('loginBox').hidden = logged;
  $('userBox').hidden = !logged;
  if (logged) {
    $('userName').textContent = localStorage.getItem('bf_discord_name') || 'Spieler';
    const cur = currentAboKey();
    const rankEl = $('userRank');
    if (rankEl) {
      rankEl.textContent = cur ? ` · Aktueller Rang: ${RANK_LABEL[cur]}` : ' · Noch kein Rang';
      rankEl.className = cur ? 'rank-pill' : 'muted small';
    }
  }
}

$('loginBtn').addEventListener('click', () => {
  location.href = `${CONFIG.TOKEN_BASE}/auth/web/login?return=${encodeURIComponent(RETURN_URL)}`;
});
$('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('bf_discord_id');
  localStorage.removeItem('bf_discord_name');
  localStorage.removeItem('bf_abo_tier');
  renderLoginState();
  location.reload();
});

renderLoginState();

// ── 2) „Mehr Infos zu den Rängen" aufklappen ─────────────────────────────────
$('rankMoreBtn')?.addEventListener('click', () => {
  const d = $('rankDetails');
  const willOpen = d.hidden;
  d.hidden = !willOpen;
  $('rankMoreBtn').setAttribute('aria-expanded', String(willOpen));
  $('rankMoreBtn').textContent = willOpen ? '▲ Weniger anzeigen' : 'ℹ️ Mehr Infos zu den Rängen';
});

// ── 3) Danke-Overlay zuverlässig schließbar (X, Button, Hintergrund, Esc) ────
function closeThanks() { const t = $('thanks'); if (t) t.hidden = true; }
$('thanksClose')?.addEventListener('click', closeThanks);
$('thanksX')?.addEventListener('click', closeThanks);
$('thanks')?.addEventListener('click', (e) => { if (e.target === $('thanks')) closeThanks(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeThanks(); });

// ── 4) PayPal-SDK laden (nur wenn konfiguriert) ──────────────────────────────
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

// Einen PayPal-Subscribe-Button in #pp-<key> rendern.
function renderPayPalButton(key) {
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
      // Beim Upgrade wird das alte Abo serverseitig (Webhook) automatisch gekündigt.
      return actions.subscription.create({
        plan_id: CONFIG.PLANS[key],
        custom_id: code ? `${did}|${code}` : did,
      });
    },
    onApprove: () => {
      // Rang optimistisch merken, damit die Seite ihn nach dem Kauf sofort zeigt.
      localStorage.setItem('bf_abo_tier', RANK_LABEL[key]);
      $('thanks').hidden = false;
    },
    onError: (err) => { console.error('PayPal-Fehler:', err); alert('Bei der Zahlung ist etwas schiefgelaufen. Bitte versuche es erneut.'); },
  }).render('#pp-' + key);
}

// Buttons + Karten-Status (aktueller Rang / Upgrade / enthalten) aufbauen.
function renderButtons() {
  const cur = currentAboKey();
  const curIdx = cur ? ABO_ORDER.indexOf(cur) : -1;

  for (const key of ABO_ORDER) {
    const idx = ABO_ORDER.indexOf(key);
    const tierEl = document.querySelector(`.tier[data-tier="${key}"]`);
    const foot = document.querySelector(`.tier-foot[data-foot="${key}"]`);
    if (!foot) continue;

    if (curIdx >= 0 && idx === curIdx) {
      // Aktueller Rang → ausgegraut, kein Kauf-Button.
      tierEl?.classList.add('is-current');
      foot.innerHTML = '<div class="tier-current">★ Dein aktueller Rang</div>';
      continue;
    }
    if (curIdx >= 0 && idx < curIdx) {
      // Niedriger als der aktuelle Rang → bereits enthalten, kein Kauf.
      foot.innerHTML = '<div class="tier-included">✓ In deinem Rang enthalten</div>';
      continue;
    }
    // Höher als aktueller Rang → als Upgrade markieren; sonst normaler Kauf.
    if (curIdx >= 0 && idx > curIdx) {
      foot.insertAdjacentHTML('afterbegin', '<div class="tier-upgrade-tag">⬆️ Upgrade</div>');
    }
    renderPayPalButton(key);
  }
}
