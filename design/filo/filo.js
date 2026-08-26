/* ═══════════════════════════════════════════════════════════════
   FILO — comportamento
   Tutto è agganciato a un attributo data-*, niente a una classe:
   la classe dice come si vede, l'attributo dice cosa fa. Un solo
   file, e ogni pezzo si accende solo se in pagina c'è il suo nodo.
   ═══════════════════════════════════════════════════════════════ */

import { SPRITE } from './icone.js';

const tutti = (sel, radice = document) => Array.from(radice.querySelectorAll(sel));
const uno = (sel, radice = document) => radice.querySelector(sel);
const stretta = (n, min, max) => Math.min(max, Math.max(min, n));
const calmo = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ── Avvisi ─────────────────────────────────────────────────────
   Un solo posto per dire "fatto". Sparisce da solo: un avviso che
   resta è un avviso che nessuno legge. */
const pilaAvvisi = () =>
  uno('[data-avvisi]') ??
  document.body.appendChild(
    Object.assign(document.createElement('output'), { className: 'avvisi', ariaLive: 'polite' })
  );

const ICONA = (nome) => `<svg class="icona" aria-hidden="true"><use href="#i-${nome}"/></svg>`;

export const avvisa = (testo, segno = 'spunta') => {
  const pila = pilaAvvisi();
  pila.dataset.avvisi = '';
  const nodo = document.createElement('p');
  nodo.className = 'avviso';
  nodo.innerHTML = `${ICONA(segno)} ${testo}`;
  pila.append(nodo);
  setTimeout(() => {
    nodo.dataset.uscita = '';
    nodo.addEventListener('animationend', () => nodo.remove(), { once: true });
  }, 2600);
};

/* ── Il filo che si disegna ─────────────────────────────────────
   Il tracciato non è dritto: ondeggia di pochi pixel, come una
   linea tirata a mano su carta che non sta ferma. pathLength=1
   rende il dashoffset una frazione, e la frazione è lo scorrimento. */
const tracciato = (altezza) => {
  const passo = 120;
  const tratti = Math.max(2, Math.round(altezza / passo));
  const punti = Array.from({ length: tratti }, (_, i) => {
    const y1 = ((i + 0.5) * altezza) / tratti;
    const y2 = ((i + 1) * altezza) / tratti;
    const x1 = 9 + (i % 2 === 0 ? 3.4 : -3.4);
    return `C${x1},${y1} ${9 - (i % 2 === 0 ? 3.4 : -3.4)},${y1} 9,${y2}`;
  });
  return `M9,0 ${punti.join(' ')}`;
};

const disegnaPercorso = (percorso) => {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'percorso__linea');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('preserveAspectRatio', 'none');
  const linea = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  linea.setAttribute('pathLength', '1');
  svg.append(linea);
  percorso.prepend(svg);

  const fermate = tutti('.fermata', percorso);

  const ridisegna = () => {
    const h = percorso.offsetHeight;
    svg.setAttribute('viewBox', `0 0 18 ${h}`);
    svg.style.height = `${h}px`;
    linea.setAttribute('d', tracciato(h));
  };

  const avanza = () => {
    const r = percorso.getBoundingClientRect();
    const p = calmo ? 1 : stretta((innerHeight * 0.86 - r.top) / Math.max(r.height, 1), 0, 1);
    linea.style.setProperty('--tratto', String(1 - p));
    const soglia = r.top + r.height * p;
    fermate.forEach((f) => {
      const dentro = f.getBoundingClientRect().top + 30 <= soglia;
      f.toggleAttribute('data-passata', dentro);
    });
  };

  ridisegna();
  avanza();
  new ResizeObserver(() => { ridisegna(); avanza(); }).observe(percorso);
  addEventListener('scroll', avanza, { passive: true });
};

/* ── Testata che si stacca dalla pagina ───────────────────────── */
const testataViva = (testata) => {
  const guarda = () => testata.toggleAttribute('data-staccata', scrollY > 8);
  guarda();
  addEventListener('scroll', guarda, { passive: true });
};

/* ── Cursore che scorre sotto un gruppo di bottoni ─────────────
   Serve a segmentato e linguette: stesso gesto, due vestiti. */
