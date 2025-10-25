// Jogo de acertar o número - Nível Difícil (1-100)
document.addEventListener("DOMContentLoaded", () => {
    const numeroSecreto = Math.floor(Math.random() * 100) + 1;
    let tentativas = 0;
    const palpiteInput = document.getElementById("palpite");
    const tentarBtn = document.getElementById("tentar");
    const mensagem = document.getElementById("mensagem");
    const tentativasDisplay = document.getElementById("tentativas");

    tentarBtn.addEventListener("click", () => {
        const palpite = parseInt(palpiteInput.value);
        if (isNaN(palpite) || palpite < 1 || palpite > 100) {
            mensagem.textContent = "Por favor, digite um número entre 1 e 100.";
            return;
        }

        tentativas++;
        tentativasDisplay.textContent = `Tentativas: ${tentativas}`;

        if (palpite === numeroSecreto) {
            mensagem.textContent = `Parabéns! Você acertou o número ${numeroSecreto} em ${tentativas} tentativas!`;
            tentarBtn.disabled = true;
            palpiteInput.disabled = true;
        } else if (palpite < numeroSecreto) {
            mensagem.textContent = "O número secreto é maior!";
        } else {
            mensagem.textContent = "O número secreto é menor!";
        }
    });
});