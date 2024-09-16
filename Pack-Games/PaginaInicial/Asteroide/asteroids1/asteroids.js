const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Ajusta o tamanho do canvas
function ajustarCanvas() {
    canvas.width = 1300;
    canvas.height = 1230;
}

// Carrega e desenha o fundo
const fundo = new Image();
fundo.src = 'img/espaco.png';

// Imagem do tiro
const tiroImagem = new Image();
tiroImagem.src = 'img/tiro.png';

let nave;
let teclas = { esquerda: false, direita: false, frente: false, espaco: false };
const velocidadeRotacao = 10; // Velocidade de rotação em graus por frame
const atrasoRotacao = 1; // Delay para a rotação
const velocidadeMovimento = 10; // Velocidade de movimento da nave
const velocidadeTiro = 15; // Velocidade do tiro
const intervaloGerarAsteroides = 1000;
const maxAsteroidesNaTela = 15;
let podeAtirar = true; // Permite ou bloqueia o disparo
const intervaloTiro = 1; // Tempo de recarga em milissegundos
let jogoIniciado = false;

const restartButton = document.getElementById('restartButton');
restartButton.style.display = 'none';

const iniciarButton = document.getElementById('startButton')

let pontuacao = 0;
let recorde1 = 0;

let vidas = 5;
const spanVidas = document.querySelector('.vidas');

// Atualizar vidas com imagens de naves
function atualizarVidas() {
    spanVidas.innerHTML = ''; // Limpa o conteúdo atual
    for (let i = 0; i < vidas; i++) {
        const img = document.createElement('img');
        img.src = 'img/nav2.png'; // Caminho da imagem da nave
        img.style.display = 'block'; // Para que cada nave apareça uma abaixo da outra
        img.style.marginBottom = '5px'; // Opcional: ajuste para dar espaço entre as naves
        spanVidas.appendChild(img);
    }
}

// Lista de tiros
let tiros = [];

// Classe para a nave
class Nave {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.angulo = 0; // Ângulo inicial
        this.velocidadeAngular = 0; // Velocidade angular inicial

        // Imagem da nave
        this.imagem = new Image();
        this.imagem.src = 'img/nav1.png';

        // Defina o tamanho da nave
        this.largura = 50;
        this.altura = 50;
    }

    desenhar() {
        // Desenha a nave ajustando a posição para que fique centralizada
        ctx.save(); // Salva o estado atual do contexto
        ctx.translate(this.x, this.y); // Move o ponto de origem para o centro da nave
        ctx.rotate(this.angulo * Math.PI / 180); // Rotaciona o contexto
        ctx.drawImage(this.imagem, -this.largura / 2, -this.altura / 2, this.largura, this.altura); // Desenha a nave
        ctx.restore(); // Restaura o estado do contexto
    }

    atualizar() {
        // Atualiza o ângulo com base na velocidade angular
        this.angulo += this.velocidadeAngular;
        this.angulo %= 360; // Mantém o ângulo entre 0 e 360 graus

        // Atualiza a velocidade angular com base na tecla pressionada
        if (teclas.esquerda) {
            this.velocidadeAngular = -velocidadeRotacao;
        } else if (teclas.direita) {
            this.velocidadeAngular = velocidadeRotacao;
        } else {
            // Reduz a velocidade angular gradualmente até zerar se nenhuma tecla estiver pressionada
            if (this.velocidadeAngular > 0) {
                this.velocidadeAngular = Math.max(0, this.velocidadeAngular - atrasoRotacao);
            } else if (this.velocidadeAngular < 0) {
                this.velocidadeAngular = Math.min(0, this.velocidadeAngular + atrasoRotacao);
            }
        }

        // Move a nave na direção em que está apontando se a tecla frente estiver pressionada
        if (teclas.frente) {
            const radianos = (this.angulo - 90) * Math.PI / 180; // Ajusta o ângulo para que 0 graus seja para a direita e 90 graus para cima
            this.x += Math.cos(radianos) * velocidadeMovimento;
            this.y += Math.sin(radianos) * velocidadeMovimento;
        }

        // Dispara um tiro se a tecla Espaço estiver pressionada
        if (teclas.espaco) {
            this.disparar();
            teclas.espaco = false; // Evita disparar múltiplos tiros ao manter a tecla pressionada
        }
    }

    disparar() {
        if (podeAtirar) {
            const radianos = (this.angulo - 90) * Math.PI / 180; // Ajusta o ângulo para o tiro
            const anguloTiro = this.angulo - 90; // Ajuste o ângulo do tiro
            const radianosTiro = anguloTiro * Math.PI / 180;

            const tiroX = this.x - Math.cos(radianos);
            const tiroY = this.y - Math.sin(radianos);

            tiros.push({
                x: tiroX,
                y: tiroY,
                vx: Math.cos(radianosTiro) * velocidadeTiro,
                vy: Math.sin(radianosTiro) * velocidadeTiro
            });

            podeAtirar = false; // Bloqueia novos disparos
            setTimeout(() => {
                podeAtirar = true; // Permite disparar novamente após o intervalo
            }, intervaloTiro);
        }
    }
}