const cursoreScorrevole = (gruppo, selVoci, selCursore, attivo) => {
  const cursore = uno(selCursore, gruppo);
  const voci = tutti(selVoci, gruppo);
  const sposta = (voce) => {
    cursore.style.width = `${voce.offsetWidth}px`;
    cursore.style.transform = `translateX(${voce.offsetLeft - (cursore.offsetParent === gruppo ? 0 : 0)}px)`;
  };
  const scegli = (voce) => {
    voci.forEach((v) => v.setAttribute('aria-selected', String(v === voce)));
    sposta(voce);
    gruppo.dispatchEvent(new CustomEvent('scelta', { detail: voce.dataset.valore, bubbles: true }));
  };
  voci.forEach((v) => v.addEventListener('click', () => scegli(v)));
  const primo = voci.find((v) => v.getAttribute('aria-selected') === 'true') ?? voci[0];
  requestAnimationFrame(() => sposta(primo));
  addEventListener('resize', () => sposta(uno(`${selVoci}[aria-selected="true"]`, gruppo) ?? primo));
  return { scegli };
};

/* ── Filtri e ricerca: un solo setaccio ─────────────────────────
   Ogni evento porta i suoi tag addosso. Il setaccio legge lo stato
   dei filtri e del campo di ricerca insieme, così non litigano. */
const setaccio = (radice) => {
  const eventi = tutti('[data-tag]', radice);
  const stato = { filtri: new Set(), testo: '' };

  const passa = (evento) => {
    const suoi = (evento.dataset.tag ?? '').split(' ');
    const perTag = [...stato.filtri].every((t) => suoi.includes(t));
    const perTesto = evento.textContent.toLowerCase().includes(stato.testo);
    return perTag && perTesto;
  };

  const applica = () => {
    eventi.forEach((e) => { e.hidden = !passa(e); });
    const visti = eventi.filter((e) => !e.hidden && e.offsetParent !== null).length;
    tutti('[data-conto-visibili]', radice).forEach((n) => { n.textContent = String(visti); });
    tutti('[data-quando-vuoto]').forEach((n) => { n.hidden = visti > 0; });
    tutti('.giorno').forEach((g) => {
      const gruppo = g.nextElementSibling;
      g.hidden = Boolean(gruppo) && tutti('[data-tag]', gruppo).every((e) => e.hidden);
    });
  };

  tutti('[data-filtro]', radice).forEach((b) =>
    b.addEventListener('click', () => {
      const acceso = b.getAttribute('aria-pressed') !== 'true';
      b.setAttribute('aria-pressed', String(acceso));
      acceso ? stato.filtri.add(b.dataset.filtro) : stato.filtri.delete(b.dataset.filtro);
      applica();
    })
  );

  const cerca = uno('[data-cerca]', radice);
  const campo = cerca && uno('input', cerca);
  campo?.addEventListener('input', () => {
    stato.testo = campo.value.trim().toLowerCase();
    cerca.toggleAttribute('data-pieno', campo.value.length > 0);
    applica();
  });
  cerca && uno('.cerca__pulisci', cerca)?.addEventListener('click', () => {
    campo.value = '';
    campo.dispatchEvent(new Event('input'));
    campo.focus();
  });

  applica();
};

/* ── Bottoni a due stati ────────────────────────────────────────
   Salva, tag, giorni: premuto o no. Una funzione sola, tre usi. */
const premibile = (selettore, alCambio = () => {}) =>
  tutti(selettore).forEach((b) =>
    b.addEventListener('click', () => {
      const acceso = b.getAttribute('aria-pressed') !== 'true';
      b.setAttribute('aria-pressed', String(acceso));
      alCambio(b, acceso);
    })
  );

/* ── Esclusivo: uno acceso, gli altri spenti ──────────────────── */
const esclusivo = (selGruppo, selVoci, alCambio = () => {}) =>
  tutti(selGruppo).forEach((gruppo) => {
    const voci = tutti(selVoci, gruppo);
    voci.forEach((v) =>
      v.addEventListener('click', () => {
        voci.forEach((x) => x.setAttribute('aria-pressed', String(x === v)));
        alCambio(v);
      })
    );
  });

/* ── Fisarmonica ────────────────────────────────────────────── */
const fisarmonica = () =>
  tutti('.piega__testa').forEach((t) =>
    t.addEventListener('click', () =>
      t.setAttribute('aria-expanded', String(t.getAttribute('aria-expanded') !== 'true'))
    )
  );

/* ── Linguette ─────────────────────────────────────────────── */
const linguette = () =>
  tutti('[data-linguette]').forEach((gruppo) => {
    const { scegli } = cursoreScorrevole(gruppo, '.linguetta', '.linguette__tratto');
    gruppo.addEventListener('scelta', (e) =>
      tutti(`[data-pannello]`).forEach((p) => { p.hidden = p.dataset.pannello !== e.detail; })
    );
    scegli(uno('.linguetta[aria-selected="true"]', gruppo) ?? uno('.linguetta', gruppo));
  });

