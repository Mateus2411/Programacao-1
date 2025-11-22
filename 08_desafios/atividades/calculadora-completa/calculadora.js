//#region Class Calculadora
class Calculadora {
  constructor() {
    this.display = "";
    this.configurarTeclado(); // Ativa controle de teclado
  }

  // ======================================================
  // 🖥️  SEÇÃO 1 — MANIPULAÇÃO DO DISPLAY E ERROS
  // ======================================================
  atualizarDisplay() {
    const inputDisplay = document.getElementById("display");
    const cursorPos = inputDisplay.selectionStart || 0;

    inputDisplay.value = this.display === "" ? "0" : this.display;

    // Mantém o cursor onde estava
    requestAnimationFrame(() => {
      const newPos = Math.min(cursorPos, this.display.length || 1);
      inputDisplay.setSelectionRange(newPos, newPos);
    });
  }

  limparClassesErro() {
    const inputDisplay = document.getElementById("display");
    inputDisplay.classList.remove("erro", "calculando");
  }

  mostrarErro(mensagem) {
    const inputDisplay = document.getElementById("display");
    this.display = mensagem;
    inputDisplay.classList.remove("calculando");
    inputDisplay.classList.add("erro");

    // Após 2s, limpa o erro e volta ao normal
    setTimeout(() => {
      this.display = "";
      inputDisplay.classList.remove("erro");
      this.atualizarDisplay();
    }, 2000);
  }

  // ======================================================
  // 🔢  SEÇÃO 2 — INSERÇÃO DE NÚMEROS E OPERAÇÕES
  // ======================================================
  adicionarNumero(numero) {
    const inputDisplay = document.getElementById("display");
    let cursorPos = inputDisplay.selectionStart || this.display.length;

    if (this.display === "0" && numero !== ",") {
      this.display = numero;
      cursorPos = 1;
    } else {
      const numeroFormatado = numero === "," ? "." : numero;
      this.display =
        this.display.slice(0, cursorPos) +
        numeroFormatado +
        this.display.slice(cursorPos);
    }

    this.limparClassesErro();
    this.atualizarDisplay();

    // Reposiciona o cursor
    setTimeout(() => {
      inputDisplay.setSelectionRange(cursorPos + 1, cursorPos + 1);
    }, 0);
  }

  adicionarOperacao(operacao) {
    const inputDisplay = document.getElementById("display");
    let cursorPos = inputDisplay.selectionStart || this.display.length;

    // Permite iniciar com "-" ou "("
    if (this.display === "" || this.display === "0") {
      if (operacao === "-") {
        this.display = "-";
      } else if (operacao === "(") {
        this.display = "()";
        this.atualizarDisplay();
        // Coloca o cursor entre os parênteses
        setTimeout(() => {
          inputDisplay.setSelectionRange(1, 1);
        }, 0);
        return;
      } else {
        return; // bloqueia outros operadores no início
      }
      this.atualizarDisplay();
      setTimeout(() => {
        inputDisplay.setSelectionRange(
          this.display.length,
          this.display.length
        );
      }, 0);
      return;
    }

    // Converte símbolos visuais para operadores válidos
    let operador = operacao;
    if (operacao === "×") operador = "*";
    if (operacao === "÷") operador = "/";

    // Insere automaticamente o par "()" quando o usuário digita "("
    if (operacao === "(") {
      this.display =
        this.display.slice(0, cursorPos) + "()" + this.display.slice(cursorPos);
      this.atualizarDisplay();
      setTimeout(() => {
        inputDisplay.setSelectionRange(cursorPos + 1, cursorPos + 1);
      }, 0);
      return;
    }

    // Insere o operador normalmente
    this.display =
      this.display.slice(0, cursorPos) +
      operador +
      this.display.slice(cursorPos);

    this.limparClassesErro();
    this.atualizarDisplay();

    // Posiciona o cursor após o operador
    setTimeout(() => {
      inputDisplay.setSelectionRange(cursorPos + 1, cursorPos + 1);
    }, 0);
  }

  // ======================================================
  // ⌫  SEÇÃO 3 — FUNÇÕES DE LIMPEZA
  // ======================================================
  apagarUltimo() {
    this.display = this.display.slice(0, -1);
    this.limparClassesErro();
  }

  limparDisplay() {
    this.display = "";
    this.limparClassesErro();
    this.atualizarDisplay();
  }

  limparEntrada() {
    this.display = "";
    this.limparClassesErro();
    this.atualizarDisplay();
  }