// Imagens dos asteroides
const asteroideImagens = [
    'img/as1.png', // Maior
    'img/as2.png', // Médio
    'img/as3.png'  // Menor
];

// Lista de asteroides
let asteroides = [];

//Class asteroide
class Asteroide {
    constructor(x, y, tipo) {
        this.x = x;
        this.y = y;
        this.tipo = tipo; // Tipo de asteroide (0: grande, 1: médio, 2: pequeno)
        this.imagem = new Image();
        this.imagem.src = asteroideImagens[tipo];
        this.largura = 0;
        this.altura = 0;

        // Velocidade de movimento do asteroide (aleatória)
        this.vx = (Math.random() * 2 - 1) * 3; // Aleatório entre -2 e 2
        this.vy = (Math.random() * 2 - 1) * 3;

        // Defina o tamanho do asteroide com base no tipo
        switch (tipo) {
            case 0:
                this.largura = 80; // Grande
                this.altura = 80;
                break;
            case 1:
                this.largura = 60; // Médio
                this.altura = 60;
                break;
            case 2:
                this.largura = 50; // Pequeno
                this.altura = 50;
                break;
        }
    }

    atualizar() {
        // Move o asteroide
        this.x += this.vx;
        this.y += this.vy;

        // Verifica se o asteroide saiu da tela e reposiciona-o na posição oposta
        if (this.x < 0) {
            this.x = canvas.width;
        } else if (this.x > canvas.width) {
            this.x = 0;
        }
        if (this.y < 0) {
            this.y = canvas.height;
        } else if (this.y > canvas.height) {
            this.y = 0;
        }
    }

    desenhar() {
        ctx.drawImage(this.imagem, this.x - this.largura / 2, this.y - this.altura / 2, this.largura, this.altura);
    }

    dividir() {
        if (this.tipo === 0) { // Grande
            return [new Asteroide(this.x, this.y, 1), new Asteroide(this.x, this.y, 1)];
        } else if (this.tipo === 1) { // Médio
            return [new Asteroide(this.x, this.y, 2)];
        }
        return [];
    }
}

