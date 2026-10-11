/* 조현준 — portfolio script (vanilla JS, no dependencies)
   1. Project detail expand / collapse (card click, toggle, bottom 접기, Esc, deep links)
   2. Current-section highlight in the nav
   3. Copy e-mail button
   Testing hook: <body class="open-all"> opens every project detail on load. */
(function () {
  'use strict';

  var d = document;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var header = d.querySelector('.site-header');

  function headerH() {
    return header ? header.offsetHeight : 0;
  }

  function scrollBehavior() {
    return reduceMotion ? 'auto' : 'smooth';
  }

  /* 1. Project detail expand / collapse ------------------------------------ */
  var toggles = Array.prototype.slice.call(d.querySelectorAll('.project__toggle'));

  function cardOf(btn) {
    return btn.closest('.project');
  }

  function toggleFor(panelId) {
    return toggles.filter(function (b) {
      return b.getAttribute('aria-controls') === panelId;
    })[0] || null;
  }

  // byUser: opened from a click / key press (not from a deep link or open-all).
  function setOpen(btn, open, byUser) {
    var panel = d.getElementById(btn.getAttribute('aria-controls'));
    var card = cardOf(btn);
    if (!panel || !card) return;

    if (!open && panel.contains(d.activeElement)) {
      btn.focus({ preventScroll: true });
    }

    panel.hidden = !open;
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    card.classList.toggle('is-open', open);

    if (open && byUser) {
      // On wide screens the panel is not the next element in DOM order, so make
      // it the next focus stop explicitly (Esc / 접기 return focus to the button),
      // then keep the card and the top of its detail in view.
      panel.focus({ preventScroll: true });
      var rect = card.getBoundingClientRect();
      if (rect.top < headerH() || rect.bottom > window.innerHeight - 160) {
        card.scrollIntoView({ block: 'start', behavior: scrollBehavior() });
      }
    }
  }

  function flip(btn) {
    setOpen(btn, btn.getAttribute('aria-expanded') !== 'true', true);
  }

  toggles.forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      flip(btn);
    });
  });

  // The whole card is a target, but links keep working and selecting text
  // inside the card never toggles it.
  Array.prototype.forEach.call(d.querySelectorAll('.project'), function (card) {
    card.addEventListener('click', function (e) {
      if (e.target.closest('a, button')) return;
      var sel = window.getSelection ? window.getSelection() : null;
      if (sel && String(sel).length) return;
      var btn = card.querySelector('.project__toggle');
      if (btn) flip(btn);
    });
  });

  // 접기 at the bottom of a detail: close, return focus to the card's button.
  Array.prototype.forEach.call(d.querySelectorAll('.detail__close'), function (closeBtn) {
    closeBtn.addEventListener('click', function () {
      var btn = toggleFor(closeBtn.getAttribute('data-close'));
      if (!btn) return;
      setOpen(btn, false, false);
      btn.focus({ preventScroll: true });
      cardOf(btn).scrollIntoView({ block: 'nearest', behavior: scrollBehavior() });
    });
  });

  // Escape closes the detail that holds focus (or whose toggle has focus).
  d.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape' && e.key !== 'Esc') return;
    var active = d.activeElement;
    if (!active) return;
    var btn = null;
    var panel = active.closest('.project__detail');
    if (panel) btn = toggleFor(panel.id);
    else if (active.classList.contains('project__toggle')) btn = active;
    if (btn && btn.getAttribute('aria-expanded') === 'true') {
      setOpen(btn, false, false);
      btn.focus({ preventScroll: true });
    }
  });

  if (d.body.classList.contains('open-all')) {
    toggles.forEach(function (btn) { setOpen(btn, true, false); });
  }

  // Deep links (#project-xxx or #detail-xxx) open the matching project.
  function openFromHash() {
    var id = location.hash.slice(1);
    if (!id) return;
    var btn = toggles.filter(function (b) {
      return b.getAttribute('aria-controls') === id || cardOf(b).id === id;
    })[0];
    if (btn) setOpen(btn, true, false);
  }

  openFromHash();
  window.addEventListener('hashchange', openFromHash);

  /* 2. Current-section highlight in the nav -------------------------------- */
  var navLinks = Array.prototype.slice.call(d.querySelectorAll('.site-nav a[href^="#"]'));
  var targets = navLinks.map(function (a) {
    return d.getElementById(a.getAttribute('href').slice(1));
  });
  var ticking = false;

  function updateNav() {
    ticking = false;
    var line = window.innerHeight * 0.35;
    var current = -1; // nothing is current while the hero is in view
    targets.forEach(function (sec, i) {
      if (sec && sec.getBoundingClientRect().top <= line) current = i;
    });
    if (window.innerHeight + window.scrollY >= d.documentElement.scrollHeight - 2) {
      current = targets.length - 1;
    }
    navLinks.forEach(function (a, i) {
      if (i === current) a.setAttribute('aria-current', 'location');
      else a.removeAttribute('aria-current');
    });
  }

  function requestNavUpdate() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(updateNav);
    }
  }

  window.addEventListener('scroll', requestNavUpdate, { passive: true });
  window.addEventListener('resize', requestNavUpdate);
  updateNav();

  /* 3. Copy e-mail button -------------------------------------------------- */
  var copyBtn = d.querySelector('[data-copy]');
  var status = d.getElementById('copy-status');

  if (copyBtn) {
    var idleLabel = copyBtn.textContent;
    var timer = null;

    var report = function (ok) {
      copyBtn.textContent = ok ? '복사됨' : '복사 실패';
      if (status) status.textContent = ok ? '이메일 주소를 복사했습니다' : '복사하지 못했습니다';
      window.clearTimeout(timer);
      timer = window.setTimeout(function () {
        copyBtn.textContent = idleLabel;
        if (status) status.textContent = '';
      }, 1600);
    };

    var legacyCopy = function (text) {
      var area = d.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.opacity = '0';
      d.body.appendChild(area);
      area.select();
      var ok = false;
      try { ok = d.execCommand('copy'); } catch (e) { ok = false; }
      d.body.removeChild(area);
      return ok;
    };

    copyBtn.addEventListener('click', function () {
      var text = copyBtn.getAttribute('data-copy');
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(
          function () { report(true); },
          function () { report(legacyCopy(text)); }
        );
      } else {
        report(legacyCopy(text));
      }
    });
  }
})();
