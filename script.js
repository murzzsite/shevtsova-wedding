const LEAD_ENDPOINT = 'https://lead-relay.leestygpt.workers.dev/lead/G48CJAX7HA';

(() => {
  const reduce = document.documentElement.classList.contains('reduce');
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const easeIO = t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  const yearEl = $('#year'); if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* header + menu */
  const header = $('#header'), burger = $('#burger'), nav = $('#nav');
  burger?.addEventListener('click', () => {
    const open = burger.classList.toggle('is-open');
    nav.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', open);
  });
  $$('a', nav).forEach(a => a.addEventListener('click', () => {
    burger.classList.remove('is-open'); nav.classList.remove('is-open'); burger.setAttribute('aria-expanded', 'false');
  }));

  /* smooth anchors */
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const href = a.getAttribute('href');
    if (href.length <= 1) return;
    const t = $(href); if (!t) return;
    e.preventDefault();
    const top = href === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - 40;
    window.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' });
  }));

  /* phone mask (a Telegram nick stays as typed) */
  $$('input[type="tel"]').forEach(input => input.addEventListener('input', e => {
    const raw = e.target.value;
    if (/[a-zA-Zа-яА-Я@]/.test(raw)) return;
    let v = raw.replace(/\D/g, '');
    if (!v) { e.target.value = ''; return; }
    if (v.startsWith('8')) v = '7' + v.slice(1);
    if (!v.startsWith('7')) v = '7' + v;
    v = v.slice(0, 11);
    let out = '+7';
    if (v.length > 1) out += ' (' + v.slice(1, 4);
    if (v.length >= 4) out += ') ' + v.slice(4, 7);
    if (v.length >= 7) out += '-' + v.slice(7, 9);
    if (v.length >= 9) out += '-' + v.slice(9, 11);
    e.target.value = out;
  }));

  /* hero entrance */
  $$('.hero__h .w').forEach((w, i) => w.firstElementChild.style.setProperty('--i', i));
  $$('[data-rise]').forEach((el, i) => el.style.setProperty('--i', i));
  const ready = () => document.body.classList.add('is-ready');
  if (document.fonts && document.fonts.ready) {
    Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 900))]).then(() => requestAnimationFrame(ready));
  } else ready();
  setTimeout(ready, 1500);

  /* reveal on scroll */
  const revealEls = $$('[data-reveal]');
  const sib = new Map();
  revealEls.forEach(el => {
    const p = el.parentElement, n = sib.get(p) || 0;
    el.style.setProperty('--d', Math.min(n, 5) * 80 + 'ms');
    sib.set(p, n + 1);
  });

  /* magnetic buttons */
  if (!reduce && window.matchMedia('(hover: hover)').matches) {
    $$('[data-magnet]').forEach(b => {
      b.addEventListener('pointermove', e => {
        const r = b.getBoundingClientRect();
        b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .12}px, ${(e.clientY - r.top - r.height / 2) * .25}px)`;
      });
      b.addEventListener('pointerleave', () => { b.style.transform = ''; });
    });
  }

  /* ---------- scroll: header + reveal only, nothing pinned ---------- */
  const foot = $('.foot__name');
  let ticking = false;
  const check = () => {
    ticking = false;
    header?.classList.toggle('scrolled', window.scrollY > 8);
    const vh = window.innerHeight;
    revealEls.forEach(el => {
      if (!el.classList.contains('is-in') && el.getBoundingClientRect().top < vh * 0.92) el.classList.add('is-in');
    });
  };
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(check); } };
  function fitFoot() {
    if (!foot) return;
    const w = foot.parentElement.clientWidth - parseFloat(getComputedStyle(foot.parentElement).paddingLeft) * 2;
    foot.style.fontSize = '100px';
    const sw = foot.scrollWidth || 1;
    foot.style.fontSize = Math.floor(100 * w / sw) + 'px';
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => { fitFoot(); onScroll(); });
  window.addEventListener('load', () => { fitFoot(); check(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { fitFoot(); check(); });
  fitFoot(); check();
  if (document.fonts && document.fonts.addEventListener) document.fonts.addEventListener('loadingdone', fitFoot);
  setTimeout(fitFoot, 800); setTimeout(fitFoot, 2500);

  /* ---------- live: build the day ---------- */
  const FORMATS = {
    quiet: { name: 'Камерный ужин за городом', rows: [
      ['15:00', 'Гости собираются на велком, встречаем с игристым под скрипку или саксофон'],
      ['16:00', 'Церемония в саду, без сцены и суеты'],
      ['17:00', 'Аперитив на закате, живая музыка'],
      ['19:00', 'Ужин за одним длинным столом'],
      ['20:00', 'Тосты, первый танец, торт'],
      ['23:00', 'Трансфер гостей и тихое завершение']] },
    classic: { name: 'Классическая свадьба', rows: [
      ['10:00', 'Утро жениха, сборы без спешки'],
      ['14:30', 'Выездная церемония'],
      ['15:30', 'Фуршет и фотосессия'],
      ['17:00', 'Банкет, тосты, ведущий'],
      ['20:00', 'Первый танец и торт'],
      ['23:30', 'Финал и разъезд']] },
    grand: { name: 'Фешенебельная на ±100 гостей', rows: [
      ['09:00', 'Утро жениха и сборы'],
      ['14:00', 'Велком-зона, встреча гостей'],
      ['15:30', 'Церемония в главном зале'],
      ['17:00', 'Коктейль и фотозоны'],
      ['18:30', 'Банкет и шоу-программа'],
      ['22:00', 'Торт и фейерверк'],
      ['00:00', 'After-party и трансферы']] }
  };
  const HOBBY = {
    cars:   { label: 'Машины',    text: 'Выезд жениха на вашей машине: маршрут и парковку берём на себя', t: { quiet: '14:20', classic: '13:20', grand: '12:20' } },
    moto:   { label: 'Мотоциклы', text: 'Колонна мотоциклов встречает гостей, для байков готово место и кадр', t: { quiet: '14:40', classic: '14:00', grand: '13:20' } },
    padel:  { label: 'Падл',      text: 'Утро на корте: падл с друзьями жениха перед церемонией', t: { quiet: '11:00', classic: '08:00', grand: '07:30' } },
    nature: { label: 'Природа',   text: 'Пикник-зона на воздухе для гостей и запасной вариант на случай погоды', t: { quiet: '18:15', classic: '16:15', grand: '16:15' } }
  };
  const toMin = t => { const [h, m] = t.split(':').map(Number); return (h === 0 ? 24 : h) * 60 + m; };
  const rowsEl = $('#sheetRows'), fmtEl = $('#sheetFmt');
  const readDay = () => ({
    fmt: ($('input[name="fmt"]:checked') || {}).value || 'quiet',
    hob: $$('input[name="hob"]:checked').map(i => i.value)
  });
  function renderDay() {
    const { fmt, hob } = readDay();
    const f = FORMATS[fmt];
    const rows = f.rows.map(r => ({ t: r[0], x: r[1], mine: false }));
    hob.forEach(h => rows.push({ t: HOBBY[h].t[fmt], x: HOBBY[h].text, mine: true }));
    rows.sort((a, b) => toMin(a.t) - toMin(b.t));
    fmtEl.textContent = f.name;
    rowsEl.innerHTML = rows.map((r, i) =>
      `<li class="${r.mine ? 'is-mine' : ''}" style="--i:${i}"><time>${r.t}</time><span>${r.x}</span></li>`).join('');
  }
  $$('input[name="fmt"], input[name="hob"]').forEach(i => i.addEventListener('change', renderDay));
  renderDay();

  $('#dayGo')?.addEventListener('click', () => {
    const { fmt, hob } = readDay();
    const sel = $('#fmtSelect'), wish = $('#wishes');
    if (sel) [...sel.options].forEach(o => { if (o.text === FORMATS[fmt].name) sel.value = o.value; });
    if (wish && !wish.value.trim()) {
      wish.value = hob.length ? 'Люблю: ' + hob.map(h => HOBBY[h].label.toLowerCase()).join(', ') + '. Хочу, чтобы это было в программе дня.' : '';
    }
  });

  $$('[data-pack]').forEach(a => a.addEventListener('click', () => {
    const sel = $('#packSelect');
    if (sel) [...sel.options].forEach(o => { if (o.text.startsWith(a.dataset.pack)) sel.value = o.value; });
  }));

  /* ---------- form → Worker → Telegram ---------- */
  const form = $('#leadForm'), note = $('#formNote');
  form?.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const orig = btn.textContent;
    const payload = {};
    new FormData(form).forEach((v, k) => { payload[k] = v; });
    if (payload._gotcha) return;
    if (!payload.name || !payload.phone) { note.textContent = 'Заполните имя и телефон или Telegram'; return; }
    if (!form.consent.checked) { note.textContent = 'Нужно согласие на обработку данных'; return; }
    delete payload.consent;
    btn.disabled = true; btn.textContent = 'Отправляем…'; note.textContent = '';
    try {
      const resp = await fetch(LEAD_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      btn.textContent = 'Заявка отправлена';
      note.textContent = 'Спасибо! Лариса свяжется с вами, чтобы обсудить дату и формат.';
      form.reset();
    } catch (err) {
      console.error(err);
      btn.textContent = 'Ошибка, попробуйте ещё раз';
      note.textContent = 'Не удалось отправить. Попробуйте ещё раз через минуту.';
    } finally {
      setTimeout(() => { btn.textContent = orig; btn.disabled = false; }, 3500);
    }
  });
})();
