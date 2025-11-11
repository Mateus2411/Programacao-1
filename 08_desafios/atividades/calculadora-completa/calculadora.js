// ======================================================
// CLASSE PRINCIPAL: Calculadora
// ======================================================
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
        setTimeout(() => {
            const newPos = Math.min(cursorPos, this.display.length || 1);
            inputDisplay.setSelectionRange(newPos, newPos);
        }, 0);
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
        const cursorPos = inputDisplay.selectionStart || this.display.length;

        if (this.display === "" || this.display === "0") {
            if (operacao === "-") {
                this.display = "-";
                this.atualizarDisplay();
                setTimeout(() => inputDisplay.setSelectionRange(1, 1), 0);
            }
            return;
        }

        // Traduz símbolos visuais para operadores JS
        let operador = operacao;
        if (operacao === "×") operador = "*";
        if (operacao === "÷") operador = "/";

        this.display =
            this.display.slice(0, cursorPos) +
            operador +
            this.display.slice(cursorPos);

        this.limparClassesErro();
        this.atualizarDisplay();
        setTimeout(
            () => inputDisplay.setSelectionRange(cursorPos + 1, cursorPos + 1),
            0
        );
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
            this.display =
                this.display.slice(0, start) + this.display.slice(end);
            this.atualizarDisplay();
            setTimeout(() => inputDisplay.setSelectionRange(start, start), 0);
        } else if (start > 0) {
            // Apaga caractere antes do cursor
            this.display =
                this.display.slice(0, start - 1) + this.display.slice(start);
            this.atualizarDisplay();
            setTimeout(
                () => inputDisplay.setSelectionRange(start - 1, start - 1),
                0
            );
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
                expressao = expressao.replace(/,/g, ".");
                const resultado = this.calcularExpressao(expressao);
                if (isNaN(resultado) || !isFinite(resultado)) throw new Error();

                this.display = resultado.toString().replace(/\./g, ",");
                inputDisplay.classList.remove("calculando");
            } catch {
                this.mostrarErro("Erro no cálculo");
            }
            this.atualizarDisplay();
        }, 500);
    }

    validarExpressao(expressao) {
        const regex = /^[0-9+\-*/,.() ]+$/;
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
    recíproco() {
        return this.reciproco();
    }

    quadrado() {
        const valor = this.obterValorAtual();
        const resultado = valor * valor;
        this.display = resultado.toString().replace(/\./g, ",");
        this.limparClassesErro();
        this.atualizarDisplay();
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
    fatorial(){
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
    btnSquare.addEventListener("click", () => calculadora.quadrado());

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
    btnSquareC.addEventListener("click", () => calculadora.quadrado());

const btnSqrtC = document.getElementById("sqrt_c");
if (btnSqrtC)
    btnSqrtC.addEventListener("click", () => calculadora.raizQuadrada());

const fatorialBtn = document.getElementById("fatorialBtn");
if (fatorialBtn)
    fatorialBtn.addEventListener("click", () => calculadora.fatorial());
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

    if (m.includes("padra")) {
        calculadoraElement.classList.add("modo-padrao");
        calculadoraElement.classList.remove("modo-cientifica");
        tituloEl && (tituloEl.textContent = "Padrão");
        const d = document.getElementById("display");
        d && d.focus();
    } else {
        calculadoraElement.classList.add("modo-cientifica");
        calculadoraElement.classList.remove("modo-padrao");
        tituloEl && (tituloEl.textContent = "Científica");
        const d = document.getElementById("display");
        d && d.focus();
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
    document.addEventListener("keydown",(e) => {
            if (e.key === "Escape" && menuLateral.classList.contains("aberto")) {
                e.preventDefault();
                e.stopPropagation();
                fecharMenu();
            }
        },
        true
    );
}