// ── Live-Server-Status ───────────────────────────────────────────────────────
const STATUS_URL = 'https://voice.blackfossil.de/public/status';
async function loadStatus() {
  const dot = document.getElementById('statusDot');
  const txt = document.getElementById('statusText');
  try {
    const r = await fetch(STATUS_URL, { cache: 'no-store' });
    const d = await r.json();
    if (d.up) {
      dot.className = 'dot on';
      txt.innerHTML = `<strong>Server online</strong> · ${d.online} / ${d.max} Spieler`;
    } else {
      dot.className = 'dot off';
      txt.innerHTML = '<strong>Server offline</strong> · gleich wieder da';
    }
  } catch {
    dot.className = 'dot off';
    txt.textContent = 'Status nicht erreichbar';
  }
}
loadStatus();
setInterval(loadStatus, 30000);

// ── Regeln (kategorisiert — hier einfach editieren) ──────────────────────────
const RULES = [
  { title: '📜 Allgemein', items: [
    'Respektiere alle Spieler — kein Rassismus, keine Beleidigungen, kein Harassment.',
    'Kein Cheaten, Exploiten oder Ausnutzen von Bugs. Bugs bitte per Ticket melden.',
    'Englisch & Deutsch im Voice sind willkommen — bleibt freundlich.',
  ]},
  { title: '⚔️ PVP-Zone', items: [
    'In der PVP-Zone ist Kampf jederzeit erlaubt.',
    'Kein gezieltes Spawn-Camping an Eingängen.',
    'Mixpacking nur im erlaubten Rahmen (siehe Server-Regeln).',
  ]},
  { title: '🛡️ PVE-Zone', items: [
    'In der PVE-Zone ist Angreifen anderer Spieler verboten.',
    'Safe-Zone zum Wachsen, Treffen und Erholen.',
    'Verstöße führen zu Verwarnung oder Bann.',
  ]},
  { title: '🌿 Realismus (außerhalb der Zonen)', items: [
    'Außerhalb von PVP/PVE gelten Realismus-Regeln: verhalte dich wie das Tier.',
    'Kein grundloses Töten über dem Sättigungsbedarf (No KOS ohne Grund).',
    'Rudel- und Reviergrenzen respektieren.',
  ]},
  { title: '🎙️ Voice & Overlay', items: [
    'Proximity-Voice ist In-Character gedacht — kein Mikro-Spam, kein Earrape.',
    'Das Overlay ist erlaubt und Teil des Server-Erlebnisses.',
    'Keine Manipulation oder Reverse-Engineering der Server-/Overlay-Systeme.',
  ]},
];

// ── FAQ ──────────────────────────────────────────────────────────────────────
const FAQ = [
  { q: 'Wie werde ich Beta-Tester?', a: 'Tritt unserem Discord bei und öffne ein Hilfe-Ticket mit dem Hinweis, dass du Beta-Tester werden möchtest. Die ersten 30 Plätze sind limitiert.' },
  { q: 'Was ist das Overlay?', a: 'Eine Desktop-App, die dir Proximity-Voice, eine Live-Karte, deine Dino-Stats, eine Garage und einen Dino-Markt direkt im Spiel bietet — ohne Alt-Tab.' },
  { q: 'Kostet der Server Geld?', a: 'Nein. Der Server ist gratis spielbar (Rang „Fossil"). Wer möchte, kann uns mit einem Rang unterstützen und Komfort-Features freischalten.' },
  { q: 'Ist das Pay-to-Win?', a: 'Nein. Die Ränge schalten Komfort- und Kosmetik-Features frei (z.B. Skin-Editor, kürzere Cooldowns). Gameplay-Können bleibt entscheidend.' },
  { q: 'Welche Version von The Isle?', a: 'Wir spielen die aktuelle Evrima-Version (Gateway-Map).' },
  { q: 'Wo melde ich Bugs oder Wünsche?', a: 'Am besten per Hilfe-Ticket im Discord — als Beta-Tester fließt dein Feedback direkt in die Entwicklung ein.' },
];

function acc(title, bodyHTML) {
  const d = document.createElement('details'); d.className = 'acc';
  d.innerHTML = `<summary>${title}</summary><div class="body">${bodyHTML}</div>`;
  return d;
}
const rulesEl = document.getElementById('rulesAcc');
RULES.forEach((r) => rulesEl.appendChild(acc(r.title, `<ul>${r.items.map((i) => `<li>${i}</li>`).join('')}</ul>`)));
const faqEl = document.getElementById('faqAcc');
FAQ.forEach((f) => faqEl.appendChild(acc(f.q, `<p>${f.a}</p>`)));
