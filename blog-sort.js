/**
 * Blog Card Auto-Sorter
 * Automatically sorts blog cards by date and marks the newest as featured
 * 
 * Usage: Add data-date="YYYY-MM-DD" to each .blog-listing-card element
 * Include this script after your blog cards in the HTML
 */

(function() {
  'use strict';

  var grid = document.getElementById('blog-listing-grid');
  if (!grid) {
    console.warn('Blog sorter: #blog-listing-grid not found');
    return;
  }

  var cards = Array.prototype.slice.call(
    grid.querySelectorAll('.blog-listing-card')
  );

  if (!cards.length) {
    console.warn('Blog sorter: No blog cards found');
    return;
  }

  /**
   * Sort cards by data-date attribute (newest first)
   */
  cards.sort(function(a, b) {
    var dateA = new Date(a.getAttribute('data-date') || 0);
    var dateB = new Date(b.getAttribute('data-date') || 0);
    return dateB - dateA; // Descending order (newest first)
  });

  /**
   * Re-append cards in sorted order and normalize structure
   */
  cards.forEach(function(card, index) {
    var isFeatured = index === 0;

    // Add/remove featured class
    if (isFeatured) {
      card.classList.add('blog-listing-card--featured');
    } else {
      card.classList.remove('blog-listing-card--featured');
    }

    // Normalize heading tags: H2 for featured, H3 for others
    var title = card.querySelector('.blog-listing-card-title');
    if (title) {
      var currentTag = title.tagName.toLowerCase();
      var desiredTag = isFeatured ? 'h2' : 'h3';

      if (currentTag !== desiredTag) {
        var newHeading = document.createElement(desiredTag);
        newHeading.className = 'blog-listing-card-title';
        newHeading.innerHTML = title.innerHTML;
        title.parentNode.replaceChild(newHeading, title);
      }
    }

    // Append to grid (this reorders the DOM)
    grid.appendChild(card);
  });

  // Re-initialize Lucide icons after DOM changes
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  console.log('Blog sorter: Sorted ' + cards.length + ' cards by date');
})();