/* ── Foglio che sale ───────────────────────────────────────── */
const fogli = () => {
  const velo = uno('[data-velo]');
  const chiudi = () => {
    tutti('[data-foglio]').forEach((f) => f.removeAttribute('data-aperto'));
    velo?.removeAttribute('data-aperto');
  };
  tutti('[data-apre]').forEach((b) =>
    b.addEventListener('click', () => {
      uno(`[data-foglio="${b.dataset.apre}"]`)?.setAttribute('data-aperto', '');
      velo?.setAttribute('data-aperto', '');
    })
  );
  velo?.addEventListener('click', chiudi);
  tutti('[data-chiude]').forEach((b) => b.addEventListener('click', chiudi));
  addEventListener('keydown', (e) => e.key === 'Escape' && chiudi());
};

/* ── Numeri che salgono, una volta sola ────────────────────── */
const cifreCheSalgono = () => {
  const nodi = tutti('[data-conta]');
  const sali = (nodo) => {
    const meta = Number(nodo.dataset.conta);
    const inizio = performance.now();
    const passo = (ora) => {
      const p = stretta((ora - inizio) / 900, 0, 1);
      nodo.textContent = Math.round(meta * (1 - Math.pow(1 - p, 3))).toLocaleString('it-IT');
      p < 1 && requestAnimationFrame(passo);
    };
    requestAnimationFrame(passo);
  };
  const occhio = new IntersectionObserver((voci) =>
    voci.filter((v) => v.isIntersecting).forEach((v) => { sali(v.target); occhio.unobserve(v.target); })
  );
  nodi.forEach((n) => (calmo ? (n.textContent = Number(n.dataset.conta).toLocaleString('it-IT')) : occhio.observe(n)));
};

/* ── Copia negli appunti, con la conferma nel bottone ───────── */
const copiatori = () =>
  tutti('[data-copia]').forEach((b) =>
    b.addEventListener('click', async () => {
      const prima = b.textContent;
      await navigator.clipboard?.writeText(b.dataset.copia).catch(() => {});
      b.textContent = 'Copiato';
      avvisa('Link copiato negli appunti');
      setTimeout(() => { b.textContent = prima; }, 1600);
    })
  );

/* ── Conta caratteri ───────────────────────────────────────── */
const contaCaratteri = () =>
  tutti('[data-conta-caratteri]').forEach((campo) => {
    const input = uno('input, textarea', campo);
    const nota = uno('.campo__conta', campo);
    const max = Number(campo.dataset.contaCaratteri);
    const aggiorna = () => { nota.textContent = `${input.value.length}/${max}`; };
    input.addEventListener('input', aggiorna);
    aggiorna();
  });

/* ── Deposito immagine ─────────────────────────────────────── */
const depositi = () =>
  tutti('.deposito').forEach((d) => {
    ['dragenter', 'dragover'].forEach((e) =>
      d.addEventListener(e, (ev) => { ev.preventDefault(); d.setAttribute('data-sopra', ''); })
    );
    ['dragleave', 'drop'].forEach((e) =>
      d.addEventListener(e, () => d.removeAttribute('data-sopra'))
    );
  });

/* ── Scheletro che diventa contenuto ───────────────────────── */
const carica = () =>
  tutti('[data-carica]').forEach((b) =>
    b.addEventListener('click', () => {
      const zona = uno(`[data-zona="${b.dataset.carica}"]`);
      zona.dataset.stato = 'attesa';
      b.setAttribute('aria-busy', 'true');
      setTimeout(() => {
        zona.dataset.stato = 'pronto';
        b.removeAttribute('aria-busy');
        avvisa('Altri 12 eventi caricati');
      }, 1100);
    })
  );

/* ── Tema ──────────────────────────────────────────────────── */
const tema = () =>
  tutti('[data-tema]').forEach((b) =>
    b.addEventListener('click', () => {
      const radice = document.documentElement;
      const prossimo = radice.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      radice.setAttribute('data-theme', prossimo);
      b.textContent = prossimo === 'dark' ? 'Tema chiaro' : 'Tema scuro';
    })
  );

/* ── Accensione ────────────────────────────────────────────── */
document.body.insertAdjacentHTML('afterbegin', SPRITE);
tutti('.percorso').forEach(disegnaPercorso);
tutti('.testata').forEach(testataViva);
tutti('[data-segmenti]').forEach((g) => cursoreScorrevole(g, '.segmento', '.segmenti__cursore'));
linguette();
fisarmonica();
fogli();
cifreCheSalgono();
copiatori();
contaCaratteri();
depositi();
carica();
tema();
esclusivo('[data-giorni]', '.giorno-cella');
premibile('.tag');
premibile('[data-salva]', (b, acceso) =>
  avvisa(acceso ? 'Salvato tra i tuoi eventi' : 'Tolto dai salvati', acceso ? 'salva' : 'chiudi')
);
tutti('[data-setaccio]').forEach(setaccio);
