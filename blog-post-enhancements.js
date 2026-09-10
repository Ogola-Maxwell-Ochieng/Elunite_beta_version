/**
 * ELUNITE BLOG POST ENHANCEMENTS
 * ═══════════════════════════════════════════════════════════════
 * Shared behaviour for every individual blog article page:
 *   1. Injects the social share bar (Facebook / X / LinkedIn) at
 *      the end of the article card.
 *   2. Reads ELUNITE_BLOG_POSTS (from blog-posts-data.js) and
 *      renders a "More Articles" related-posts grid at the end
 *      of the article section.
 *
 * Works seamlessly across:
 *   - Localhost (file:// or http://localhost.../slug.html)
 *   - Live production (clean URLs, trailing slashes, subdomains)
 *   - Social and search query parameters
 * ═══════════════════════════════════════════════════════════════
 */
(function () {
  'use strict';

  // Inline Lucide icon paths (site no longer loads the Lucide JS runtime;
  // only the handful of icons used by the related-articles cards are needed here).
  var ICON_PATHS = {
    clock: '<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>',
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
    "file-text":
      '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path><path d="M10 9H8"></path><path d="M16 13H8"></path><path d="M16 17H8"></path>',
    compass:
      '<path d="m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z"></path><circle cx="12" cy="12" r="10"></circle>',
  };

  function iconSvg(name) {
    var paths = ICON_PATHS[name] || ICON_PATHS["file-text"];
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-' +
      name +
      '">' +
      paths +
      "</svg>"
    );
  }

  function initBlogEnhancements() {
    // Determine the shareable canonical page URL and document title
    var canonicalTag = document.querySelector('link[rel="canonical"]');
    var rawUrl = (canonicalTag && canonicalTag.getAttribute('href')) || window.location.href;
    var pageUrl = encodeURIComponent(rawUrl.split('#')[0]);
    var pageTitle = encodeURIComponent(document.title.replace(/\s*–\s*Elunite.*$/i, '').trim() || document.title);

    /* ── 1. Social share bar ── */
    var shareHtml =
      '<div class="article-share">' +
        '<span class="article-share-label">Share:</span>' +
        '<a href="https://www.facebook.com/sharer/sharer.php?u=' + pageUrl + '" target="_blank" rel="noopener noreferrer" class="article-share-btn share-btn--facebook" aria-label="Share on Facebook">' +
          '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95C18.05 21.45 22 17.19 22 12z"/></svg>' +
          'Facebook' +
        '</a>' +
        '<a href="https://twitter.com/intent/tweet?url=' + pageUrl + '&text=' + pageTitle + '" target="_blank" rel="noopener noreferrer" class="article-share-btn share-btn--x" aria-label="Share on X (Twitter)">' +
          '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.258 5.631 5.906-5.631Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>' +
          'X / Twitter' +
        '</a>' +
        '<a href="https://www.linkedin.com/sharing/share-offsite/?url=' + pageUrl + '" target="_blank" rel="noopener noreferrer" class="article-share-btn share-btn--linkedin" aria-label="Share on LinkedIn">' +
          '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>' +
          'LinkedIn' +
        '</a>' +
      '</div>';

    /* Inject share bar into the article-card-wrap (or article-body fallback) if not already present */
    var existingShare = document.querySelector('.article-share');
    if (!existingShare) {
      var wrap = document.querySelector('.article-card-wrap') || document.querySelector('.article-body');
      if (wrap) wrap.insertAdjacentHTML('beforeend', shareHtml);
    }

    /* ── 2. Related articles ("More Articles") ── */
    if (typeof ELUNITE_BLOG_POSTS === 'undefined' || !Array.isArray(ELUNITE_BLOG_POSTS) || !ELUNITE_BLOG_POSTS.length) {
      return;
    }

    // If related articles section already rendered, prevent duplicate
    if (document.querySelector('.related-articles')) return;

    // Helper: Normalize URL to a comparable slug without domain, query, hash, slashes, or .html
    function normalizeSlug(str) {
      if (!str) return '';
      try {
        str = decodeURIComponent(str);
      } catch (e) {}
      return str
        .split('?')[0]
        .split('#')[0]
        .replace(/^https?:\/\/[^\/]+/, '')
        .replace(/^\/+|\/+$/g, '')
        .split('/')
        .pop()
        .replace(/\.html$/i, '')
        .trim()
        .toLowerCase();
    }

    var currentPathSlug = normalizeSlug(window.location.pathname) || normalizeSlug(window.location.href);
    var canonicalSlug = canonicalTag ? normalizeSlug(canonicalTag.getAttribute('href')) : '';
    var ogUrlMeta = document.querySelector('meta[property="og:url"]');
    var ogSlug = ogUrlMeta ? normalizeSlug(ogUrlMeta.getAttribute('content')) : '';

    // Match current post against ELUNITE_BLOG_POSTS
    var currentPost = ELUNITE_BLOG_POSTS.find(function (p) {
      var pSlug = normalizeSlug(p.url);
      return (
        (currentPathSlug && pSlug === currentPathSlug) ||
        (canonicalSlug && pSlug === canonicalSlug) ||
        (ogSlug && pSlug === ogSlug)
      );
    });

    var activeSlug = currentPost ? normalizeSlug(currentPost.url) : (canonicalSlug || currentPathSlug);

    // Find related posts (same category tag first)
    var related = [];
    if (currentPost && currentPost.tag) {
      related = ELUNITE_BLOG_POSTS.filter(function (p) {
        return normalizeSlug(p.url) !== activeSlug && p.tag === currentPost.tag;
      });
    }

    // Pad with other posts if count < 3
    if (related.length < 3) {
      var others = ELUNITE_BLOG_POSTS.filter(function (p) {
        return normalizeSlug(p.url) !== activeSlug && (!currentPost || p.tag !== currentPost.tag);
      });
      related = related.concat(others).slice(0, 3);
    } else {
      related = related.slice(0, 3);
    }

    if (!related.length) return;

    var cards = related
      .map(function (p) {
        var imgHtml = p.image
          ? '<img class="related-card-img" src="' + p.image + '" alt="' + p.title.replace(/"/g, '&quot;') + '" width="1920" height="1080" loading="lazy">' +
            '<div class="related-card-img-placeholder" style="display:none;">' + iconSvg(p.icon || 'file-text') + '</div>'
          : '<div class="related-card-img-placeholder">' + iconSvg(p.icon || 'file-text') + '</div>';

        return (
          '<a href="' + p.url + '" class="related-card">' +
            imgHtml +
            '<div class="related-card-body">' +
              '<span class="related-card-tag">' + p.tag + '</span>' +
              '<h3 class="related-card-title">' + p.title + '</h3>' +
              '<p class="related-card-meta">' +
                iconSvg('clock') + p.readTime +
              '</p>' +
            '</div>' +
          '</a>'
        );
      })
      .join('');

    var section = document.querySelector('.article-section') || document.querySelector('section');
    if (section) {
      var relatedHtml =
        '<div class="related-articles">' +
          '<h2 class="related-articles-heading">More Articles</h2>' +
          '<div class="related-articles-grid">' + cards + '</div>' +
        '</div>';
      section.insertAdjacentHTML('beforeend', relatedHtml);
      section.querySelectorAll('.related-card-img').forEach(function (img) {
        img.addEventListener('error', function () {
          img.style.display = 'none';
          if (img.nextElementSibling) img.nextElementSibling.style.display = 'flex';
        });
      });
    }
  }

  // Ensure DOM is ready before executing
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBlogEnhancements);
  } else {
    initBlogEnhancements();
  }
})();