  apagarCursor() {
    const inputDisplay = document.getElementById("display");
    const start = inputDisplay.selectionStart || 0;
    const end = inputDisplay.selectionEnd || 0;

    if (start !== end) {
      // Apaga o trecho selecionado
      this.display = this.display.slice(0, start) + this.display.slice(end);
      this.atualizarDisplay();
      setTimeout(() => inputDisplay.setSelectionRange(start, start), 0);
    } else if (start > 0) {
      // Apaga caractere antes do cursor
      this.display =
        this.display.slice(0, start - 1) + this.display.slice(start);
      this.atualizarDisplay();
      setTimeout(() => inputDisplay.setSelectionRange(start - 1, start - 1), 0);
    }

    // Se ao apagar deixou o display com menos de 3 caracteres começando com "log", limpar
    if (this.display.startsWith("log") && this.display.length < 3) {
      this.display = "";
      this.atualizarDisplay();
    }

    this.limparClassesErro();
  }

  // ======================================================
  // 🧮  SEÇÃO 4 — CÁLCULOS E VALIDAÇÃO
  // ======================================================
  calcular() {
    const inputDisplay = document.getElementById("display");
    let expressao = this.display;

    if (expressao === "" || expressao === "0") return;

    if (!this.validarExpressao(expressao)) {
      this.mostrarErro("Expressão inválida");
      return;
    }

    inputDisplay.value = "Calculando...";
    inputDisplay.classList.add("calculando");

    setTimeout(() => {
      try {
        // normaliza vírgula para ponto
        expressao = expressao.replace(/,/g, ".");

        // --- Inserir multiplicação implícita ---
        // Ex.: (1+1)(1+1) => (1+1)*(1+1)
        // Ex.: 2(3+1) => 2*(3+1)
        // Ex.: (2+1)3 => (2+1)*3
        expressao = expressao.replace(/([0-9.\)])\s*\(/g, "$1*(");
        expressao = expressao.replace(/\)\s*([0-9.])/g, ")*$1");
        // -----------------------------------------

        // Converte padrões do tipo base^(expo) para Math.pow(base, expo)
        expressao = expressao.replace(
          /([0-9.\-()]+)\^\(([^()]+)\)/g,
          (m, base, expoente) => {
            return `Math.pow(${base},(${expoente}))`;
          }
        );

        // Remove " = " do final se houver
        expressao = expressao.replace(/ = $/, "");

        // Converte log(base)(arg) para Math.log(arg)/Math.log(base)
        expressao = expressao.replace(
          /log\((\d*\.?\d*)\)\(([^)]+)\)/g,
          (m, base, arg) => {
            const b = parseFloat(base) || 10;
            const a = parseFloat(arg.replace(/,/g, "."));
            if (a <= 0 || b <= 0 || b === 1) return "NaN";
            return `Math.log(${a})/Math.log(${b})`;
          }
        );

        const resultado = this.calcularExpressao(expressao);
        if (isNaN(resultado) || !isFinite(resultado)) throw new Error();

        let displayResult = resultado;
        if (resultado % 1 !== 0) {
          displayResult = this.decimalParaFracao(resultado);
        } else {
          displayResult = resultado.toString();
        }
        this.display = displayResult.replace(/\./g, ",");
        inputDisplay.classList.remove("calculando");
      } catch {
        this.mostrarErro("Erro no cálculo");
      }
      this.atualizarDisplay();
    }, 500);
  }

  validarExpressao(expressao) {
    const regex = /^[0-9+\-*/,.() \^]+$/;
    if (!regex.test(expressao)) return false;

    // Parênteses balanceados
    let count = 0;
    for (let c of expressao) {
      if (c === "(") count++;
      if (c === ")") count--;
      if (count < 0) return false;
    }
    return count === 0;
  }

  calcularExpressao(expressao) {
    return eval(expressao);
  }

  obterValorAtual() {
    let expr = this.display.replace(/×/g, "*").replace(/÷/g, "/");
    if (/[+\-*/]/.test(expr)) {
      try {
        return eval(expr.replace(/,/g, "."));
      } catch {
        return 0;
      }
    }
    return parseFloat(this.display.replace(/,/g, ".")) || 0;
  }

  inverterSinal() {
    if (!this.display || this.display === "0") return;

    this.display = this.display.startsWith("-")
      ? this.display.substring(1)
      : "-" + this.display;

    this.limparClassesErro();
    this.atualizarDisplay();
  }

  // ======================================================
  // 🧪  SEÇÃO 4.1 — FUNÇÕES ESPECIAIS (%, 1/x, x², √x)
  // ======================================================
  porcentagem() {
    const valor = this.obterValorAtual();
    const resultado = valor / 100;
    if (!isFinite(resultado)) {
      this.mostrarErro("Erro no cálculo");
      return;
    }
    this.display = resultado.toString().replace(/\./g, ",");
    this.limparClassesErro();
    this.atualizarDisplay();
  }

  reciproco() {
    const valor = this.obterValorAtual();
    if (valor === 0) {
      this.mostrarErro("Divisão por zero");
      return;
    }
    const resultado = 1 / valor;
    this.display = resultado.toString().replace(/\./g, ",");
    this.limparClassesErro();
    this.atualizarDisplay();
  }
  // Variante com acento para compatibilidade

  quadrado() {
    const valor = this.obterValorAtual();
    const resultado = valor * valor;
    this.display = resultado.toString().replace(/\./g, ",");
    this.limparClassesErro();
    this.atualizarDisplay();
  }
  // Insere potência: detecta número à esquerda (base) e, se houver seleção ou número à direita,
  // usa como expoente; caso contrário insere base^( ) e posiciona o cursor dentro dos parênteses.
  inserirPotencia() {
    const inputDisplay = document.getElementById("display");
    const start = inputDisplay.selectionStart || 0;
    const end = inputDisplay.selectionEnd || start;

    const before = this.display.slice(0, start);
    const middle = start !== end ? this.display.slice(start, end) : "";
    const after = this.display.slice(end);

    // Regex para número à esquerda: inclui dígitos, vírgula/ ponto e sinal negativo
    const leftMatch = before.match(/-?[\d.,]+$/);

    if (!leftMatch) {
      // Sem base à esquerda: insere ^() vazio e posiciona cursor dentro
      this.display = before + "^(" + "" + ")" + after;
      this.atualizarDisplay();
      setTimeout(() => {
        const pos = (before + "^(").length;
        inputDisplay.setSelectionRange(pos, pos);
      }, 0);
      return;
    }

    const base = leftMatch[0];
    const baseStart = start - base.length;

    // IMPORTANTE: expoente vem SOMENTE da seleção (middle). Não capturamos número à direita.
    const expo = middle || "";

    const beforeBase = before.slice(0, baseStart);
    const afterExpo = after; // não removemos nada à direita

    this.display = beforeBase + base + "^(" + expo + ")" + afterExpo;
    this.limparClassesErro();
    this.atualizarDisplay();

    setTimeout(() => {
      if (expo) {
        const pos = (beforeBase + base + "^(" + expo + ")").length;
        inputDisplay.setSelectionRange(pos, pos);
      } else {
        const pos = (beforeBase + base + "^(").length;
        inputDisplay.setSelectionRange(pos, pos);
      }
    }, 0);
  }

  raizQuadrada() {
    const valor = this.obterValorAtual();
    if (valor < 0) {
      this.mostrarErro("Raiz inválida");
      return;
    }
    const resultado = Math.sqrt(valor);
    this.display = resultado.toString().replace(/\./g, ",");
    this.limparClassesErro();
    this.atualizarDisplay();
  }

  fatorial() {
    const valor = this.obterValorAtual();
    if (valor < 0 || !Number.isInteger(valor)) {
      this.mostrarErro("Fatorial inválido");
      return;
    }
    if (valor === 0 || valor === 1) {
      this.display = "1";
      this.limparClassesErro();
      this.atualizarDisplay();
      return;
    }
    let resultado = 1;
    for (let i = 2; i <= valor; i++) {
      resultado *= i;
      if (!isFinite(resultado)) {
        this.mostrarErro("Valor muito grande");
        return;
      }
    }
    this.display = resultado.toString().replace(/\./g, ",");
    this.limparClassesErro();
    this.atualizarDisplay();
  }

  inserirPi() {
    this.display += Math.PI.toString().replace(/\./g, ",");
    this.limparClassesErro();
    this.atualizarDisplay();
  }

  inserirE() {
    this.display += Math.E.toString().replace(/\./g, ",");
    this.limparClassesErro();
    this.atualizarDisplay();
  }

  valorAbsoluto() {
    const valor = this.obterValorAtual();
    const resultado = Math.abs(valor);
    this.display = resultado.toString().replace(/\./g, ",");
    this.limparClassesErro();
    this.atualizarDisplay();
  }

  exponencial() {
    const valor = this.obterValorAtual();
    const resultado = Math.exp(valor);
    if (!isFinite(resultado)) {
      this.mostrarErro("Valor muito grande");
      return;
    }
    this.display = resultado.toString().replace(/\./g, ",");
    this.limparClassesErro();
    this.atualizarDisplay();
  }

  modulo() {
    this.adicionarOperacao("%");
  }

  dezElevado() {
    const valor = this.obterValorAtual();
    const resultado = Math.pow(10, valor);
    if (!isFinite(resultado)) {
      this.mostrarErro("Valor muito grande");
      return;
    }
    this.display = resultado.toString().replace(/\./g, ",");
    this.limparClassesErro();
    this.atualizarDisplay();
  }

  logaritmo() {
    // Insere "log( ) = " no display para entrada personalizada
    this.display += "log( ) = ";
    this.limparClassesErro();
    this.atualizarDisplay();
    // Posiciona o cursor dentro dos parênteses
    setTimeout(() => {
      const inputDisplay = document.getElementById("display");
      inputDisplay.setSelectionRange(4, 4); // após "log("
    }, 0);
  }

  logNatural() {
    const valor = this.obterValorAtual();
    if (valor <= 0) {
      this.mostrarErro("Ln inválido");
      return;
    }
    const resultado = Math.log(valor);
    this.display = resultado.toString().replace(/\./g, ",");
    this.limparClassesErro();
    this.atualizarDisplay();
  }

  segundoGrau() {
    const valor = this.obterValorAtual();
    const resultado = Math.pow(2, valor);
    if (!isFinite(resultado)) {
      this.mostrarErro("Valor muito grande");
      return;
    }
    this.display = resultado.toString().replace(/\./g, ",");
    this.limparClassesErro();
    this.atualizarDisplay();
  }

  decimalParaFracao(decimal, maxDenominador = 100) {
    if (decimal % 1 === 0) return decimal.toString();
    for (let den = 1; den <= maxDenominador; den++) {
      for (let num = 1; num < den; num++) {
        if (Math.abs(num / den - decimal) < 0.0001) {
          return `${num}/${den}`;
        }
      }
    }
    return decimal.toString();
  }

  // ======================================================
  // ⌨️  SEÇÃO 5 — SUPORTE AO TECLADO
  // ======================================================
  configurarTeclado() {
    const inputDisplay = document.getElementById("display");

    inputDisplay.addEventListener("input", () => {
      let valor = inputDisplay.value;
      if (valor === "0" && inputDisplay.selectionStart > 0)
        valor = valor.slice(1);
      this.display = valor.replace(/\./g, ",");
    });

    document.addEventListener("keydown", (event) => {
      const tecla = event.key;
      let tipo = "";

      if (!isNaN(tecla) || [".", ","].includes(tecla)) tipo = "numero";
      else if (["+", "-", "*", "/"].includes(tecla)) tipo = "operacao";
      else if (tecla === "Enter") tipo = "resultado";
      else if (tecla === "Backspace") tipo = "apagar";
      else if (tecla === "Escape") tipo = "limpar";

      switch (tipo) {
        case "numero":
          event.preventDefault();
          this.adicionarNumero(tecla);
          break;
        case "operacao":
          event.preventDefault();
          this.adicionarOperacao(tecla);
          break;
        case "resultado":
          event.preventDefault();
          this.calcular();
          break;
        case "apagar":
          event.preventDefault();
          this.apagarCursor();
          break;
        case "limpar":
          event.preventDefault();
          this.limparDisplay();
          break;
      }
    });
  }
}
//#endregion
// ======================================================
// ⚙️  SEÇÃO 6 — EVENTOS DE BOTÕES NA INTERFACE
// ======================================================
let calculadora = new Calculadora();