// Função para gerar asteroides nas bordas da tela
function gerarAsteroidesNasBordas() {
    setInterval(() => {
        if (asteroides.length < maxAsteroidesNaTela) {
            let x, y;

            // Escolher uma borda aleatória
            const borda = Math.floor(Math.random() * 4); // 0: topo, 1: direita, 2: baixo, 3: esquerda

            switch (borda) {
                case 0: // Topo
                    x = Math.random() * canvas.width;
                    y = 0;
                    break;
                case 1: // Direita
                    x = canvas.width;
                    y = Math.random() * canvas.height;
                    break;
                case 2: // Baixo
                    x = Math.random() * canvas.width;
                    y = canvas.height;
                    break;
                case 3: // Esquerda
                    x = 0;
                    y = Math.random() * canvas.height;
                    break;
            }

            // Escolher um tipo de asteroide (0, 1 ou 2)
            const tipo = Math.floor(Math.random() * 2); // Escolhe aleatoriamente entre grande, médio e pequeno

            // Criar o asteroide e calcular sua velocidade em direção ao centro da tela
            const asteroide = new Asteroide(x, y, tipo);

            // Calcular a direção para o centro da tela
            const centroX = canvas.width / 2;
            const centroY = canvas.height / 2;
            const anguloParaCentro = Math.atan2(centroY - asteroide.y, centroX - asteroide.x);

            // Definir a velocidade para o asteroide seguir em direção ao centro
            const velocidadeBase = 0.7 + Math.random(); // Pequena variação na velocidade
            asteroide.vx = Math.cos(anguloParaCentro) * velocidadeBase;
            asteroide.vy = Math.sin(anguloParaCentro) * velocidadeBase;

            asteroides.push(asteroide);
        }
    }, intervaloGerarAsteroides);
}


function verificarColisao(tiro, asteroide) {
    const distanciaX = tiro.x - asteroide.x;
    const distanciaY = tiro.y - asteroide.y;
    const distancia = Math.sqrt(distanciaX * distanciaX + distanciaY * distanciaY);
    
    // Verifica se há colisão
    if (distancia < (tiroImagem.width / 2 + asteroide.largura / 2)) {
        // Atualiza a pontuação com base no tipo do asteroide
        if (asteroide.tipo === 0) {
            pontuacao += 5;
        } else if (asteroide.tipo === 1) {
            pontuacao += 10;
        } else if (asteroide.tipo === 2) {
            pontuacao += 15;
        }

        atualizarPontuacao(); // Atualiza a pontuação na interface HTML
        atualizarRecorde();

        return true; // Retorna verdadeiro se houve colisão
    }

    return false; // Retorna falso se não houve colisão
}


function verificarColisaoNaveAsteroide(asteroide) {
    const distanciaX = nave.x - asteroide.x;
    const distanciaY = nave.y - asteroide.y;
    const distancia = Math.sqrt(distanciaX * distanciaX + distanciaY * distanciaY);
    return distancia < (nave.largura / 2 + asteroide.largura / 2);
}

function loop(){

    if (!jogoIniciado || vidas <= 0) {
        desenharGameOver();
        return; // Interrompe o loop quando o jogo acaba ou ainda não começou
    }
    
    if (vidas <= 0) {
        desenharGameOver();
        return; // Interrompe o loop quando o jogo acaba
    }

    ctx.drawImage(fundo, 0, 0, canvas.width, canvas.height);
    atualizarVidas();

    // Atualiza e desenha os tiros
    tiros.forEach((tiro, index) => {
        tiro.x += tiro.vx;
        tiro.y += tiro.vy;

        // Remove tiros que saíram da tela
        if (tiro.x < 0 || tiro.x > canvas.width || tiro.y < 0 || tiro.y > canvas.height) {
            tiros.splice(index, 1);
        } else {
            ctx.drawImage(tiroImagem, tiro.x - 10, tiro.y - 10, 20, 20); // Centraliza o tiro
        }
    });

    // Atualiza e desenha a nave
    nave.atualizar();
    nave.desenhar();

    // Atualiza e desenha os asteroides
    asteroides.forEach((asteroide, index) => {
        asteroide.atualizar(); // Atualiza a posição do asteroide
        asteroide.desenhar();

        // Verifica se algum tiro colidiu com o asteroide
        tiros.forEach((tiro, tiroIndex) => {
            if (verificarColisao(tiro, asteroide)) {
                // Remove o asteroide e o tiro
                asteroides.splice(index, 1);
                tiros.splice(tiroIndex, 1);

                // Adiciona novos asteroides se necessário
                const novosAsteroides = asteroide.dividir();
                asteroides.push(...novosAsteroides);
            }
        });
    });


    // Dentro do loop principal onde você verifica as colisões
    asteroides.forEach((asteroide, index) => {
        asteroide.atualizar(); // Atualiza a posição do asteroide
        asteroide.desenhar();

        
        // Verifica se a nave colidiu com o asteroide
        if (verificarColisaoNaveAsteroide(asteroide)) {
            vidas -= 1;
            atualizarVidas(); // Atualiza o span com o número de vidas
            asteroides.splice(index, 1); // Remove o asteroide após a colisão

            if (vidas <= 0) {
                desenharGameOver();
            }
        }
    });


    // Atualiza e desenha os asteroides
    asteroides.forEach((asteroide, index) => {
    asteroide.atualizar(); // Atualiza a posição do asteroide
    asteroide.desenhar();

    });
    requestAnimationFrame(loop);
}



