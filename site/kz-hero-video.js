/* ============================================================
   KZ HERO VIDEO — DISABLED (2026-05-06)
   The auto-injected hero video was replaced by a static photo
   hero (data-kz-hero="shofar") which loads images/heroes/
   shofar-mountain.jpg with an SVG fallback. This file is now a
   no-op so the homepage doesn't show a video at all.
   To bring it back: restore from git history.
   ============================================================ */
(function(){
  // Remove any existing hero-video container left in cached DOM
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.kz-hero-video').forEach(el => el.remove());
  }, { once: true });
})();
