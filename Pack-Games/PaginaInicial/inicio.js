const clicarAudio = new Audio ('clique.mp3');

document.addEventListener('DOMContentLoaded', function() {
    const hoverSound = new Audio('select.mp3');

    document.querySelectorAll('a').forEach(link => {
        link.addEventListener('mouseover', () => {
            hoverSound.currentTime = 0; // Reinicia o som
            hoverSound.play();
        });
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const pacmanLink = document.getElementById('pacman-link');
    const pacmanAnimacao = document.querySelector('.pacman-animacao');
    const pacmanAnimacao2 = document.querySelector('.pacman-animacao2');

    if (pacmanLink && pacmanAnimacao && pacmanAnimacao2) {
        pacmanLink.addEventListener('click', function(event) {
            event.preventDefault();
            clicarAudio.play();

            pacmanAnimacao.style.left = '200vw'; // Move pacmanAnimacao para fora da tela

            setTimeout(() => {
                pacmanAnimacao.style.display = 'none';
                pacmanAnimacao2.style.display = 'flex';
                pacmanAnimacao2.style.rigth = '100vw';
            }, 2000); // Tempo para o primeiro Pac-Man completar a animação

            // Redireciona após um tempo total
            setTimeout(() => {
                window.location.href = pacmanLink.href;
            }, 4000);
        });
    } else {
        console.error('Elementos do Pac-Man não encontrados.');
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const asteroidsLink = document.getElementById('asteroids-link');
    const asteroidImages = ['as1.png', 'as2.png', 'as3.png'];
    const numAsteroids = 2000;

    function criarAsteroide() {
        const asteroid = document.createElement('div');
        asteroid.className = 'asteroid';
        asteroid.style.backgroundImage = `url('ImagensInicio/${asteroidImages[Math.floor(Math.random() * asteroidImages.length)]}')`;

        asteroid.style.left = '-50px'; 
        const startY = Math.random() * (window.innerHeight - 50);
        asteroid.style.top = `${startY}px`;

        document.body.appendChild(asteroid);

        const velocidadeAtravessar = Math.random() * 10 + 10;
        const velocidadeSubir = Math.random() * 0.5 + 0.5;
        const amplitude = Math.random() * (window.innerHeight * 0.4) + 50;
        let offset = 0; 

        function moverAsteroide() {
            let currentLeft = parseFloat(asteroid.style.left);
            asteroid.style.left = `${currentLeft + velocidadeAtravessar}px`;

            offset += velocidadeSubir;
            let currentTop = startY + Math.sin(offset / 20) * amplitude;
            asteroid.style.top = `${currentTop}px`;

            if (currentLeft > window.innerWidth + 50) {
                asteroid.remove();
            } else {
                requestAnimationFrame(moverAsteroide);
            }
        }

        moverAsteroide(); 
    }

    function iniciarAnimacaoAsteroides() {
        for (let i = 0; i < numAsteroids; i++) {
            setTimeout(criarAsteroide, i * 50); 
        }
    }

    if (asteroidsLink) {
        asteroidsLink.addEventListener('click', function(event) {
            event.preventDefault();
            iniciarAnimacaoAsteroides();
            clicarAudio.play();

            setTimeout(() => {
                window.location.href = asteroidsLink.href;
            }, 4000);
        });
    } else {
        console.error('Elemento dos asteroides não encontrado.');
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const tetrisLink = document.getElementById('tetris-link');
    const quadroTetris = document.getElementById('quadro-tetris');
    let quadrados = []; // Para armazenar os quadrados criados
    let logo; // Para armazenar a referência da logo

    if (tetrisLink && quadroTetris) {
        tetrisLink.addEventListener('click', function(event) {
            event.preventDefault();
            clicarAudio.play();

            const larguraQuadrado = 20;  
            const alturaQuadrado = 20;  
            const numeroPorLinha = Math.floor(window.innerWidth / larguraQuadrado);
            const numeroPorColuna = Math.floor(window.innerHeight / alturaQuadrado) + 1;
            const posicoes = Array(numeroPorLinha).fill(0); 

            const tempoInicial = Date.now(); // Marca o tempo inicial
            const tempoLimite = 3200; // Tempo limite em milissegundos (3,2 segundos)

            const criarQuadrados = () => {
                for (let i = 0; i < 15; i++) {
                    const coluna = Math.floor(Math.random() * numeroPorLinha); 
                    // Verifica se a coluna já atingiu o número máximo de quadrados
                    if (posicoes[coluna] < numeroPorColuna) {
                        const quadrado = document.createElement('div');
                        quadrado.style.position = 'absolute';
                        quadrado.style.width = `${larguraQuadrado}px`;
                        quadrado.style.height = `${alturaQuadrado}px`;
                        const corOriginal = `hsl(${Math.random() * 360}, 70%, 30%)`; // Saturação e luminosidade ajustadas
                        quadrado.style.backgroundColor = corOriginal; 
                        quadrado.style.left = `${coluna * larguraQuadrado}px`; 
                        quadrado.style.top = `-20px`;
            
                        quadroTetris.appendChild(quadrado); 
                        quadrados.push({ element: quadrado, cor: corOriginal }); // Adiciona o quadrado à lista
            
                        let alturaAtual = -20; 
                        const cair = setInterval(() => {
                            if (alturaAtual < window.innerHeight - alturaQuadrado * (posicoes[coluna] + 1)) {
                                alturaAtual += (window.innerHeight / 50);
                                quadrado.style.top = `${alturaAtual}px`; 
                            } else {
                                clearInterval(cair); 
                                posicoes[coluna]++;
                                
                                if (posicoes[coluna] > 0) {
                                    const alturaAcima = window.innerHeight - (posicoes[coluna] * alturaQuadrado);
                                    quadrado.style.top = `${alturaAcima}px`;
                                }
                            }
                        });
                    }
                }
            };            

            const gerarQuadrados = () => {
                const tempoDecorrido = Date.now() - tempoInicial; 
                if (tempoDecorrido < tempoLimite) {
                    criarQuadrados();
                    setTimeout(gerarQuadrados);
                } else {
                    // Inicia o efeito de piscar
                    piscarQuadrados();
                }
            };

            const piscarQuadrados = () => {
                const duracao = 800; // Duração total do piscar em milissegundos
                const intervaloPiscar = 100; // Intervalo entre as mudanças de cor
                const numPiscar = duracao / intervaloPiscar; // Número de piscadas
                let contador = 0;

                const piscar = setInterval(() => {
                    quadrados.forEach(q => {
                        if (contador % 2 === 0) {
                            q.element.style.backgroundColor = 'black'; // Pisca para preto
                        } else {
                            q.element.style.backgroundColor = q.cor; // Retorna à cor original
                        }
                    });

                    // Faz a logo piscar também, mas ela só aparece após um determinado tempo
                    if (contador % 2 === 0) {
                        if (logo) logo.style.opacity = '0'; // Pisca para transparente
                    } else {
                        if (logo) logo.style.opacity = '1'; // Retorna à opacidade original
                    }

                    contador++;
                    if (contador >= numPiscar) {
                        clearInterval(piscar); // Para o piscar após o número definido de piscadas
                        if (logo) logo.remove(); // Remove a logo após o piscar
                    }
                }, intervaloPiscar);
            };

            const mostrarLogo = () => {
                logo = document.createElement('img'); // Cria o elemento da logo
                logo.src = 'ImagensInicio/tetris-logo.png'; // Define a fonte da logo
                logo.style.position = 'absolute';
                logo.style.width = '25%';
                logo.style.left = '50%'; 
                logo.style.top = '50%'; 
                logo.style.transform = 'translate(-50%, -50%)'; // Centraliza a logo
                logo.style.zIndex = '10'; // Coloca a logo acima dos quadrados
                logo.style.opacity = '1'; // Define a opacidade inicial

                quadroTetris.appendChild(logo); // Adiciona a logo ao quadro
            };

            gerarQuadrados();

            // Define um tempo para mostrar a logo após o piscar começar
            setTimeout(() => {
                mostrarLogo(); // Mostra a logo após 1 segundo (1000 milissegundos)
            }, 2000); // Ajuste o tempo aqui conforme necessário

            setTimeout(() => {
                window.location.href = tetrisLink.href; 
            }, 4000); 
        });
    } else {
        console.error('Elemento do Tetris ou quadro não encontrado.');
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const pongLink = document.getElementById('pong-link');
    const pongGif = document.querySelector('.pong-gif');
    const capaPong = pongLink.querySelector('.capa-pong');

    if (pongLink && pongGif) {
        pongLink.addEventListener('click', function(event) {
            event.preventDefault(); // Previne o redirecionamento imediato

            // Esconde a capa e mostra o GIF
            capaPong.style.display = 'none'; // Esconde a imagem da capa
            pongGif.style.display = 'block'; // Mostra o GIF

            // Reinicia o GIF
            pongGif.src = 'ImagensInicio/pong.gif'; // Reinicia o GIF
            
            pongGif.onload = function() {
                setTimeout(() => {
                    // Após um pequeno tempo, redireciona
                    window.location.href = pongLink.href; 
                }, 4000); // 4 segundos para visualizar o GIF
            };
        });
    } else {
        console.error('Elemento do Pong não encontrado.');
    }
});

