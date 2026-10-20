/* Formulaire de contact Lirazzo : fenêtre ouverte depuis les liens « contact »,
   envoi par Web3Forms vers contact@lirazzo.fr. Sans JavaScript, les liens
   gardent leur comportement normal (ancre #contact ou lien mailto). */
(function () {
  var ENDPOINT = "https://api.web3forms.com/submit";
  var KEY = "6d70cd45-e193-46d0-981d-bbbfd96df456"; /* clé publique Web3Forms, faite pour être dans la page */

  var html =
    '<dialog class="cf" id="cf" aria-labelledby="cf-title">' +
    '<form class="cf-form" novalidate>' +
    '<div class="cf-head"><h2 id="cf-title">Parlez-moi de votre besoin</h2>' +
    '<button type="button" class="cf-close" aria-label="Fermer">×</button></div>' +
    '<p class="cf-intro">Décrivez votre besoin en quelques lignes : je reviens vers vous avec une première piste.</p>' +
    '<div class="cf-grid">' +
    '<label>Nom et prénom *<input name="nom" autocomplete="name" required></label>' +
    '<label>Entreprise<input name="entreprise" autocomplete="organization"></label>' +
    '<label>Email *<input name="email" type="email" autocomplete="email" required></label>' +
    '<label>Téléphone<input name="telephone" type="tel" autocomplete="tel"></label>' +
    '<label>Ville<input name="ville" autocomplete="address-level2"></label>' +
    '</div>' +
    '<label>Votre message *<textarea name="message" rows="6" required placeholder="La tâche qui vous fait perdre du temps, le nombre de personnes concernées, les outils actuels…"></textarea></label>' +
    '<input type="text" name="botcheck" class="cf-hp" tabindex="-1" autocomplete="off" aria-hidden="true">' +
    '<p class="cf-legal">Vos informations servent uniquement à répondre à votre demande. Voir la <a href="confidentialite.html">politique de confidentialité</a>.</p>' +
    '<p class="cf-status" role="status" aria-live="polite"></p>' +
    '<div class="cf-actions"><button type="button" class="btn btn-ghost cf-cancel">Annuler</button>' +
    '<button type="submit" class="btn btn-accent cf-send">Envoyer</button></div>' +
    '</form></dialog>';

  function init() {
    document.body.insertAdjacentHTML("beforeend", html);
    var dlg = document.getElementById("cf");
    if (!dlg || typeof dlg.showModal !== "function") { dlg && dlg.remove(); return; }
    var form = dlg.querySelector("form");
    var status = dlg.querySelector(".cf-status");
    var send = dlg.querySelector(".cf-send");

    function open(e) {
      e.preventDefault();
      status.textContent = ""; status.className = "cf-status";
      dlg.showModal();
      setTimeout(function () { form.elements.nom.focus(); }, 30);
    }
    function close() { dlg.close(); }

    document.querySelectorAll('a[href$="#contact"], a[href^="mailto:contact@lirazzo.fr"], [data-contact]')
      .forEach(function (a) { a.addEventListener("click", open); });
    form.addEventListener("input", function (e) {
      if (e.target.classList.contains("cf-bad") && e.target.value.trim() && e.target.checkValidity()) e.target.classList.remove("cf-bad");
    });
    dlg.querySelector(".cf-close").addEventListener("click", close);
    dlg.querySelector(".cf-cancel").addEventListener("click", close);
    dlg.addEventListener("click", function (e) { if (e.target === dlg) close(); });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var f = form.elements, missing = [];
      ["nom", "email", "message"].forEach(function (n) {
        f[n].classList.toggle("cf-bad", !f[n].value.trim() || !f[n].checkValidity());
        if (f[n].classList.contains("cf-bad")) missing.push(n);
      });
      if (missing.length) {
        status.textContent = "Merci de compléter les champs marqués * (avec un email valide).";
        status.className = "cf-status cf-err";
        f[missing[0]].focus();
        return;
      }
      if (f.botcheck.value) return;
      var data = {
        access_key: KEY,
        subject: "Lirazzo · nouveau message de " + f.nom.value.trim(),
        from_name: "Site lirazzo.fr",
        nom: f.nom.value.trim(),
        entreprise: f.entreprise.value.trim(),
        email: f.email.value.trim(),
        telephone: f.telephone.value.trim(),
        ville: f.ville.value.trim(),
        message: f.message.value.trim(),
        page: location.pathname
      };

      send.disabled = true; send.textContent = "Envoi…";
      status.textContent = "Envoi en cours…"; status.className = "cf-status cf-wait";
      var slow = setTimeout(function () {
        status.textContent = "L'envoi prend un peu plus de temps que prévu, merci de patienter sans fermer la fenêtre…";
      }, 6000);
      fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(data)
      }).then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, j: j }; }); })
        .then(function (res) {
          if (res.ok && (res.j.success === true || String(res.j.success) === "true")) {
            form.reset();
            status.textContent = "Merci, votre message est bien envoyé. Je reviens vers vous rapidement.";
            status.className = "cf-status cf-ok";
          } else { throw new Error(res.j.message || "refus"); }
        })
        .catch(function (err) {
          if (/activ/i.test(String(err && err.message))) {
            status.textContent = "Formulaire en cours d'activation : votre message n'a pas encore pu être transmis. Merci de réessayer plus tard ou d'écrire à contact@lirazzo.fr.";
            status.className = "cf-status cf-err";
            return;
          }
          status.innerHTML = "L'envoi n'a pas abouti. Vous pouvez m'écrire directement à <a href=\"mailto:contact@lirazzo.fr\">contact@lirazzo.fr</a>.";
          status.className = "cf-status cf-err";
        })
        .then(function () { clearTimeout(slow); send.disabled = false; send.textContent = "Envoyer"; });
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
