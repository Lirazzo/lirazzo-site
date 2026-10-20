/* Lirazzo : menu repliable sur mobile et agrandissement des captures d'écran. */
(function () {
  function menu() {
    var header = document.querySelector("header.top"), nav = header && header.querySelector(".nav");
    if (!nav) return;
    document.documentElement.classList.add("js");
    nav.id = nav.id || "menu";
    var btn = document.createElement("button");
    btn.type = "button"; btn.className = "menu-btn";
    btn.setAttribute("aria-controls", nav.id); btn.setAttribute("aria-expanded", "false");
    btn.innerHTML = '<span class="menu-ico" aria-hidden="true"></span><span class="menu-lbl">Menu</span>';
    header.insertBefore(btn, nav);
    function set(open) { header.classList.toggle("open", open); btn.setAttribute("aria-expanded", String(open)); }
    btn.addEventListener("click", function () { set(!header.classList.contains("open")); });
    nav.addEventListener("click", function (e) { if (e.target.closest("a")) set(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") set(false); });
  }

  function lightbox() {
    var imgs = document.querySelectorAll(".frame img, .phone img");
    if (!imgs.length) return;
    var dlg = document.createElement("dialog");
    dlg.className = "lb"; dlg.setAttribute("aria-label", "Capture agrandie");
    dlg.innerHTML = '<button type="button" class="lb-close" aria-label="Fermer">×</button><img alt=""><p class="lb-cap"></p>';
    document.body.appendChild(dlg);
    if (typeof dlg.showModal !== "function") { dlg.remove(); return; }
    var big = dlg.querySelector("img"), cap = dlg.querySelector(".lb-cap");
    imgs.forEach(function (im) {
      im.classList.add("zoomable"); im.tabIndex = 0; im.setAttribute("role", "button");
      im.setAttribute("aria-label", "Agrandir : " + im.alt);
      function open() { big.src = im.currentSrc || im.src; big.alt = im.alt; cap.textContent = im.alt; dlg.showModal(); }
      im.addEventListener("click", open);
      im.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });
    });
    dlg.addEventListener("click", function () { dlg.close(); });
  }

  function init() { menu(); lightbox(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