// Botões numéricos
document.querySelectorAll(".numero").forEach((b) =>
  b.addEventListener("click", () => {
    calculadora.adicionarNumero(b.value);
    calculadora.atualizarDisplay();
  })
);

// Operadores
document.querySelectorAll(".operacao:not(.igual)").forEach((b) =>
  b.addEventListener("click", () => {
    calculadora.adicionarOperacao(b.innerText.trim());
    calculadora.atualizarDisplay();
  })
);

// Igual (=)
const btnIgualPadrao = document.getElementById("resultado");
if (btnIgualPadrao)
  btnIgualPadrao.addEventListener("click", () => calculadora.calcular());

const btnIgualCientifica = document.getElementById("resultado_c");
if (btnIgualCientifica)
  btnIgualCientifica.addEventListener("click", () => calculadora.calcular());

// Limpeza e controle (com verificações de existência)
const btnLimpar = document.getElementById("limpar");
if (btnLimpar)
  btnLimpar.addEventListener("click", () => calculadora.limparDisplay());

const btnApagar = document.getElementById("apagar");
if (btnApagar)
  btnApagar.addEventListener("click", () => calculadora.apagarCursor());

const btnCE = document.getElementById("ce");
if (btnCE) btnCE.addEventListener("click", () => calculadora.limparEntrada());

