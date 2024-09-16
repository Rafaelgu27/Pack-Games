const canvas = document.querySelector("canvas");
const contexto = canvas.getContext("2d");
const pontuacao = document.querySelector(".pontuacao--valor");
const pontuacaoFinal = document.querySelector(".pontuacao-final > span");
const menu = document.querySelector(".menu-screen");
const modoJogoDiv = document.querySelector(".modo-jogo");
const botaoSingle = document.querySelector(".botao-single");
const botaoMultiplayer = document.querySelector(".botao-multiplayer");
const audio = new Audio("./assets/audio.mp3");
const audioFundo = new Audio("./assets/audioFundo.mp3");
const botaoMute = document.querySelector(".botao-mute");
const instrucoes = document.querySelector(".instrucoes");
const tamanho = 30;
const posicaoInicial = { x: 270, y: 240 };
let cobra = [posicaoInicial];
let direcao, ultimaDirecao, loopId;
let modoJogo = 'single';

let audioMuted = JSON.parse(localStorage.getItem('audioMuted')) || false;
audio.muted = audioMuted;
audioFundo.muted = audioMuted;
botaoMute.innerText = audioMuted ? "🔇" : "🔊";

botaoMute.addEventListener("click", () => {
    audioMuted = !audioMuted;
    audio.muted = audioMuted;
    audioFundo.muted = audioMuted;
    botaoMute.innerText = audioMuted ? "🔇" : "🔊";
    localStorage.setItem('audioMuted', JSON.stringify(audioMuted));
});

const recorde = localStorage.getItem('recorde') || 0;
const recordeElemento = document.createElement('div');
recordeElemento.classList.add('recorde');
recordeElemento.innerText = `Recorde: ${recorde}`;
document.body.insertBefore(recordeElemento, canvas);

const adicionarPontuacao = () => {
    pontuacao.innerText = (+pontuacao.innerText + 10).toString().padStart(2, '0');
};

const numeroAleatorio = (min, max) => {
    return Math.round(Math.random() * (max - min) + min);
};

const posicaoAleatoria = () => {
    const numero = numeroAleatorio(0, canvas.width - tamanho);
    return Math.round(numero / 30) * 30;
};

const corAleatoria = () => {
    const vermelho = numeroAleatorio(0, 255);
    const verde = numeroAleatorio(0, 255);
    const azul = numeroAleatorio(0, 255);
    return `rgb(${vermelho}, ${verde}, ${azul})`;
};

const comida = {
    x: posicaoAleatoria(),
    y: posicaoAleatoria(),
    cor: corAleatoria()
};

const desenhoComida = () => {
    const { x, y, cor } = comida;
    contexto.shadowColor = cor;
    contexto.shadowBlur = 6;
    contexto.fillStyle = cor;
    contexto.fillRect(x, y, tamanho, tamanho);
    contexto.shadowBlur = 0;
};

const desenhoCobra = () => {
    cobra.forEach((posicao, index) => {
        if (index == cobra.length - 1) {
            contexto.fillStyle = "#008000";
            contexto.fillRect(posicao.x, posicao.y, tamanho, tamanho);
            contexto.strokeStyle = '#008000';
            contexto.lineWidth = 2;
            contexto.strokeRect(posicao.x, posicao.y, tamanho, tamanho);
        } else {
            contexto.fillStyle = "#006400";
            contexto.fillRect(posicao.x, posicao.y, tamanho, tamanho);
            contexto.strokeStyle = '#008000';
            contexto.lineWidth = 2;
            contexto.strokeRect(posicao.x, posicao.y, tamanho, tamanho);
        }
    });
};

document.addEventListener("keydown", ({ key }) => {
    if (modoJogo === 'single') {
        if ((key == "ArrowRight") && ultimaDirecao != "esquerda") {
            direcao = "direita";
        }
        if ((key == "ArrowLeft") && ultimaDirecao != "direita") {
            direcao = "esquerda";
        }
        if ((key == "ArrowDown") && ultimaDirecao != "cima") {
            direcao = "baixo";
        }
        if ((key == "ArrowUp") && ultimaDirecao != "baixo") {
            direcao = "cima";
        }
    } else if (modoJogo === 'multiplayer') {
        if ((key == "ArrowRight") && ultimaDirecao != "esquerda") {
            direcao = "direita";
        }
        if ((key == "ArrowLeft") && ultimaDirecao != "direita") {
            direcao = "esquerda";
        }
        if ((key == "w") && ultimaDirecao != "baixo") {
            direcao = "cima";
        }
        if ((key == "s") && ultimaDirecao != "cima") {
            direcao = "baixo";
        }
    }

    if (key == "m" || key == "M") {
        audioMuted = !audioMuted;
        audio.muted = audioMuted;
        audioFundo.muted = audioMuted;
        botaoMute.innerText = audioMuted ? "🔇" : "🔊";
        localStorage.setItem('audioMuted', JSON.stringify(audioMuted));
    }
    if (key == "Escape") {
        window.location.href = "../inicio.html";
    }
    if (key == "h" || key == "H") {
        window.location.href = "historiaCobrinha.html";
    }
});

