class Calculadora {
    constructor() {
        this.display = "";
        this.configurarTeclado();
    }

    // Métodos de manipulação de DOM
    atualizarDisplay() {
        const inputDisplay = document.getElementById("display");
        const cursorPos = inputDisplay.selectionStart || 0;

        if (this.display === "") {
            inputDisplay.value = "0";
        } else {
            inputDisplay.value = this.display;
        }

        // Mantém a posição do cursor após atualizar
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
        setTimeout(() => {
            this.display = "";
            inputDisplay.classList.remove("erro");
            this.atualizarDisplay();
        }, 2000);
    }

    adicionarNumero(numero) {
        const inputDisplay = document.getElementById("display");
        let cursorPos = inputDisplay.selectionStart || this.display.length;

        if (this.display === "0" && numero !== ",") {
            this.display = numero;
            cursorPos = 1;
        } else {
            // Converte vírgula para ponto para cálculos
            const numeroFormatado = numero === "," ? "." : numero;
            this.display =
                this.display.slice(0, cursorPos) +
                numeroFormatado +
                this.display.slice(cursorPos);
        }
        this.limparClassesErro();
        this.atualizarDisplay();
        // Reposiciona o cursor após o caractere inserido
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
                setTimeout(() => {
                    inputDisplay.setSelectionRange(1, 1);
                }, 0);
            }
            return;
        }

        // Converte símbolos Unicode para operadores JavaScript
        let operador = operacao;
        if (operacao === "×") operador = "*";
        if (operacao === "÷") operador = "/";

        this.display =
            this.display.slice(0, cursorPos) +
            operador +
            this.display.slice(cursorPos);
        this.limparClassesErro();
        this.atualizarDisplay();
        // Reposiciona o cursor após o operador inserido
        setTimeout(() => {
            inputDisplay.setSelectionRange(cursorPos + 1, cursorPos + 1);
        }, 0);
    }

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
        // CE - limpa apenas a última entrada (volta para 0)
        this.limparClassesErro();
        this.display = "";
        this.atualizarDisplay();
    }

    calcular() {
        const inputDisplay = document.getElementById("display");
        let expressao = this.display;

        if (expressao === "" || expressao === "0") return;

        // Valida a expressão antes de calcular
        if (!this.validarExpressao(expressao)) {
            this.mostrarErro("Expressão inválida");
            return;
        }

        // Mostra "Calculando..."
        inputDisplay.value = "Calculando...";
        inputDisplay.classList.remove("erro");
        inputDisplay.classList.add("calculando");

        setTimeout(() => {
            try {
                // Converte vírgulas para pontos
                expressao = expressao.replace(/,/g, ".");
                const resultado = this.calcularExpressao(expressao);
                if (isNaN(resultado) || !isFinite(resultado)) {
                    throw new Error("Resultado inválido");
                }
                this.display = resultado.toString().replace(/\./g, ",");
                inputDisplay.classList.remove("calculando");
            } catch (erro) {
                this.mostrarErro("Erro no cálculo");
            }
            this.atualizarDisplay();
        }, 500);
    }

    // Métodos de lógica de cálculo
    validarExpressao(expressao) {
        // Permite apenas números, operadores básicos, vírgulas e pontos
        const regex = /^[0-9+\-*/,.() ]+$/;
        if (!regex.test(expressao)) return false;

        // Verifica parênteses balanceados (simples)
        let count = 0;
        for (let char of expressao) {
            if (char === "(") count++;
            if (char === ")") count--;
            if (count < 0) return false;
        }
        return count === 0;
    }

    calcularExpressao(expressao) {
        // Substitui eval() por uma implementação mais segura
        // Para operações básicas, podemos usar Function, mas ainda com risco
        // Para este projeto, mantemos eval() mas com validação
        return eval(expressao);
    }

    validarExpressao(expressao) {
        // Permite apenas números, operadores básicos, vírgulas e pontos
        const regex = /^[0-9+\-*/,.() ]+$/;
        if (!regex.test(expressao)) return false;

        // Verifica parênteses balanceados (simples)
        let count = 0;
        for (let char of expressao) {
            if (char === "(") count++;
            if (char === ")") count--;
            if (count < 0) return false;
        }
        return count === 0;
    }

    calcularExpressao(expressao) {
        // Substitui eval() por uma implementação mais segura
        // Para operações básicas, podemos usar Function, mas ainda com risco
        // Para este projeto, mantemos eval() mas com validação
        return eval(expressao);
    }

    obterValorAtual() {
        // Se houver uma expressão, calcula primeiro
        let expressaoParaVerificar = this.display
            .replace(/×/g, "*")
            .replace(/÷/g, "/");
        if (
            expressaoParaVerificar.includes("+") ||
            expressaoParaVerificar.includes("-") ||
            expressaoParaVerificar.includes("*") ||
            expressaoParaVerificar.includes("/")
        ) {
            try {
                let expressao = this.display
                    .replace(/,/g, ".")
                    .replace(/×/g, "*")
                    .replace(/÷/g, "/");
                return eval(expressao);
            } catch (erro) {
                return 0;
            }
        }
        // Caso contrário, retorna o valor direto
        let valorTexto = this.display || "0";
        return parseFloat(valorTexto.replace(/,/g, ".")) || 0;
    }

    // Removidas funções avançadas: porcentagem, recíproco, quadrado, raizQuadrada
    // Focando apenas no básico: operações aritméticas essenciais

    inverterSinal() {
        let valorTexto = this.display || "0";
        if (valorTexto === "0") return;

        if (valorTexto.startsWith("-")) {
            this.display = valorTexto.substring(1);
        } else {
            this.display = "-" + valorTexto;
        }
        this.limparClassesErro();
        this.atualizarDisplay();
    }

    apagarCursor() {
        const inputDisplay = document.getElementById("display");
        const start = inputDisplay.selectionStart || 0;
        const end = inputDisplay.selectionEnd || 0;

        // Se há seleção, apaga a seleção
        if (start !== end) {
            this.display =
                this.display.slice(0, start) + this.display.slice(end);
            this.atualizarDisplay();
            setTimeout(() => {
                inputDisplay.setSelectionRange(start, start);
            }, 0);
            this.limparClassesErro();
            return;
        }

        // Se não há seleção, apaga o caractere à esquerda do cursor (comportamento padrão do Backspace)
        if (start > 0) {
            this.display =
                this.display.slice(0, start - 1) + this.display.slice(start);
            this.atualizarDisplay();
            setTimeout(() => {
                inputDisplay.setSelectionRange(start - 1, start - 1);
            }, 0);
        }

        this.limparClassesErro();
    }

    configurarTeclado() {
        const inputDisplay = document.getElementById("display");

        // Sincroniza quando o usuário digita diretamente no input
        inputDisplay.addEventListener("input", () => {
            let valor = inputDisplay.value;
            // Remove o "0" inicial se o usuário começar a digitar
            if (valor === "0" && inputDisplay.selectionStart > 0) {
                valor = valor.slice(1);
            }
            this.display = valor.replace(/\./g, ",");
        });

        document.addEventListener("keydown", (event) => {
            // Se o menu estiver aberto e pressionar ESC, fecha o menu (não limpa o display)
            const menuLateral = document.getElementById("menuLateral");
            if (
                event.key === "Escape" &&
                menuLateral &&
                menuLateral.classList.contains("aberto")
            ) {
                return; // Deixa o handler do menu lidar com isso
            }

            const tecla = event.key;
            let tipo = "";

            if (!isNaN(tecla) || tecla === "." || tecla === ",")
                tipo = "numero";
            else if (["+", "-", "*", "/"].includes(tecla)) tipo = "operacao";
            else if (tecla === "Enter") tipo = "resultado";
            else if (tecla === "Backspace") tipo = "apagar";
            else if (tecla === "Escape") tipo = "limpar";
            else tipo = "outro";

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

let calculadora = new Calculadora();

// Números
document.querySelectorAll(".numero").forEach((botao) => {
    botao.addEventListener("click", () => {
        calculadora.adicionarNumero(botao.value);
        calculadora.atualizarDisplay();
    });
});

// Operadores
document.querySelectorAll(".operacao:not(.igual)").forEach((botao) => {
    botao.addEventListener("click", () => {
        calculadora.adicionarOperacao(botao.innerText);
        calculadora.atualizarDisplay();
    });
});

// Botão de igual
document.getElementById("resultado").addEventListener("click", () => {
    calculadora.calcular();
});

// Botões de função
document.getElementById("limpar").addEventListener("click", () => {
    calculadora.limparDisplay();
});

document.getElementById("apagar").addEventListener("click", () => {
    calculadora.apagarCursor();
});

document.getElementById("ce").addEventListener("click", () => {
    calculadora.limparEntrada();
});

// Removidos event listeners para funções avançadas: percent, reciprocal, square, sqrt

document.getElementById("plusminus").addEventListener("click", () => {
    calculadora.inverterSinal();
});

// ============================================
// CONTROLE DO MENU LATERAL
// ============================================
const menuIcon = document.getElementById("menuIcon");
const menuLateral = document.getElementById("menuLateral");
const menuOverlay = document.getElementById("menuOverlay");
const calculadoraElement = document.getElementById("calculadora");
const menuOpcoes = document.querySelectorAll(".menu-opcao");

// Abrir menu
menuIcon.addEventListener("click", (e) => {
    e.stopPropagation();
    menuLateral.classList.add("aberto");
    menuOverlay.classList.add("ativo");
    calculadoraElement.classList.add("escurecida");
});

// Fechar menu ao clicar no overlay
menuOverlay.addEventListener("click", () => {
    fecharMenu();
});

// Fechar menu ao clicar em uma opção
menuOpcoes.forEach((opcao) => {
    opcao.addEventListener("click", () => {
        // Remove ativo de todas as opções
        menuOpcoes.forEach((o) => o.classList.remove("ativo"));
        // Adiciona ativo na opção clicada
        opcao.classList.add("ativo");

        // Atualiza o título no cabeçalho (apenas visual)
        const titulo = opcao.querySelector(".menu-opcao-texto").textContent;
        document.querySelector(".titulo").textContent = titulo;

        // Fecha o menu
        fecharMenu();
    });
});

// Função para fechar o menu
function fecharMenu() {
    menuLateral.classList.remove("aberto");
    menuOverlay.classList.remove("ativo");
    calculadoraElement.classList.remove("escurecida");
}

// Fechar menu ao pressionar ESC (se o menu estiver aberto)
// Usa capture: true para executar antes do handler da calculadora
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
