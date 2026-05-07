/* ============================================================
   KZ KOTEL CAM — DISABLED (2026-05-06)
   Live YouTube IDs change/expire frequently and the embed often
   shows black or "video unavailable". The card was hiding rather
   than helping. To re-enable in the future, restore from git
   history and set window.KZ_KOTEL_CAM = { id: 'CURRENT_LIVE_ID' }.
   ============================================================ */
(function(){
  // Intentionally a no-op. Removes any existing card if a previous
  // version of this script already rendered one (e.g. cached SW).
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.kz-kotel-card').forEach(el => el.remove());
  }, { once: true });
})();
