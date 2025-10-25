document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const headerBtn = document.querySelector(".header-btn");
  const menuBtn = document.querySelector(".menu-btn");
  const burger = document.querySelector(".burger");
  const menuBurger = document.querySelector(".menuBurger");

  // Inicializa ON/OFF
  if (!body.classList.contains("on") && !body.classList.contains("off")) {
    body.classList.add("off");
  }

  function atualizarTextoBotao() {
    const texto = body.classList.contains("on") ? "ON" : "OFF";
    if (headerBtn) headerBtn.textContent = texto;
    if (menuBtn) menuBtn.textContent = texto;
  }
  atualizarTextoBotao();

  // Alterna tema
  function alternarModo() {
    body.classList.toggle("on");
    body.classList.toggle("off");
    atualizarTextoBotao();
  }

  if (headerBtn) headerBtn.addEventListener("click", alternarModo);
  if (menuBtn) menuBtn.addEventListener("click", alternarModo);

  // Abre/fecha drawer
  if (burger) {
    burger.addEventListener("click", (e) => {
      menuBurger.classList.toggle("active");
      e.stopPropagation();
    });
  }

  document.addEventListener("click", (e) => {
    if (menuBurger && !menuBurger.contains(e.target) && !burger.contains(e.target)) {
      menuBurger.classList.remove("active");
    }
  });
});