const btnPlusMinus = document.getElementById("plusminus");
if (btnPlusMinus)
  btnPlusMinus.addEventListener("click", () => calculadora.inverterSinal());

// Funções básicas (padrão)
const btnPercent = document.getElementById("percent");
if (btnPercent)
  btnPercent.addEventListener("click", () => calculadora.porcentagem());

const btnReciprocal = document.getElementById("reciprocal");
if (btnReciprocal)
  btnReciprocal.addEventListener("click", () => calculadora.reciproco());

const btnSquare = document.getElementById("square");
if (btnSquare)
  btnSquare.addEventListener("click", () => calculadora.inserirPotencia());

const btnSqrt = document.getElementById("sqrt");
if (btnSqrt)
  btnSqrt.addEventListener("click", () => calculadora.raizQuadrada());

// Científica: mapear os botões C e ⌫ para mesmas ações
const btnLimparC = document.getElementById("limpar_c");
if (btnLimparC)
  btnLimparC.addEventListener("click", () => calculadora.limparDisplay());

const btnApagarC = document.getElementById("apagar_c");
if (btnApagarC)
  btnApagarC.addEventListener("click", () => calculadora.apagarCursor());

// Científica: funções básicas espelhadas
const btnReciprocalC = document.getElementById("reciprocal_c");
if (btnReciprocalC)
  btnReciprocalC.addEventListener("click", () => calculadora.reciproco());

