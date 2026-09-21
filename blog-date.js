/**
 * ELUNITE BLOG DATE FORMATTER — SHARED LOGIC
 * ═══════════════════════════════════════════════════════════════
 * Turns a post's "YYYY-MM-DD" date into "Updated today" / "Updated
 * yesterday" / "Updated X days ago" for the first 3 days, then falls
 * back to an absolute date like "Updated Sep 10th, 2026". Used by:
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
  //
  // Posts only store a calendar date, not a real publish timestamp, so this
  // compares calendar days rather than raw elapsed hours. Anchoring to
  // midnight and measuring elapsed hours from there (the previous approach)
  // made a post look like it was hours old the moment it went up, since
  // "hours since midnight" is just "how late in the day it is right now".
  function formatUpdated(dateStr, prefix) {
    if (prefix === undefined) prefix = "Updated ";
    var published = new Date(dateStr + "T00:00:00");

    if (isNaN(published.getTime())) {
      return prefix + formatAbsolute(published);
    }

    var now = new Date();
    var startOfPublished = new Date(published.getFullYear(), published.getMonth(), published.getDate());
    var startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var diffDays = Math.round((startOfToday - startOfPublished) / 86400000);

    if (diffDays < 0) return prefix + formatAbsolute(published);
    if (diffDays === 0) return prefix + "today";
    if (diffDays === 1) return prefix + "yesterday";
    if (diffDays <= 3) return prefix + diffDays + " days ago";
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
