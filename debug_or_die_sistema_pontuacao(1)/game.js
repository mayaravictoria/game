let quantidadeDeJogadores = 5; // Simulação de jogadores conectados na sala (mude de 3 a 7 para testar)
let meuPapel = ""; // "DEVELOPER" ou "IMPOSTOR"
let palavraDaRodada = "COMPILER";


function startPhaserGame() {
    // Validação estrita do escopo de 3 a 7 jogadores
    if (quantidadeDeJogadores < 3 || quantidadeDeJogadores > 7) {
        alert("Erro de Compilação: Apenas salas de 3 a 7 jogadores são permitidas!");
        return;
    }


    // Configuração gráfica do Phaser 3 focada em 2D Pixel Art
    const config = {
        type: Phaser.AUTO,
        width: 800,
        height: 600,
        parent: 'game-container',
        pixelArt: true, // Mantém os pixels dos personagens totalmente nítidos e sem desfoque
        physics: {
            default: 'arcade',
            arcade: { gravity: { y: 0 } } // Jogo visto de cima (estilo Among Us), sem gravidade
        },
        scene: { preload: preload, create: create, update: update }
    };


    const game = new Phaser.Game(config);
}


function preload() {
    // Aqui você carregará as imagens dos seus personagens em Pixel Art
    // Exemplo: this.load.spritesheet('dev_player', 'assets/dev_pixel.png', { frameWidth: 32, frameHeight: 32 });
}


function create() {
    // Lógica interna: Sorteia se você é o Bug ou Dev
    let sorteio = Math.random();
   
    if(sorteio > 0.7) {
        meuPapel = "IMPOSTOR";
        this.add.text(100, 100, "VOCÊ É O BUG!\nSabote o sistema sem ser descoberto.", { font: "24px Courier", fill: "#ff3366" });
    } else {
        meuPapel = "DEVELOPER";
        this.add.text(100, 100, `VOCÊ É DEV.\nPalavra Secreta: ${palavraDaRodada}`, { font: "24px Courier", fill: "#00ff66" });
    }


    this.add.text(100, 50, `Status da Sala: ${quantidadeDeJogadores} Devs Conectados.`, { font: "16px Courier", fill: "#ffffff" });
}


function update() {
    // Aqui no futuro ficará o código para mover seu personagem 2D usando o teclado ou o toque no celular
}
