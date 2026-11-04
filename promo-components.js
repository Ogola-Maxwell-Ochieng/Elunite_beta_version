/* =====================================================================
   ELUNITE PROMO COMPONENTS — behaviour
   1. Promo entry pop-up  (markup lives in index.html, #promo-modal)
   2. Festive corner greeting badge (built from FESTIVE_GREETINGS below)

   Testing helpers (add to the URL):
     ?promo=1                 -> force the pop-up even if already seen today
     ?greeting=christmas      -> preview a different greeting
   ===================================================================== */
(function () {
  "use strict";

  /* -------------------------------------------------------------------
     CONFIG — edit these
     ------------------------------------------------------------------- */
  var PROMO_CONFIG = {
    delayMs: 1500, // after window "load"
    // Last day of the offer (inclusive, YYYY-MM-DD). After this the pop-up
    // stops appearing. Keep in sync with "Offer valid till" in index.html.
    endDate: "2026-11-30",
  };

  // ▶ WHICH GREETING IS SHOWING. It stays on the site until YOU change it.
  //   Set to one of the keys below (e.g. "christmas") to switch festivals,
  //   or to null to remove the badge completely.
  var ACTIVE_GREETING = "diwali";

  // Tapping the badge plays fireworks. (The offer pop-up opens on its own.)
  // icon: "diya" | "tree" | "crescent" | "kenya-flag" | "sparkle"
  //       or iconSrc: "images/your-icon.svg" for a custom image.
  // Optional: color (text colour), glow (CSS colour for the halo).
  var FESTIVE_GREETINGS = {
    diwali: { text: "Happy Diwali", icon: "diya" },
    jamhuri: { text: "Happy Jamhuri Day", icon: "kenya-flag", color: "#006600", glow: "rgba(187,0,0,0.30)" },
    christmas: { text: "Merry Christmas", icon: "tree", color: "#A61B29", glow: "rgba(255,195,18,0.45)" },
    "new-year": { text: "Happy New Year", icon: "sparkle" },
    eid: { text: "Eid Mubarak", icon: "crescent", color: "#0B6E4F" },
  };

  // Fireworks on every page visit/refresh while a greeting is active.
  // Set to 0 to turn them off (tapping the badge still plays them).
  var PAGE_LOAD_FIREWORKS_MS = 5000;

  // Firework colours (brand yellow/gold + warm festive tones)
  var FIREWORK_COLORS = ["#FFC312", "#FFD86B", "#B8860B", "#FF7A1A", "#FF4D6D", "#FFFFFF", "#7FD1FF"];

  /* -------------------------------------------------------------------
     Helpers
     ------------------------------------------------------------------- */
  var reduceMotion = false;
  try {
    reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch (e) {}

  var storage = {
    get: function (key) {
      try {
        return window.localStorage.getItem(key);
      } catch (e) {
        return null;
      }
    },
    set: function (key, value) {
      try {
        window.localStorage.setItem(key, value);
      } catch (e) {}
    },
  };

  function todayISO() {
    var d = new Date();
    var m = String(d.getMonth() + 1).padStart(2, "0");
    var day = String(d.getDate()).padStart(2, "0");
    return d.getFullYear() + "-" + m + "-" + day;
  }

  function getParam(name) {
    try {
      return new URLSearchParams(window.location.search).get(name);
    } catch (e) {
      return null;
    }
  }

  function onLoad(fn) {
    if (document.readyState === "complete") fn();
    else window.addEventListener("load", fn, { once: true });
  }

  /* -------------------------------------------------------------------
     1. PROMO MODAL
     ------------------------------------------------------------------- */
  function initPromo() {
    var modal = document.getElementById("promo-modal");
    if (!modal) return;

    var forced = getParam("promo") === "1";
    var today = todayISO();
    var expired = PROMO_CONFIG.endDate && today > PROMO_CONFIG.endDate; // ISO strings compare correctly
    // Shows on every visit and every refresh until the offer ends.
    if (!forced && expired) return;

    var dialog = modal.querySelector(".promo-dialog");
    var overlay = modal.querySelector(".promo-overlay");
    var closeBtn = modal.querySelector(".promo-close");
    var photo = modal.querySelector(".promo-photo");
    var lastFocus = null;
    var inertEls = [];
    var isOpen = false;

    // Load the cut-out photo; fall back to the illustration if it's missing.
    function loadPhoto() {
      if (!photo || photo.getAttribute("src")) return;
      var fallback = photo.getAttribute("data-fallback");
      photo.addEventListener("error", function onErr() {
        photo.removeEventListener("error", onErr);
        if (fallback) {
          photo.classList.add("is-illustration");
          photo.src = fallback;
        }
      });
      photo.src = photo.getAttribute("data-src");
    }

    function focusables() {
      return Array.prototype.filter.call(
        dialog.querySelectorAll('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'),
        function (el) {
          return el.offsetParent !== null || el === document.activeElement;
        }
      );
    }

    function setBackgroundInert(on) {
      if (on) {
        Array.prototype.forEach.call(document.body.children, function (el) {
          if (el === modal || el.tagName === "SCRIPT" || el.hasAttribute("inert")) return;
          el.setAttribute("inert", "");
          inertEls.push(el);
        });
      } else {
        inertEls.forEach(function (el) {
          el.removeAttribute("inert");
        });
        inertEls = [];
      }
    }

    function onKeydown(e) {
      if (e.key === "Escape" || e.key === "Esc") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== "Tab") return;
      var items = focusables();
      if (!items.length) {
        e.preventDefault();
        dialog.focus();
        return;
      }
      var first = items[0];
      var last = items[items.length - 1];
      var active = document.activeElement;
      if (e.shiftKey && (active === first || !dialog.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (active === last || !dialog.contains(active))) {
        e.preventDefault();
        first.focus();
      }
    }

    function open() {
      if (isOpen) return;
      // Don't interrupt someone already using another panel/dialog.
      var busy = document.querySelector(".enquiry-panel.open, .whatsapp-popup.is-open, .lead-modal:not([hidden])");
      if (busy && !forced) return;

      isOpen = true;
      lastFocus = document.activeElement;
      modal.hidden = false;
      void modal.offsetWidth; // reflow so the transition runs
      modal.classList.add("is-open");
      document.documentElement.classList.add("promo-lock");
      setBackgroundInert(true);
      document.addEventListener("keydown", onKeydown);
      closeBtn.focus({ preventScroll: true });
    }

    function close() {
      if (!isOpen) return;
      isOpen = false;
      modal.classList.remove("is-open");
      modal.classList.add("is-closing");
      document.removeEventListener("keydown", onKeydown);
      setBackgroundInert(false);

      window.setTimeout(function () {
        modal.hidden = true;
        modal.classList.remove("is-closing");
        document.documentElement.classList.remove("promo-lock");
        if (lastFocus && typeof lastFocus.focus === "function" && document.contains(lastFocus)) {
          lastFocus.focus({ preventScroll: true });
        }
      }, reduceMotion ? 120 : 260);
    }

    overlay.addEventListener("click", close);
    closeBtn.addEventListener("click", close);

    onLoad(function () {
      loadPhoto();
      window.setTimeout(open, PROMO_CONFIG.delayMs);
    });
  }

  /* -------------------------------------------------------------------
     FIREWORKS (canvas, no dependencies)
     originEl:   launch rockets from this element (null = from the bottom
                 of the screen at random spots)
     durationMs: how long rockets keep launching; the last bursts then fade.
     ------------------------------------------------------------------- */
  var fireworksRunning = false;

  function playFireworks(originEl, durationMs) {
    if (reduceMotion || fireworksRunning) return;
    var canvas = document.createElement("canvas");
    var ctx = canvas.getContext && canvas.getContext("2d");
    if (!ctx) return;
    fireworksRunning = true;
    canvas.className = "fireworks-canvas";
    canvas.setAttribute("aria-hidden", "true");
    document.body.appendChild(canvas);

    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0;
    var H = 0;
    function resize() {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    var r = originEl ? originEl.getBoundingClientRect() : null;
    var ox = r ? r.left + Math.min(r.width, 60) / 2 : 0;
    var oy = r ? r.top : H;

    function rand(a, b) {
      return a + Math.random() * (b - a);
    }
    function pick(arr) {
      return arr[Math.floor(Math.random() * arr.length)];
    }

    // Launch plan: rockets staggered over durationMs, bursting across the
    // upper part of the screen.
    var small = W < 600;
    var gap = small ? 380 : 280; // ms between launches
    var count = Math.max(small ? 5 : 7, Math.round((durationMs || 1800) / gap));
    var rockets = [];
    for (var i = 0; i < count; i++) {
      var cols = small ? 5 : 7;
      var col = i % cols;
      rockets.push({
        delay: i * gap + rand(0, 120),
        dur: rand(650, 900),
        sx: r ? ox + rand(-10, 10) : rand(W * 0.1, W * 0.9),
        sy: oy,
        tx: (W * (col + 0.5)) / cols + rand(-40, 40),
        ty: rand(H * 0.12, H * 0.45),
        exploded: false,
        x: 0,
        y: 0,
        trail: [],
      });
    }
    var particles = [];
    var start = performance.now();
    var last = start;

    function explode(x, y) {
      var c1 = pick(FIREWORK_COLORS);
      var c2 = pick(FIREWORK_COLORS);
      var n = small ? 60 : 90;
      var power = rand(4.2, 6.6);
      for (var k = 0; k < n; k++) {
        var a = (Math.PI * 2 * k) / n + rand(-0.06, 0.06);
        var s = power * rand(0.55, 1);
        particles.push({
          x: x, y: y, px: x, py: y,
          vx: Math.cos(a) * s,
          vy: Math.sin(a) * s,
          life: 1,
          decay: rand(0.010, 0.017),
          color: k % 3 === 0 ? c2 : c1,
          size: rand(2, 3.4),
          sparkle: Math.random() < 0.3,
        });
      }
      // bright flash core
      particles.push({ x: x, y: y, px: x, py: y, vx: 0, vy: 0, life: 1, decay: 0.06, color: "#FFFFFF", size: 14, flash: true });
    }

    function frame(now) {
      var dt = Math.min((now - last) / 16.667, 3); // 1 = one 60fps frame
      last = now;
      var t = now - start;
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = "lighter";

      var alive = false;

      rockets.forEach(function (rk) {
        if (rk.exploded) return;
        alive = true;
        if (t < rk.delay) return;
        var p = Math.min((t - rk.delay) / rk.dur, 1);
        var e = 1 - Math.pow(1 - p, 3); // ease-out
        rk.x = rk.sx + (rk.tx - rk.sx) * e;
        rk.y = rk.sy + (rk.ty - rk.sy) * e;
        rk.trail.push({ x: rk.x, y: rk.y });
        if (rk.trail.length > 10) rk.trail.shift();
        ctx.lineCap = "round";
        for (var j = 1; j < rk.trail.length; j++) {
          ctx.strokeStyle = "rgba(255, 214, 120," + (j / rk.trail.length) * 0.9 + ")";
          ctx.lineWidth = 2.2 * (j / rk.trail.length);
          ctx.beginPath();
          ctx.moveTo(rk.trail[j - 1].x, rk.trail[j - 1].y);
          ctx.lineTo(rk.trail[j].x, rk.trail[j].y);
          ctx.stroke();
        }
        if (p >= 1) {
          rk.exploded = true;
          explode(rk.x, rk.y);
        }
      });

      for (var q = particles.length - 1; q >= 0; q--) {
        var pt = particles[q];
        pt.px = pt.x;
        pt.py = pt.y;
        pt.vx *= Math.pow(0.975, dt);
        pt.vy = pt.vy * Math.pow(0.975, dt) + 0.055 * dt; // gravity
        pt.x += pt.vx * dt;
        pt.y += pt.vy * dt;
        pt.life -= pt.decay * dt;
        if (pt.life <= 0) {
          particles.splice(q, 1);
          continue;
        }
        alive = true;
        if (pt.flash) {
          var g = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, pt.size * 3);
          g.addColorStop(0, "rgba(255,255,255," + pt.life + ")");
          g.addColorStop(1, "rgba(255,200,80,0)");
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, pt.size * 3, 0, Math.PI * 2);
          ctx.fill();
          continue;
        }
        var alpha = pt.sparkle ? pt.life * (0.5 + Math.random() * 0.5) : pt.life;
        ctx.globalAlpha = Math.max(alpha, 0);
        ctx.strokeStyle = pt.color;
        ctx.lineWidth = pt.size;
        ctx.beginPath();
        ctx.moveTo(pt.px, pt.py);
        ctx.lineTo(pt.x, pt.y);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
      ctx.globalCompositeOperation = "source-over";

      if (alive) {
        window.requestAnimationFrame(frame);
      } else {
        window.removeEventListener("resize", resize);
        if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
        fireworksRunning = false;
      }
    }
    window.requestAnimationFrame(frame);
  }

  /* -------------------------------------------------------------------
     2. FESTIVE BADGE
     ------------------------------------------------------------------- */
  function sparklePath(cx, cy, r) {
    return (
      "M" + cx + " " + (cy - r) +
      "Q" + cx + " " + cy + " " + (cx + r) + " " + cy +
      "Q" + cx + " " + cy + " " + cx + " " + (cy + r) +
      "Q" + cx + " " + cy + " " + (cx - r) + " " + cy +
      "Q" + cx + " " + cy + " " + cx + " " + (cy - r) + "Z"
    );
  }

  var ICONS = {
    diya:
      '<svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">' +
      "<defs>" +
      '<linearGradient id="fx-diya-body" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E9892B"/><stop offset="1" stop-color="#9C4211"/></linearGradient>' +
      '<radialGradient id="fx-diya-flame" cx=".5" cy=".78" r=".75"><stop offset="0" stop-color="#FFF7CF"/><stop offset=".45" stop-color="#FFC312"/><stop offset="1" stop-color="#FF6A00"/></radialGradient>' +
      "</defs>" +
      '<path class="festive-flame" d="M24 4.5c3.4 5.2 6.4 8.8 6.4 13.2a6.4 6.4 0 0 1-12.8 0c0-4.4 3-8 6.4-13.2z" fill="url(#fx-diya-flame)"/>' +
      '<path class="festive-flame-inner" d="M24 12.5c1.5 2.5 2.7 4.2 2.7 6.1a2.7 2.7 0 0 1-5.4 0c0-1.9 1.2-3.6 2.7-6.1z" fill="#FFFBE6"/>' +
      '<rect x="23.3" y="21.5" width="1.4" height="5" rx=".7" fill="#4A2208"/>' +
      '<path d="M4 25.5c3.6 1.8 7.2 2.5 11 2.5h18c3.8 0 7.4-.7 11-2.5-1.6 7.6-8.6 14-20 14S5.6 33.1 4 25.5z" fill="url(#fx-diya-body)"/>' +
      '<path d="M4 25.5c3.6 1.8 7.2 2.5 11 2.5h18c3.8 0 7.4-.7 11-2.5" fill="none" stroke="#FFD27A" stroke-width="1.6" stroke-linecap="round"/>' +
      '<circle cx="15" cy="32.5" r="1.3" fill="#FFD27A"/><circle cx="24" cy="34" r="1.5" fill="#FFC312"/><circle cx="33" cy="32.5" r="1.3" fill="#FFD27A"/>' +
      '<path d="M18 39h12l-1.6 3.5h-8.8z" fill="#7D3510"/>' +
      "</svg>",

    tree:
      '<svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">' +
      '<path d="M24 11 13.5 24.5h5.2L11 34h7.2L11.5 42h25L29.8 34H37l-7.7-9.5h5.2z" fill="#1E7B3C"/>' +
      '<path d="M24 11 18.7 24.5 24 21z" fill="#2E9A50" opacity=".6"/>' +
      '<rect x="21.5" y="42" width="5" height="4" rx="1" fill="#7A4A1F"/>' +
      '<path class="festive-twinkle" d="' + "M24 2.5l1.9 3.9 4.3.6-3.1 3 .7 4.2L24 12.2l-3.8 2 .7-4.2-3.1-3 4.3-.6z" + '" fill="#FFC312"/>' +
      '<circle class="festive-twinkle" cx="20" cy="27" r="1.7" fill="#E63946"/>' +
      '<circle class="festive-twinkle" cx="28.5" cy="31" r="1.7" fill="#FFC312"/>' +
      '<circle class="festive-twinkle" cx="18.5" cy="38" r="1.7" fill="#FFC312"/>' +
      '<circle class="festive-twinkle" cx="29" cy="39" r="1.7" fill="#E63946"/>' +
      "</svg>",

    crescent:
      '<svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">' +
      '<circle cx="21" cy="25" r="16" fill="#E0B23B"/>' +
      '<circle cx="28.5" cy="20" r="13.5" fill="#FFFFFF"/>' +
      '<path class="festive-twinkle" d="' + sparklePath(33, 25, 5.5) + '" fill="#E0B23B"/>' +
      '<path class="festive-twinkle" d="' + sparklePath(40, 13, 3) + '" fill="#E0B23B"/>' +
      "</svg>",

    "kenya-flag":
      '<svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">' +
      '<defs><clipPath id="fx-ke-clip"><rect x="4" y="11" width="40" height="27" rx="3.5"/></clipPath></defs>' +
      '<g class="festive-wave" clip-path="url(#fx-ke-clip)">' +
      '<rect x="4" y="11" width="40" height="9" fill="#000"/>' +
      '<rect x="4" y="20" width="40" height="9" fill="#BB0000"/>' +
      '<rect x="4" y="29" width="40" height="9" fill="#006600"/>' +
      '<rect x="4" y="19.2" width="40" height="1.6" fill="#fff"/>' +
      '<rect x="4" y="28.2" width="40" height="1.6" fill="#fff"/>' +
      '<path d="M17 14.5 31 34.5M31 14.5 17 34.5" stroke="#fff" stroke-width="1.3" stroke-linecap="round"/>' +
      '<path d="M24 13.5c3.6 2.8 4.6 6.6 4.6 11s-1 8.2-4.6 11c-3.6-2.8-4.6-6.6-4.6-11s1-8.2 4.6-11z" fill="#BB0000" stroke="#000" stroke-width=".6"/>' +
      '<path d="M19.9 18.5c.8-1.8 2.1-3.4 4.1-5v22c-2-1.6-3.3-3.2-4.1-5zM28.1 18.5c-.8-1.8-2.1-3.4-4.1-5v22c2-1.6 3.3-3.2 4.1-5z" fill="#000" opacity=".85"/>' +
      '<ellipse cx="24" cy="24.5" rx="1.4" ry="2.4" fill="#fff"/>' +
      "</g></svg>",

    sparkle:
      '<svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">' +
      '<g stroke="#FFC312" stroke-width="2" stroke-linecap="round" class="festive-twinkle">' +
      '<path d="M24 8v6M24 34v6M8 24h6M34 24h6M12.7 12.7l4.2 4.2M31.1 31.1l4.2 4.2M35.3 12.7l-4.2 4.2M16.9 31.1l-4.2 4.2"/>' +
      "</g>" +
      '<path class="festive-twinkle" d="' + sparklePath(24, 24, 8) + '" fill="#B8860B"/>' +
      '<path class="festive-twinkle" d="' + sparklePath(40, 8, 3.5) + '" fill="#E63946"/>' +
      '<path class="festive-twinkle" d="' + sparklePath(8, 40, 3) + '" fill="#1D4ED8"/>' +
      '<path class="festive-twinkle" d="' + sparklePath(41, 40, 2.5) + '" fill="#B8860B"/>' +
      "</svg>",
  };

  function pickGreeting() {
    var key = getParam("greeting") || ACTIVE_GREETING;
    return (key && Object.prototype.hasOwnProperty.call(FESTIVE_GREETINGS, key)) ? FESTIVE_GREETINGS[key] : null;
  }

  function initFestive() {
    var g = pickGreeting();
    if (!g) return;

    var badge = document.createElement("button");
    badge.type = "button";
    badge.className = "festive-badge";
    badge.setAttribute("aria-label", g.text + " from Elunite — tap for fireworks");
    if (g.color) badge.style.setProperty("--festive-color", g.color);
    if (g.glow) badge.style.setProperty("--festive-glow", g.glow);

    var icon = document.createElement("span");
    icon.className = "festive-icon";
    icon.innerHTML = '<span class="festive-glow" aria-hidden="true"></span>';
    if (g.iconSrc) {
      var img = document.createElement("img");
      img.src = g.iconSrc;
      img.alt = "";
      img.width = 44;
      img.height = 44;
      img.style.position = "relative";
      icon.appendChild(img);
    } else {
      icon.insertAdjacentHTML("beforeend", ICONS[g.icon] || ICONS.sparkle);
    }

    var text = document.createElement("span");
    text.className = "festive-text";
    text.textContent = g.text;

    badge.appendChild(icon);
    badge.appendChild(text);
    document.body.appendChild(badge);

    badge.addEventListener("click", function () {
      playFireworks(badge, 1800);
    });

    onLoad(function () {
      window.setTimeout(function () {
        badge.classList.add("is-in");
      }, 700);
      // Celebrate every visit / refresh: a few seconds of fireworks, then
      // they stop until someone taps the badge. (Waits for the preloader.)
      if (PAGE_LOAD_FIREWORKS_MS > 0) {
        window.setTimeout(function () {
          playFireworks(null, PAGE_LOAD_FIREWORKS_MS);
        }, 900);
      }
    });
  }

  /* ------------------------------------------------------------------- */
  function init() {
    initPromo();
    initFestive();
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
