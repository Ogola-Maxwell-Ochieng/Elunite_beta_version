/**
 * ELUNITE BLOG POSTS — SINGLE SOURCE OF TRUTH
 * ═══════════════════════════════════════════════════════════════
 * Every blog post on the site is listed here ONCE. blog.html and
 * the "Latest Blogs" teaser widgets on index.html, about.html,
 * destination.html, and service.html all read from this same file,
 * so they can never fall out of sync with each other again.
 *
 * HOW TO ADD A NEW POST:
 * 1. Create your new post's .html file as usual.
 * 2. Add ONE object to the POSTS array below.
 * 3. That's it. blog.html and every teaser widget site-wide will
 *    automatically show it in the right place, newest first, no
 *    other file needs to be touched.
 *
 * Fields:
 *   url      - the post's filename, e.g. "my-new-post.html"
 *   title    - full post title, exactly as it should display
 *   excerpt  - 1-2 sentence teaser shown on cards
 *   tag      - short category label shown as a pill on the card
 *   date     - "YYYY-MM-DD", used for sorting (newest first)
 *   readTime - e.g. "6 min read"
 *   icon     - a lucide icon name, used when no cover image exists
 *   image    - path to a real cover image, or null to use the icon
 * ═══════════════════════════════════════════════════════════════
 */

var ELUNITE_BLOG_POSTS = [
  {
    url: "open-doors-scholarship-2027-russia.html",
    title: "Open Doors Scholarship 2027 Russia: Fully Funded Guide (No IELTS)",
    excerpt: "Full tuition plus a monthly stipend, no IELTS required. Eligibility, deadlines, and a step-by-step application guide for Africa's most generous Russian scholarship.",
    tag: "Scholarships",
    date: "2026-08-23",
    readTime: "12 min read",
    icon: "landmark",
    image: "images/blogs/Open Doors Scholarship 2027 Russia Fully Funded Guide.webp"
  },
  {
    url: "financial-planning-mistakes-study-abroad.html",
    title: "12 Financial Planning Mistakes to Avoid Before Studying Abroad in 2026",
    excerpt: "Real costs across the USA, UK, Canada, Australia, Germany and Ireland, plus the 12 budgeting mistakes that turn a dream into a financial shock.",
    tag: "Financial Planning",
    date: "2026-08-22",
    readTime: "9 min read",
    icon: "wallet",
    image: "images/blogs/12 Financial Planning Mistakes to Avoid Before Studying Abroad in 2026.webp"
  },
  {
    url: "parents-guide-study-abroad-safety-cost.html",
    title: "A Parent's Guide to Study Abroad: Safety, Real Costs & How to Spot a Legitimate Consultant",
    excerpt: "Straight answers to the questions parents actually have: is it safe, what does it really cost, and how do you tell a legitimate consultant from a scam.",
    tag: "For Parents",
    date: "2026-08-21",
    readTime: "7 min read",
    icon: "shield-check",
    image: "images/blogs/A Parent's Guide to Study Abroad Safety, Real Costs & How to Spot a Legitimate Consultant.webp"
  },
  {
    url: "complete-guide-studying-abroad-2026.html",
    title: "Complete Guide to Studying Abroad in 2026: Top Countries, Universities, and Application Tips",
    excerpt: "Everything you need to plan your move abroad in one place, how to shortlist countries, compare universities, and build an application timeline that actually works.",
    tag: "Complete Guide",
    date: "2026-08-18",
    readTime: "5 min read",
    icon: "book-open",
    image: "images/blogs/Complete Guide to Studying Abroad in 2026 Top Countries, Universities, and Application Tips.webp"
  },
  {
    url: "best-countries-study-abroad-2026.html",
    title: "Best Countries to Study Abroad in 2026: Affordable Tuition, Visa Success Rates & Career Opportunities",
    excerpt: "A side-by-side look at where students are getting the most value in 2026, from tuition costs to how easy the visa process really is.",
    tag: "Destinations",
    date: "2026-08-18",
    readTime: "4 min read",
    icon: "globe-2",
    image: "images/blogs/Best Countries to Study Abroad in 2026 Affordable Tuition, Visa Success Rates & Career Opportunities.webp"
  },
  {
    url: "how-to-choose-the-right-university-abroad.html",
    title: "How to Choose the Right University Abroad: Courses, Rankings, Scholarships & Future Career Scope",
    excerpt: "Rankings only tell half the story. Here's how to weigh course quality, scholarship access, and career outcomes together.",
    tag: "University Selection",
    date: "2026-08-14",
    readTime: "6 min read",
    icon: "graduation-cap",
    image: "images/blogs/How to Choose the Right University Abroad Courses, Rankings, Scholarships & Future Career Scope.webp"
  },
  {
    url: "study-abroad-scholarships-2026.html",
    title: "Study Abroad Scholarships 2026: How to Apply, Eligibility Requirements & Tips to Get Approved",
    excerpt: "A practical walk-through of Chevening, DAAD, Mastercard Foundation, Erasmus Mundus and more, with real deadlines and what actually gets applications approved.",
    tag: "Scholarships",
    date: "2026-08-12",
    readTime: "8 min read",
    icon: "award",
    image: "images/blogs/Study Abroad Scholarships 2026 How to Apply, Eligibility Requirements & Tips to Get Approved.webp"
  }
];
