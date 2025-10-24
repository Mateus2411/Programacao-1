const botao = document.querySelector(".on");

botao.addEventListener("click", () => {
  if (botao.textContent === "ON") {
    botao.textContent = "OFF";
  } else {
    botao.textContent = "ON";
  }
});