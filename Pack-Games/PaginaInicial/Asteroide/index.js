// Adiciona eventos de teclado
window.addEventListener('keydown', (e) => {
    if(e.keyCode === 27){
        document.querySelector('.botao-voltar').click();
    }
});