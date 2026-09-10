/**
 * Blog Listing Pagination
 * Paginates every card (the newest/first one included) 6 per page.
 * Runs after blog-sort.js so it always paginates the final,
 * newest-first DOM order.
 *
 * Each page change pushes a history entry (?page=N), so the browser
 * back button / swipe-back gesture steps back through pages 2 → 1
 * before it ever leaves blog.html, instead of jumping straight to
 * whatever page the visitor arrived from.
 */
(function () {
  "use strict";

  var PAGE_SIZE = 6;
  var grid = document.getElementById("blog-listing-grid");
  var nav = document.getElementById("blog-pagination");
  if (!grid) return;

  var currentPage = 1;

  function getPageFromLocation() {
    var params = new URLSearchParams(window.location.search);
    var page = parseInt(params.get("page"), 10);
    return page && page > 0 ? page : 1;
  }

  function urlForPage(page) {
    var url = new URL(window.location.href);
    if (page > 1) {
      url.searchParams.set("page", page);
    } else {
      url.searchParams.delete("page");
    }
    return url;
  }

  function getAllCards() {
    return Array.prototype.slice.call(grid.querySelectorAll(".blog-listing-card"));
  }

  function totalPages() {
    return Math.max(1, Math.ceil(getAllCards().length / PAGE_SIZE));
  }

  function renderNav(pages) {
    if (!nav) return;

    if (pages <= 1) {
      nav.hidden = true;
      nav.innerHTML = "";
      return;
    }

    nav.hidden = false;

    var html =
      '<button type="button" class="blog-pagination-btn blog-pagination-prev"' +
      (currentPage === 1 ? " disabled" : "") +
      ' aria-label="Previous page">&lsaquo; Prev</button>';

    for (var p = 1; p <= pages; p++) {
      html +=
        '<button type="button" class="blog-pagination-page' +
        (p === currentPage ? " is-active" : "") +
        '" data-page="' +
        p +
        '" aria-current="' +
        (p === currentPage ? "true" : "false") +
        '">' +
        p +
        "</button>";
    }

    html +=
      '<button type="button" class="blog-pagination-btn blog-pagination-next"' +
      (currentPage === pages ? " disabled" : "") +
      ' aria-label="Next page">Next &rsaquo;</button>';

    nav.innerHTML = html;
  }

  function applyPage(page) {
    var cards = getAllCards();
    var pages = totalPages();
    currentPage = Math.min(Math.max(1, page), pages);

    cards.forEach(function (card, i) {
      var cardPage = Math.floor(i / PAGE_SIZE) + 1;
      card.style.display = cardPage === currentPage ? "" : "none";
    });

    renderNav(pages);
  }

  // User-initiated page change (button click): update the grid AND push
  // a new history entry so back/swipe-back steps to the previous page.
  function goToPage(page) {
    applyPage(page);
    history.pushState({ blogPage: currentPage }, "", urlForPage(currentPage));
    grid.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  if (nav) {
    nav.addEventListener("click", function (e) {
      var btn = e.target.closest("button");
      if (!btn || btn.disabled) return;

      if (btn.classList.contains("blog-pagination-prev")) {
        goToPage(currentPage - 1);
        return;
      }
      if (btn.classList.contains("blog-pagination-next")) {
        goToPage(currentPage + 1);
        return;
      }
      var page = parseInt(btn.getAttribute("data-page"), 10);
      if (page) goToPage(page);
    });
  }

  // Back/forward navigation (or a swipe-back gesture): restore the page
  // that entry represents instead of leaving blog.html entirely.
  window.addEventListener("popstate", function (e) {
    var page = (e.state && e.state.blogPage) || getPageFromLocation();
    applyPage(page);
  });

  // Initial load: honor a deep link like blog.html?page=2, and make sure
  // that first history entry carries our state object so a later
  // popstate back to it behaves the same as a fresh load.
  var startPage = getPageFromLocation();
  applyPage(startPage);
  history.replaceState({ blogPage: currentPage }, "", urlForPage(currentPage));
})();