const btnSquareC = document.getElementById("square_c");
if (btnSquareC)
  btnSquareC.addEventListener("click", () => calculadora.inserirPotencia());

const btnSqrtC = document.getElementById("sqrt_c");
if (btnSqrtC)
  btnSqrtC.addEventListener("click", () => calculadora.raizQuadrada());

const fatorialBtn = document.getElementById("fatorialBtn");
if (fatorialBtn)
  fatorialBtn.addEventListener("click", () => calculadora.fatorial());

// Científica: constantes e funções adicionais
const btnPi = Array.from(
  document.querySelectorAll(".botoes-cientifica .funcao")
).find((b) => b.textContent.trim() === "π");
if (btnPi) btnPi.addEventListener("click", () => calculadora.inserirPi());

const btnE = Array.from(
  document.querySelectorAll(".botoes-cientifica .funcao")
).find((b) => b.textContent.trim() === "e");
if (btnE) btnE.addEventListener("click", () => calculadora.inserirE());

const btnAbs = Array.from(
  document.querySelectorAll(".botoes-cientifica .funcao")
).find((b) => b.textContent.trim() === "|x|");
if (btnAbs) btnAbs.addEventListener("click", () => calculadora.valorAbsoluto());

const btnExp = Array.from(
  document.querySelectorAll(".botoes-cientifica .funcao")
).find((b) => b.textContent.trim() === "exp");
if (btnExp) btnExp.addEventListener("click", () => calculadora.exponencial());

const btnMod = Array.from(
  document.querySelectorAll(".botoes-cientifica .funcao")
).find((b) => b.textContent.trim() === "mod");
if (btnMod) btnMod.addEventListener("click", () => calculadora.modulo());

const btn10x = Array.from(
  document.querySelectorAll(".botoes-cientifica .funcao")
).find((b) => b.textContent.trim() === "10ˣ");
if (btn10x) btn10x.addEventListener("click", () => calculadora.dezElevado());

const btnLog = Array.from(
  document.querySelectorAll(".botoes-cientifica .funcao")
).find((b) => b.textContent.trim() === "log");
if (btnLog) btnLog.addEventListener("click", () => calculadora.logaritmo());

const btnLn = Array.from(
  document.querySelectorAll(".botoes-cientifica .funcao")
).find((b) => b.textContent.trim() === "ln");
if (btnLn) btnLn.addEventListener("click", () => calculadora.logNatural());

const btn2nd = Array.from(
  document.querySelectorAll(".botoes-cientifica .funcao")
).find((b) => b.textContent.trim() === "2ⁿᵈ");
if (btn2nd) btn2nd.addEventListener("click", () => calculadora.segundoGrau());

// ======================================================
// 📋  SEÇÃO 7 — CONTROLE DO MENU LATERAL E MODO ATIVO
// ======================================================

const menuIcon = document.getElementById("menuIcon");
const menuLateral = document.getElementById("menuLateral");
const menuOverlay = document.getElementById("menuOverlay");
const calculadoraElement = document.getElementById("calculadora");
const menuOpcoes = document.querySelectorAll(".menu-opcao");
const tituloEl = document.querySelector(".titulo");

