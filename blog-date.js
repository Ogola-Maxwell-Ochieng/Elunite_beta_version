/**
 * ELUNITE BLOG DATE FORMATTER — SHARED LOGIC
 * ═══════════════════════════════════════════════════════════════
 * Turns a post's "YYYY-MM-DD" date into "Updated X hours/days ago"
 * for the first 3 days, then falls back to an absolute date like
 * "Updated Sep 10th, 2026". Used by:
 *   - blog.html card grid (elements with [data-updated-date])
 *   - individual blog post hero (elements with [data-updated-date])
 *   - blog-teaser.js ("Latest Blogs" widgets, via window.EluniteBlogDate)
 * ═══════════════════════════════════════════════════════════════
 */
(function () {
  "use strict";

  function ordinal(n) {
    var suffixes = ["th", "st", "nd", "rd"];
    var v = n % 100;
    return n + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
  }

  function formatAbsolute(date) {
    var month = date.toLocaleDateString("en-US", { month: "short" });
    return month + " " + ordinal(date.getDate()) + ", " + date.getFullYear();
  }

  // dateStr: "YYYY-MM-DD". prefix: e.g. "Updated " (default) or "" for a bare date.
  function formatUpdated(dateStr, prefix) {
    if (prefix === undefined) prefix = "Updated ";
    var published = new Date(dateStr + "T00:00:00");
    var diffMs = Date.now() - published.getTime();

    if (isNaN(published.getTime()) || diffMs < 0) {
      return prefix + formatAbsolute(published);
    }

    var diffHours = Math.floor(diffMs / 3600000);
    var diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return prefix + "just now";
    if (diffDays < 1) {
      return prefix + diffHours + " hour" + (diffHours === 1 ? "" : "s") + " ago";
    }
    if (diffDays <= 3) {
      return prefix + diffDays + " day" + (diffDays === 1 ? "" : "s") + " ago";
    }
    return prefix + formatAbsolute(published);
  }

  function apply() {
    var nodes = document.querySelectorAll("[data-updated-date]");
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var dateStr = el.getAttribute("data-updated-date");
      if (!dateStr) continue;
      var prefix = el.hasAttribute("data-updated-prefix")
        ? el.getAttribute("data-updated-prefix")
        : "Updated ";
      el.textContent = formatUpdated(dateStr, prefix);
    }
  }

  apply();

  window.EluniteBlogDate = { formatUpdated: formatUpdated, apply: apply };
})();