const moverCobra = () => {
    if (!jogoEmAndamento) return;
    if (!direcao) return;

    const cabeca = cobra[cobra.length - 1];

    if (direcao == "direita") {
        cobra.push({ x: cabeca.x + tamanho, y: cabeca.y });
    }
    if (direcao == "esquerda") {
        cobra.push({ x: cabeca.x - tamanho, y: cabeca.y });
    }
    if (direcao == "baixo") {
        cobra.push({ x: cabeca.x, y: cabeca.y + tamanho });
    }
    if (direcao == "cima") {
        cobra.push({ x: cabeca.x, y: cabeca.y - tamanho });
    }

    cobra.shift();
    ultimaDirecao = direcao;
};

const checarComida = () => {
    const cabeca = cobra[cobra.length - 1];

    if (cabeca.x == comida.x && cabeca.y == comida.y) {
        adicionarPontuacao();
        cobra.push(cabeca);
        audio.play();

        let x = posicaoAleatoria();
        let y = posicaoAleatoria();

        while (cobra.find((posicao) => posicao.x == x && posicao.y == y)) {
            x = posicaoAleatoria();
            y = posicaoAleatoria();
        }

        comida.x = x;
        comida.y = y;
        comida.cor = corAleatoria();
    }
};

const checarColisao = () => {
    const cabeca = cobra[cobra.length - 1];
    const canvasLimite = canvas.width - tamanho;
    const pescocoIndex = cobra.length - 2;

    const paredeColisao =
        cabeca.x < 0 || cabeca.x > canvasLimite || cabeca.y < 0 || cabeca.y > canvasLimite;

    const autoColisao = cobra.find((posicao, index) => {
        return index < pescocoIndex && posicao.x == cabeca.x && posicao.y == cabeca.y;
    });

    if (paredeColisao || autoColisao) {
        gameOver();
    }
};

let jogoEmAndamento = true;

const gameOver = () => {
    direcao = undefined;
    jogoEmAndamento = false;
    menu.style.display = "flex";
    modoJogoDiv.style.display = "flex";
    pontuacaoFinal.innerText = pontuacao.innerText;

    const pontuacaoAtual = parseInt(pontuacao.innerText, 10);
    const recordeAtual = parseInt(localStorage.getItem('recorde'), 10) || 0;
    if (pontuacaoAtual > recordeAtual) {
        localStorage.setItem('recorde', pontuacaoAtual);
        recordeElemento.innerText = `Recorde: ${pontuacaoAtual}`;
    } else {
        recordeElemento.innerText = `Recorde: ${recordeAtual}`;
    }

    canvas.style.filter = "blur(2px)";
};

const reiniciarJogo = () => {
    pontuacao.innerText = "00";
    menu.style.display = "none";
    modoJogoDiv.style.display = "none";
    canvas.style.filter = "none";
    cobra = [posicaoInicial];
    jogoEmAndamento = true;
};

const gameLoop = () => {
    clearInterval(loopId);

    contexto.clearRect(0, 0, 600, 600);
    desenhoComida();
    moverCobra();
    desenhoCobra();
    checarComida();
    checarColisao();
    audioFundo.play();

    loopId = setTimeout(() => {
        gameLoop();
    }, 150);
};

botaoSingle.addEventListener("click", () => {
    modoJogo = 'single';
    instrucoes.innerText = "Use as setas para mover a cobra.";
    instrucoes.style.display = 'block';
    reiniciarJogo();
    gameLoop();
});

botaoMultiplayer.addEventListener("click", () => {
    modoJogo = 'multiplayer';
    instrucoes.innerText = "Jogador 1: \n \n W / S. \n \n Jogador 2: \n \n Seta Direita -> / <- Seta Esquerda \n \n Trabalhem juntos para conquistar uma grande pontuação!" ;
    instrucoes.style.display = 'block';
    reiniciarJogo();
    gameLoop();
});

menu.style.display = "none";
instrucoes.style.display = "none";
document.addEventListener('DOMContentLoaded', (event) => {
    /*Adiciona a classe no-scroll ao body para travar a rolagem*/
    document.body.classList.add('no-scroll');

    /*Remove a classe no-scroll ao clicar em um botão específico*/
    document.querySelector('.botao-voltar').addEventListener('click', () => {
        document.body.classList.remove('no-scroll');
    });
});
