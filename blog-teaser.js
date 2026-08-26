/**
 * ELUNITE "LATEST BLOGS" TEASER RENDERER
 * ═══════════════════════════════════════════════════════════════
 * Fills in the featured card + 3 sidebar cards on index.html,
 * about.html, destination.html, and service.html, always showing
 * the newest posts first, read live from blog-posts-data.js.
 *
 * Requires two elements to already exist on the page:
 *   <article id="blog-teaser-featured" class="blog-featured">...</article>
 *   <div id="blog-teaser-sidebar" class="blog-sidebar">...</div>
 * Whatever is inside them already is just a fallback shown if this
 * script fails to load, it gets replaced automatically on page load.
 * ═══════════════════════════════════════════════════════════════
 */

(function () {
  if (typeof ELUNITE_BLOG_POSTS === "undefined") return;

  var featuredEl = document.getElementById("blog-teaser-featured");
  var sidebarEl = document.getElementById("blog-teaser-sidebar");
  if (!featuredEl || !sidebarEl) return;

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function shortDate(dateStr) {
    var d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  function timeAgo(dateStr) {
    var diffMs = Date.now() - new Date(dateStr + "T00:00:00").getTime();
    var diffDays = Math.max(0, Math.round(diffMs / 86400000));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "1 day ago";
    return diffDays + " days ago";
  }

  function coverMarkup(post) {
    if (post.image) {
      return (
        '<img src="' +
        escapeHtml(post.image) +
        '" alt="' +
        escapeHtml(post.title) +
        '" />'
      );
    }
    return (
      '<div style="min-height:220px;display:flex;align-items:center;justify-content:center;background:var(--gradient-accent);">' +
      '<i data-lucide="' +
      escapeHtml(post.icon || "book-open") +
      '" style="width:56px;height:56px;color:#1a1a2e;"></i>' +
      "</div>"
    );
  }

  // Sort newest first, exactly like blog.html
  var posts = ELUNITE_BLOG_POSTS.slice().sort(function (a, b) {
    return new Date(b.date) - new Date(a.date);
  });

  var featured = posts[0];
  var sidebarPosts = posts.slice(1, 4);

  if (featured) {
    featuredEl.innerHTML =
      '<a href="' +
      escapeHtml(featured.url) +
      '" class="blog-featured-img">' +
      coverMarkup(featured) +
      "</a>" +
      '<div class="blog-featured-body">' +
      '<p class="blog-meta">' +
      timeAgo(featured.date) +
      " &nbsp;\u2022&nbsp; " +
      escapeHtml(featured.readTime) +
      "</p>" +
      '<h3 class="blog-featured-title">' +
      '<a href="' +
      escapeHtml(featured.url) +
      '" style="text-decoration: none; color: inherit;">' +
      escapeHtml(featured.title) +
      "</a>" +
      "</h3>" +
      "</div>";
  }

  sidebarEl.innerHTML = sidebarPosts
    .map(function (post) {
      return (
        '<article class="blog-card">' +
        '<div class="blog-card-text">' +
        "<h4>" +
        '<a href="' +
        escapeHtml(post.url) +
        '">' +
        escapeHtml(post.title) +
        "</a>" +
        "</h4>" +
        '<p class="blog-meta">' +
        shortDate(post.date) +
        " &nbsp;\u2022&nbsp; " +
        escapeHtml(post.readTime) +
        "</p>" +
        "</div>" +
        "<div></div>" +
        "</article>"
      );
    })
    .join("");

  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
})();
