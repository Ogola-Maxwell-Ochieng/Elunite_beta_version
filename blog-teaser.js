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

  // Inline Lucide icon paths (site no longer loads the Lucide JS runtime;
  // only the handful of icons used by post cover fallbacks are needed here).
  var ICON_PATHS = {
    award:
      '<path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526"></path><circle cx="12" cy="8" r="6"></circle>',
    "book-open":
      '<path d="M12 7v14"></path><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"></path>',
    "globe-2":
      '<path d="M21.54 15H17a2 2 0 0 0-2 2v4.54"></path><path d="M7 3.34V5a3 3 0 0 0 3 3a2 2 0 0 1 2 2c0 1.1.9 2 2 2a2 2 0 0 0 2-2c0-1.1.9-2 2-2h3.17"></path><path d="M11 21.95V18a2 2 0 0 0-2-2a2 2 0 0 1-2-2v-1a2 2 0 0 0-2-2H2.05"></path><circle cx="12" cy="12" r="10"></circle>',
    "graduation-cap":
      '<path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"></path><path d="M22 10v6"></path><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"></path>',
    landmark:
      '<line x1="3" x2="21" y1="22" y2="22"></line><line x1="6" x2="6" y1="18" y2="11"></line><line x1="10" x2="10" y1="18" y2="11"></line><line x1="14" x2="14" y1="18" y2="11"></line><line x1="18" x2="18" y1="18" y2="11"></line><polygon points="12 2 20 7 4 7"></polygon>',
    "shield-check":
      '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path><path d="m9 12 2 2 4-4"></path>',
    wallet:
      '<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"></path><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"></path>',
    compass:
      '<path d="m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z"></path><circle cx="12" cy="12" r="10"></circle>',
  };

  function iconSvg(name, styleAttr) {
    var paths = ICON_PATHS[name] || ICON_PATHS["book-open"];
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-' +
      name +
      '"' +
      (styleAttr ? ' style="' + styleAttr + '"' : "") +
      ">" +
      paths +
      "</svg>"
    );
  }

  // Shares logic with blog.html and individual post pages (blog-date.js):
  // "X hours/days ago" for the first 3 days, then an absolute date.
  function formatDate(dateStr) {
    if (window.EluniteBlogDate) {
      return window.EluniteBlogDate.formatUpdated(dateStr, "");
    }
    var d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  function coverMarkup(post) {
    if (post.image) {
      return (
        '<img src="' +
        escapeHtml(post.image) +
        '" alt="' +
        escapeHtml(post.title) +
        '" width="1920" height="1080" />'
      );
    }
    return (
      '<div style="min-height:220px;display:flex;align-items:center;justify-content:center;background:var(--gradient-accent);">' +
      iconSvg(post.icon || "book-open", "width:56px;height:56px;color:#1a1a2e;") +
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
      formatDate(featured.date) +
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
        formatDate(post.date) +
        " &nbsp;\u2022&nbsp; " +
        escapeHtml(post.readTime) +
        "</p>" +
        "</div>" +
        "<div></div>" +
        "</article>"
      );
    })
    .join("");
})();