// Adiciona eventos de teclado
window.addEventListener('keydown', (e) => {
    if (e.keyCode === 37) { // Código da seta para a esquerda
        teclas.esquerda = true;
    } else if (e.keyCode === 39) { // Código da seta para a direita
        teclas.direita = true;
    } else if (e.keyCode === 38) { // Código da seta para cima
        teclas.frente = true;
    } else if (e.keyCode === 32) { // Código da tecla Espaço
        teclas.espaco = true;
        nave.disparar(); // Agora o disparo só ocorre quando a tecla espaço é pressionada
    } else if (e.keyCode === 13) { // Código da tecla Enter
        iniciarJogo(); // Inicia o jogo ao pressionar Enter
    } else if(e.keyCode === 27){
        document.querySelector('.botao-voltar').click();
    }

    restartButton.addEventListener('click', () => {
        this.location.reload()
    });

});

window.addEventListener('keyup', (e) => {
    if (e.keyCode === 37) { // Código da seta para a esquerda
        teclas.esquerda = false;
    } else if (e.keyCode === 39) { // Código da seta para a direita
        teclas.direita = false;
    } else if (e.keyCode === 38) { // Código da seta para cima
        teclas.frente = false;
    } else if (e.keyCode === 32) { // Código da tecla Espaço
        teclas.espaco = false;
    }
});

function desenharGameOver() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'white';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2);

    ctx.font = '24px Arial';
    ctx.fillText('Pontuação final: ' + pontuacao, canvas.width / 2, canvas.height / 2 + 50);

    // Exibir o botão de reiniciar
    const restartButton = document.getElementById('restartButton');
    restartButton.style.display = 'block';
}

// Função para carregar o recorde do localStorage
function carregarRecorde() {
    recorde1 = localStorage.getItem('recorde1');
    if (recorde1 !== null) {
        recorde1 = parseInt(recorde1, 10);
    } else {
        recorde1 = 0; // Inicializa com 0 se não houver um recorde armazenado
    }
    document.getElementById('recorde1').innerText = `Recorde: ${recorde1}`;
}

// Função para atualizar o recorde no localStorage
function atualizarRecorde() {
    if (pontuacao > recorde1) {
        recorde1 = pontuacao; // Atualiza o recorde se a pontuação for maior
        localStorage.setItem('recorde1', recorde1);
    }
    document.getElementById('recorde1').innerText = `Recorde: ${recorde1}`;
}

// Função para atualizar a pontuação na interface HTML e verificar o recorde
function atualizarPontuacao() {
    document.getElementById('pontuacao').innerText = `Pontuação: ${pontuacao}`;
    atualizarRecorde(); // Verifica e atualiza o recorde
}

// Função para iniciar o jogo
function iniciarJogo() {
    if (!jogoIniciado) {  // Verifica se o jogo ainda não foi iniciado
        jogoIniciado = true;
        nave = new Nave(canvas.width / 2, canvas.height / 2); // Cria uma instância da nave no meio do canvas
        gerarAsteroidesNasBordas(); // Começa a gerar os asteroides
        loop(); // Inicia o loop do jogo
        iniciarButton.style.display = 'none'; // Esconde o botão de iniciar após o clique
    }
}

iniciarButton.addEventListener('click', iniciarJogo);


carregarRecorde();
ajustarCanvas();
