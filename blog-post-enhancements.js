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
          ? '<img class="related-card-img" src="' + p.image + '" alt="' + p.title.replace(/"/g, '&quot;') + '" loading="lazy" onerror="this.style.display=\'none\'; if(this.nextElementSibling) this.nextElementSibling.style.display=\'flex\';">' +
            '<div class="related-card-img-placeholder" style="display:none;"><i data-lucide="' + (p.icon || 'file-text') + '"></i></div>'
          : '<div class="related-card-img-placeholder"><i data-lucide="' + (p.icon || 'file-text') + '"></i></div>';

        return (
          '<a href="' + p.url + '" class="related-card">' +
            imgHtml +
            '<div class="related-card-body">' +
              '<span class="related-card-tag">' + p.tag + '</span>' +
              '<h3 class="related-card-title">' + p.title + '</h3>' +
              '<p class="related-card-meta">' +
                '<i data-lucide="clock"></i>' + p.readTime +
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

      // Trigger Lucide icon rendering
      if (typeof lucide !== 'undefined' && lucide.createIcons) {
        lucide.createIcons();
      }
    }
  }

  // Ensure DOM is ready before executing
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBlogEnhancements);
  } else {
    initBlogEnhancements();
  }

  // Re-run icon creation on window load in case Lucide loaded asynchronously
  window.addEventListener('load', function () {
    if (typeof lucide !== 'undefined' && lucide.createIcons) {
      lucide.createIcons();
    }
  });
})();
