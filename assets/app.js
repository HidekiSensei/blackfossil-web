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
  { title: '⚖️ Admins & Grundsätzliches', body: `<ul>
    <li>Die <strong>Admins haben das letzte Wort</strong> — ihren Anweisungen ist Folge zu leisten.</li>
    <li>Anliegen & Meldungen laufen über ein <strong>Ticket</strong>, nicht im Chat/Voice.</li>
    <li>Respektvoller Umgang — kein Toxic, keine Beleidigungen, kein Drama, keine Diskriminierung.</li>
    <li><strong>Cheats, Exploits, Bug-Abuse & Combat-Logging</strong> sind verboten → Ban.</li>
    <li>Kein <strong>Stream-Sniping / Ghosting</strong>.</li>
    <li>Unwissenheit schützt nicht vor Konsequenzen.</li></ul>` },

  { title: '🦖 Realism-Zone — Hauptmap', body: `
    <p><strong>Töten braucht einen Grund:</strong> Hunger (dann fressen), Revier-/Nestverteidigung, Selbstverteidigung, Rudelschutz. <strong>Kein KOS</strong> ohne Grund.</p>
    <ul><li>Nach einem Kill: fressen oder klaren Grund haben — kein sinnloses Schlachten.</li>
    <li><strong>Gruppengrößen</strong> der Art respektieren — kein Mega-Zerg.</li></ul>
    <p class="r-sub">🔗 MixPacking</p>
    <ul><li><strong>Verboten:</strong> Spezies unterschiedlicher Ernährung gemeinsam im Kampf (Karni + Herbi zusammen jagen/PvP). Kein Herbivore als Tank/Köder im Karni-Kampf und umgekehrt.</li>
    <li><strong>Erlaubt:</strong> friedliche Zusammenarbeit über Arten hinweg — reisen, koexistieren, warnen, soziale Mischgruppen.</li>
    <li><strong>Gleiche Diät</strong> darf zusammen kämpfen (realistische Gruppengröße).</li>
    <li><strong>Faustregel:</strong> zusammenleben & kooperieren ja — über Diätgrenzen zusammen kämpfen nein.</li></ul>
    <p class="r-sub">🛡️ Schutz & Kampfansage</p>
    <ul><li>Friedliche Koexistenz steht unter <strong>Schutz</strong> — keine Überraschungsangriffe innerhalb einer friedlichen Gruppe.</li>
    <li>Ein Kampf beginnt erst, wenn das <strong>Ziel per Voice-Chat in Hörweite angesagt ("gecalled")</strong> wird — dann ist die Gruppe zum Kampf freigegeben.</li>
    <li>Ab dem Call gilt nur noch <strong>Flucht oder Kampf</strong> — kein Zurückrudern.</li></ul>` },

  { title: '🩸 PvP-Zone — The Pit', body: `
    <p>Hier ist Kampf das Ziel — aber <strong>fair</strong>.</p>
    <ul><li><strong>Zugang nur per Teleport</strong> — wer rein geht, willigt in PvP ein.</li>
    <li><strong>Keine Einmischung in laufende Kämpfe.</strong> Ein Kampf gehört nur den Beteiligten — kein Reinspringen, kein Abräumen des Geschwächten.</li>
    <li><strong>Kein Third-Partying / Ganking.</strong> Dem Sieger eine kurze Erholungsphase lassen.</li>
    <li><strong>Über dem Packlimit nur nach Absprache</strong> (Überzahl nur mit Einverständnis der Gegenpartei).</li>
    <li><strong>Kämpfe ehren</strong> (1v1, Gruppen, Größenklasse). Kein Locken in AI/Wasser/Out-of-Bounds.</li>
    <li>Kein Combat-TP / Combat-Logging.</li>
    <li>Kein Abcampen des Pit-Eingangs.</li>
    <li><strong>GG-Kultur</strong> — kein Flaming. Was im Pit passiert, bleibt im Pit.</li></ul>` },

  { title: '🌿 PvE-Zone — Water Access', body: `
    <p>Reine <strong>Safezone</strong>: Growen, Chillen, Sozialisieren — null Kampf.</p>
    <ul><li><strong>Striktes PvP-Verbot</strong> — kein Angreifen, Beißen, Trampeln, Schubsen oder Behindern anderer Spieler-Dinos.</li>
    <li><strong>Kein Nesting in dieser Zone.</strong></li>
    <li>Kein Baiten/Locken aus der Zone oder an die Grenze.</li>
    <li>Kein Grenz-Camping durch Karnivoren.</li>
    <li>Kein Grow-Boost in dieser Zone — natürliches Wachsen.</li>
    <li>Rücksicht auf wachsende Spieler, keine Futter-/Wasserstellen blockieren.</li>
    <li><strong>Drama bleibt draußen</strong> — bei Problemen Admin/Ticket.</li></ul>` },

  { title: '🌀 Teleport-Regeln', body: `<ul>
    <li><strong>Kein TP-Abuse</strong> — nicht aus Kämpfen flüchten oder Vorteile erschleichen. Im Kampf wird <strong>nicht</strong> teleportiert.</li>
    <li><strong>Off-Timer:</strong> nach einem TP 5 Minuten keinen Kampf initiieren.</li>
    <li>Kein direkter Anschlusskampf unmittelbar nach dem TP.</li>
    <li>Kein Abcampen des TP-Punkts.</li>
    <li><strong>Kommunikationspflicht:</strong> ansagen, wenn du gerade teleportierst.</li></ul>` },

  { title: '🔴 Konsequenzen', body: `<ul>
    <li>Je nach Schwere: <strong>Verwarnung → temporärer Ban → permanenter Ban</strong>.</li>
    <li><strong>Schwere Verstöße</strong> (Cheats, Exploits, absichtliches/wiederholtes Regelbrechen) = sofortiger Ban.</li>
    <li>Bei Meldungen <strong>Beweise</strong> (Clips/Screenshots) im Ticket beifügen.</li>
    <li>Admins entscheiden im Einzelfall; ihr Urteil ist final.</li></ul>` },
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
RULES.forEach((r) => rulesEl.appendChild(acc(r.title, r.body)));
const faqEl = document.getElementById('faqAcc');
FAQ.forEach((f) => faqEl.appendChild(acc(f.q, `<p>${f.a}</p>`)));