function aplicarModo(modo) {
  if (!calculadoraElement) return;

  // Normaliza string: remove acentos, trim e lowercase
  const normalizar = (s) =>
    String(s || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .toLowerCase();

  const m = normalizar(modo);

  const graphContainer = document.getElementById("graphContainer");

  if (m.includes("padra")) {
    calculadoraElement.classList.add("modo-padrao");
    calculadoraElement.classList.remove("modo-cientifica");
    tituloEl && (tituloEl.textContent = "Padrão");
    calculadoraElement.style.display = "block";
    if (graphContainer) graphContainer.style.display = "none";
    const d = document.getElementById("display");
    d && d.focus();
  } else if (m.includes("cientifica")) {
    calculadoraElement.classList.add("modo-cientifica");
    calculadoraElement.classList.remove("modo-padrao");
    tituloEl && (tituloEl.textContent = "Científica");
    calculadoraElement.style.display = "block";
    if (graphContainer) graphContainer.style.display = "none";
    const d = document.getElementById("display");
    d && d.focus();
  } else if (m.includes("grafica")) {
    tituloEl && (tituloEl.textContent = "Gráfica");
    calculadoraElement.style.display = "none";
    if (graphContainer) {
      graphContainer.style.display = "block";
      // Forçar redesenho do gráfico se disponível
      if (window.__graph) window.__graph.redraw();
    }
  }
}
// Modo inicial
aplicarModo("Padrão");
// Escurece a calculadora ao abrir o menu
if (menuIcon && menuLateral && menuOverlay) {
  menuIcon.addEventListener("click", (e) => {
    e.stopPropagation();
    menuLateral.classList.add("aberto");
    menuOverlay.classList.add("ativo");
    calculadoraElement && calculadoraElement.classList.add("escurecida");
  });

  menuOverlay.addEventListener("click", () => fecharMenu());

  menuOpcoes.forEach((opcao) => {
    opcao.addEventListener("click", () => {
      menuOpcoes.forEach((o) => o.classList.remove("ativo"));
      opcao.classList.add("ativo");

      // Lê texto de forma segura e normaliza antes de aplicar
      const textoEl = opcao.querySelector(".menu-opcao-texto");
      const titulo = textoEl ? textoEl.textContent : opcao.textContent;
      aplicarModo(titulo);

      fecharMenu();
    });
  });
}

// Escurece a calculadora ao abrir o menu
function fecharMenu() {
  menuLateral && menuLateral.classList.remove("aberto");
  menuOverlay && menuOverlay.classList.remove("ativo");
  calculadoraElement && calculadoraElement.classList.remove("escurecida");
}
// Fecha menu com ESC
if (menuLateral) {
  document.addEventListener(
    "keydown",
    (e) => {
      if (e.key === "Escape" && menuLateral.classList.contains("aberto")) {
        e.preventDefault();
        e.stopPropagation();
        fecharMenu();
      }
    },
    true
  );
}
// Garante foco e cursor visível ao carregar a página
window.addEventListener("DOMContentLoaded", () => {
  const d = document.getElementById("display");
  if (!d) return;
  requestAnimationFrame(() => {
    d.focus();
    const pos = (d.value || "").length;
    try {
      d.setSelectionRange(pos, pos);
    } catch (e) {}
  });

  // Ocultar painel gráfico inicialmente
  const graphContainer = document.getElementById("graphContainer");
  if (graphContainer) graphContainer.style.display = "none";
});

// Funções globais para o gráfico
// Expor API simples de gráfico no escopo global
window.plot = () => {
  try {
    plot();
  } catch (e) {}
};

window.__graph = {
  replot: () => window.plot(),
  redraw: () => window.plot(),
};

// Estado do gráfico (zoom e offsets)
window.__graphState = {
  xMin: -10,
  xMax: 10,
  yMin: -10,
  yMax: 10,
  units: "rad", // rad | deg | grad
  lineWidth: 2,
  theme: "dark",
};

window.fecharGrafico = () => {
  aplicarModo("Padrão");
};

//#region Grafico

function abrirGrafico() {
    document.getElementById("graphContainer").classList.add("ativo");
    document.querySelector(".calculadora").style.display = "none";
}

function fecharGrafico() {
    document.getElementById("graphContainer").classList.remove("ativo");
    document.querySelector(".calculadora").style.display = "block";
}

// Controles de zoom e centralização
const __zoomInBtn = document.getElementById("zoomIn");
const __zoomOutBtn = document.getElementById("zoomOut");
const __centerBtn = document.getElementById("centerBtn");

function syncOptionsInputs() {
  const st = window.__graphState;
  const ids = ["xMin","xMax","yMin","yMax","lineWidth"];
  ids.forEach((id)=>{
    const el = document.getElementById(id);
    if (el) {
      const v = id === "lineWidth" ? st.lineWidth : st[id];
      el.value = String(v);
    }
  });
}

function zoom(factor) {
  const st = window.__graphState;
  const cx = (st.xMin + st.xMax) / 2;
  const cy = (st.yMin + st.yMax) / 2;
  const hx = (st.xMax - st.xMin) / 2 * factor;
  const hy = (st.yMax - st.yMin) / 2 * factor;
  st.xMin = cx - hx;
  st.xMax = cx + hx;
  st.yMin = cy - hy;
  st.yMax = cy + hy;
  syncOptionsInputs();
  window.plot();
}

__zoomInBtn && __zoomInBtn.addEventListener("click", () => zoom(0.8));
__zoomOutBtn && __zoomOutBtn.addEventListener("click", () => zoom(1.25));
__centerBtn && __centerBtn.addEventListener("click", () => {
  window.__graphState.xMin = -10;
  window.__graphState.xMax = 10;
  window.__graphState.yMin = -10;
  window.__graphState.yMax = 10;
  syncOptionsInputs();
  window.plot();
});

/* ==================
  FUNÇÃO DE PLOTAGEM
================== */

function plot() {
  const input = document.getElementById("exprInput");
  const expr = input.value.trim();

  if (!expr) return;

  // Validação rápida
  try {
    math.evaluate(expr, { x: 1 });
    input.classList.remove("erro");
  } catch (e) {
    input.classList.add("erro");
    return;
  }

  const canvas = document.getElementById("graphCanvas");
  const ctx = canvas.getContext("2d");

  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const w = canvas.width;
  const h = canvas.height;

  const st = window.__graphState;
  const xMin = Number(st.xMin), xMax = Number(st.xMax);
  const yMin = Number(st.yMin), yMax = Number(st.yMax);
  const scaleX = w / (xMax - xMin);
  const scaleY = h / (yMax - yMin);

  const mapX = (x) => (x - xMin) * scaleX;
  const mapY = (y) => h - (y - yMin) * scaleY;

  // Grade
  ctx.strokeStyle = st.theme === "light" ? "#ddd" : "#222";
  ctx.lineWidth = 1;
  const gridStepX = 1;
  for (let gx = Math.ceil(xMin); gx <= Math.floor(xMax); gx += gridStepX) {
    const x = mapX(gx);
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  const gridStepY = 1;
  for (let gy = Math.ceil(yMin); gy <= Math.floor(yMax); gy += gridStepY) {
    const y = mapY(gy);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  // Eixos
  ctx.strokeStyle = "#555";
  ctx.lineWidth = 2;
  if (yMin <= 0 && yMax >= 0) {
    const y0 = mapY(0);
    ctx.beginPath();
    ctx.moveTo(0, y0);
    ctx.lineTo(w, y0);
    ctx.stroke();
  }
  if (xMin <= 0 && xMax >= 0) {
    const x0 = mapX(0);
    ctx.beginPath();
    ctx.moveTo(x0, 0);
    ctx.lineTo(x0, h);
    ctx.stroke();
  }

  // Rótulos
  ctx.fillStyle = st.theme === "light" ? "#333" : "#cfcfcf";
  ctx.font = "12px Segoe UI, Arial";
  if (yMin <= 0 && yMax >= 0) {
    for (let gx = Math.ceil(xMin); gx <= Math.floor(xMax); gx += gridStepX) {
      ctx.fillText(String(gx), mapX(gx) + 2, mapY(0) - 2);
    }
  }
  if (xMin <= 0 && xMax >= 0) {
    for (let gy = Math.ceil(yMin); gy <= Math.floor(yMax); gy += gridStepY) {
      ctx.fillText(String(gy), mapX(0) + 6, mapY(gy) - 2);
    }
  }

  // Função
  ctx.strokeStyle = st.theme === "light" ? "#e56b47" : "#4da6ff";
  ctx.lineWidth = Number(st.lineWidth) || 2;
  ctx.beginPath();
  let first = true;

  let exprEval = expr;
  if (st.units !== "rad") {
    const toRadFactor = st.units === "deg" ? Math.PI / 180 : Math.PI / 200;
    math.import({
      SIN: (u) => Math.sin(u * toRadFactor),
      COS: (u) => Math.cos(u * toRadFactor),
      TAN: (u) => Math.tan(u * toRadFactor),
      ASIN: (u) => Math.asin(u) / toRadFactor,
      ACOS: (u) => Math.acos(u) / toRadFactor,
      ATAN: (u) => Math.atan(u) / toRadFactor,
    }, { override: true });
    exprEval = exprEval
      .replace(/\bsin\(/g, "SIN(")
      .replace(/\bcos\(/g, "COS(")
      .replace(/\btan\(/g, "TAN(")
      .replace(/\basin\(/g, "ASIN(")
      .replace(/\bacos\(/g, "ACOS(")
      .replace(/\batan\(/g, "ATAN(");
  }

  for (let px = 0; px < w; px++) {
    const x = xMin + (px / w) * (xMax - xMin);
    let y;
    try {
      y = math.evaluate(exprEval, { x });
    } catch {
      continue;
    }
    if (typeof y !== "number" || !isFinite(y)) continue;
    const py = mapY(y);
    if (first) { ctx.moveTo(px, py); first = false; } else { ctx.lineTo(px, py); }
  }
  ctx.stroke();
}

// ===== Eventos do painel de opções =====
const graphOptions = document.getElementById("graphOptions");
const graphOptionsToggle = document.getElementById("graphOptionsToggle");
graphOptionsToggle && graphOptionsToggle.addEventListener("click", () => {
  graphOptions.classList.toggle("ativo");
});

function bindNumber(id, setter) {
  const el = document.getElementById(id);
  if (!el) return;
  el.addEventListener("input", () => {
    const v = parseFloat(el.value);
    if (!isNaN(v)) setter(v);
    window.plot();
  });
}
bindNumber("xMin", (v) => (window.__graphState.xMin = v));
bindNumber("xMax", (v) => (window.__graphState.xMax = v));
bindNumber("yMin", (v) => (window.__graphState.yMin = v));
bindNumber("yMax", (v) => (window.__graphState.yMax = v));

const unitsRad = document.getElementById("unitsRad");
const unitsDeg = document.getElementById("unitsDeg");
const unitsGrad = document.getElementById("unitsGrad");
function setUnits(mode) {
  window.__graphState.units = mode;
  [unitsRad, unitsDeg, unitsGrad].forEach((b) => b && b.classList.remove("ativo"));
  const map = { rad: unitsRad, deg: unitsDeg, grad: unitsGrad };
  map[mode] && map[mode].classList.add("ativo");
  window.plot();
}
unitsRad && unitsRad.addEventListener("click", () => setUnits("rad"));
unitsDeg && unitsDeg.addEventListener("click", () => setUnits("deg"));
unitsGrad && unitsGrad.addEventListener("click", () => setUnits("grad"));

const lineWidthInput = document.getElementById("lineWidth");
lineWidthInput && lineWidthInput.addEventListener("input", () => {
  window.__graphState.lineWidth = parseInt(lineWidthInput.value) || 2;
  window.plot();
});

const themeLight = document.getElementById("themeLight");
const themeDark = document.getElementById("themeDark");
function setTheme(t) {
  window.__graphState.theme = t === "light" ? "light" : "dark";
  const cont = document.getElementById("graphContainer");
  cont.classList.toggle("tema-claro", window.__graphState.theme === "light");
  [themeLight, themeDark].forEach((b) => b && b.classList.remove("ativo"));
  (t === "light" ? themeLight : themeDark).classList.add("ativo");
  window.plot();
}
themeLight && themeLight.addEventListener("click", () => setTheme("light"));
themeDark && themeDark.addEventListener("click", () => setTheme("dark"));

const canvasEl = document.getElementById("graphCanvas");
let dragging = false;
let lastPos = { x: 0, y: 0 };
canvasEl && canvasEl.addEventListener("mousedown", (e) => {
  dragging = true;
  lastPos = { x: e.offsetX, y: e.offsetY };
});
document.addEventListener("mouseup", () => (dragging = false));
canvasEl && canvasEl.addEventListener("mousemove", (e) => {
  if (!dragging) return;
  const st = window.__graphState;
  const w = canvasEl.width;
  const h = canvasEl.height;
  const scaleX = w / (st.xMax - st.xMin);
  const scaleY = h / (st.yMax - st.yMin);
  const dx = e.offsetX - lastPos.x;
  const dy = e.offsetY - lastPos.y;
  const ux = -dx / scaleX;
  const uy = dy / scaleY;
  st.xMin += ux; st.xMax += ux; st.yMin += uy; st.yMax += uy;
  lastPos = { x: e.offsetX, y: e.offsetY };
  syncOptionsInputs();
  window.plot();
});

canvasEl && canvasEl.addEventListener("wheel", (e) => {
  e.preventDefault();
  const factor = e.deltaY < 0 ? 0.9 : 1.1;
  zoom(factor);
});

window.addEventListener("resize", () => window.plot());

syncOptionsInputs();

//#endregion