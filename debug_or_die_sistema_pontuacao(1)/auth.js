// DEBUG OR DIE - lógica de partidas e pontuação
const SUPABASE_URL = "https://nggaakknmpakjgpdesbj.supabase.co";
const SUPABASE_KEY = "sb_publishable_6Apvs1hf0fu-hGgKPFgmdw_Zp4QtkvM";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


//audio
const somTrilha = new Audio("trilha_misterio.mp3");
somTrilha.loop = true;
somTrilha.volume = 0.4;

const somClique = new Audio("click_click.mp3");
somClique.volume = 0.6;

function tocarClique() {
    somClique.currentTime = 0;
    somClique.play().catch(() => {});
}

function iniciarMusicaFundo() {
    somTrilha.play().catch(() => {});
}

//personagens
const masterCharactersDatabase = [
    {
        name: "Mathias",
        trait: "Backend Dev: Especialista em arquitetura e bancos de dados.",
        img: "imagens.png/Mathias.png"
    },
    {
        name: "Pablo",
        trait: "Bug Hunter: Caçador implacável de falhas de código.",
        img: "imagens.png/Pablo.png"
    },
    {
        name: "Pedro",
        trait: "Frontend Dev: Mestre em UI/UX e interfaces dinâmicas.",
        img: "imagens.png/Pedro.png"
    },
    {
        name: "Mayara",
        trait: "Data Sci: Analista de dados e lógica avançada.",
        img: "imagens.png/Mayara.png"
    },
    {
        name: "Daphnie",
        trait: "Fullstack: Domínio total de ponta a ponta no sistema.",
        img: "imagens.png/Daphnie.png"
    },
    {
        name: "Maria",
        trait: "Security Eng: Defensora contra invasões e exploits.",
        img: "imagens.png/Maria.png"
    },
    {
        name: "Marina",
        trait: "Mobile Dev: Criadora de aplicativos multiplataforma.",
        img: "imagens.png/Marina.png"
    }
];


/* =========================================
   BANCO DE PALAVRAS
========================================= */

const listaPalavras = [
    { dev: "REACT", impostor: "VUE" },
    { dev: "PYTHON", impostor: "RUBY" },
    { dev: "DOCKER", impostor: "KUBERNETES" },
    { dev: "MYSQL", impostor: "POSTGRES" },
    { dev: "GIT", impostor: "SVN" },
    { dev: "JAVASCRIPT", impostor: "TYPESCRIPT" },
    { dev: "HTML", impostor: "CSS" },
    { dev: "LINUX", impostor: "WINDOWS" },
    { dev: "SUPABASE", impostor: "FIREBASE" },
    { dev: "GITHUB", impostor: "GITLAB" }
];


/* =========================================
   VARIÁVEIS DO JOGO
========================================= */

let usuarioLogadoEmail = "";

let charactersDatabase = [];
let selectedPlayersList = [];

let currentPlayerIndex = 0;
let currentCharIndex = 0;
let totalPlayersCount = 4;

let totalRounds = 3;
let currentRound = 1;

let revealPlayerIndex = 0;
let estaMostrandoPalavra = false;

let parPalavrasAtual = null;
let indiceImpostorSorteado = -1;

let votos = [];
let votePlayerIndex = 0;
let selectedVoteIndex = null;

let guessSubmitted = false;


/* =========================================
   NAVEGAÇÃO
========================================= */

function irParaTela(id) {
    document.querySelectorAll(".screen").forEach(screen => {
        screen.classList.remove("active");
    });

    const tela = document.getElementById(id);

    if (tela) {
        tela.classList.add("active");
    }
}


/* =========================================
   LOGIN E HISTÓRICO
========================================= */

async function fazerLogin() {
    tocarClique();
    iniciarMusicaFundo();

    const email = document.getElementById("email").value.trim().toLowerCase();
    const password = document.getElementById("password").value;

    if (!email || !password) {
        alert("Preencha e-mail e senha.");
        return;
    }

    usuarioLogadoEmail = email;

    try {
        await carregarHistorico();
    } catch (error) {
        console.warn("Não foi possível carregar o histórico:", error);
    }

    irParaTela("screen-menu");
}

function deslogar() {
    usuarioLogadoEmail = "";

    document.getElementById("email").value = "";
    document.getElementById("password").value = "";

    irParaTela("screen-login");
}

async function carregarHistorico() {
    const tbody = document.getElementById("history-rows");

    tbody.innerHTML = "";

    const { data, error } = await supabaseClient
        .from("historico_partidas")
        .select("*")
        .eq("usuario_email", usuarioLogadoEmail)
        .order("id", { ascending: false })
        .limit(4);

    if (error) {
        throw error;
    }

    if (data && data.length > 0) {
        data.forEach(partida => {
            const tr = document.createElement("tr");

            const vencedor = document.createElement("td");
            const pontuacao = document.createElement("td");

            vencedor.textContent = partida.vencedor ?? "—";
            pontuacao.textContent = String(partida.pontuacao ?? "—");

            tr.appendChild(vencedor);
            tr.appendChild(pontuacao);

            tbody.appendChild(tr);
        });
    } else {
        tbody.innerHTML = `
            <tr>
                <td colspan="2">Nenhuma partida salva.</td>
            </tr>
        `;
    }
}


/* =========================================
   CONFIGURAÇÃO DOS JOGADORES
========================================= */

function iniciarConfiguracaoPersonagens() {
    totalPlayersCount = Number(
        document.getElementById("select-qtd-jogadores").value
    );

    totalRounds = Number(
        document.getElementById("select-qtd-rodadas").value
    );

    charactersDatabase = [...masterCharactersDatabase];

    selectedPlayersList = [];

    currentPlayerIndex = 0;
    currentCharIndex = 0;

    irParaTela("screen-character-select");

    updateFifaCard();
}

function updateFifaCard() {
    if (charactersDatabase.length === 0) {
        return;
    }

    currentCharIndex =
        (currentCharIndex + charactersDatabase.length) %
        charactersDatabase.length;

    const character = charactersDatabase[currentCharIndex];

    document.getElementById("selection-header").innerText =
        `ESCOLHA DO JOGADOR ${currentPlayerIndex + 1}`;

    document.getElementById("fifa-char-name").innerText =
        character.name.toUpperCase();

    document.getElementById("custom-player-name").value =
        character.name;

    document.getElementById("fifa-char-trait").innerText =
        character.trait;

    const img = document.getElementById("fifa-char-img");

    img.onerror = function () {
        console.warn("Imagem não encontrada:", character.img);
    };

    img.src = character.img;
}

function atualizarNomeAoDigitar(valor) {
    document.getElementById("fifa-char-name").innerText =
        (valor.trim() || "PERSONAGEM").toUpperCase();
}

function nextChar() {
    if (!charactersDatabase.length) return;

    currentCharIndex =
        (currentCharIndex + 1) % charactersDatabase.length;

    updateFifaCard();
}

function prevChar() {
    if (!charactersDatabase.length) return;

    currentCharIndex =
        (currentCharIndex - 1 + charactersDatabase.length) %
        charactersDatabase.length;

    updateFifaCard();
}

function confirmarEscolhaPersonagem() {
    if (!charactersDatabase.length) return;

    const character = charactersDatabase[currentCharIndex];

    const name =
        document.getElementById("custom-player-name").value.trim() ||
        character.name;

    const nomeDuplicado = selectedPlayersList.some(player =>
        player.name.toLowerCase() === name.toLowerCase()
    );

    if (nomeDuplicado) {
        alert("Use nomes diferentes para cada jogador.");
        return;
    }

    selectedPlayersList.push({
        name,
        trait: character.trait,
        img: character.img,
        score: 0
    });

    charactersDatabase.splice(currentCharIndex, 1);

    currentPlayerIndex++;

    if (currentPlayerIndex < totalPlayersCount) {
        currentCharIndex %= charactersDatabase.length;
        updateFifaCard();
    } else {
        iniciarNovaRodada(true);
    }
}


/* =========================================
   INÍCIO DE CADA RODADA
========================================= */

function iniciarNovaRodada(primeira = false) {
    if (primeira) {
        currentRound = 1;

        selectedPlayersList.forEach(player => {
            player.score = 0;
        });
    }

    parPalavrasAtual =
        listaPalavras[Math.floor(Math.random() * listaPalavras.length)];

    indiceImpostorSorteado =
        Math.floor(Math.random() * selectedPlayersList.length);

    selectedPlayersList.forEach((player, index) => {
        player.isImpostor = index === indiceImpostorSorteado;

        player.word = player.isImpostor
            ? parPalavrasAtual.impostor
            : parPalavrasAtual.dev;
    });

    revealPlayerIndex = 0;
    estaMostrandoPalavra = false;

    votos = [];
    votePlayerIndex = 0;
    selectedVoteIndex = null;

    guessSubmitted = false;

    prepararRevelacaoJogador();

    irParaTela("screen-reveal");
}


/* =========================================
   REVELAÇÃO PRIVADA DAS PALAVRAS
========================================= */

function prepararRevelacaoJogador() {
    const player = selectedPlayersList[revealPlayerIndex];

    document.getElementById("reveal-player-title").innerText =
        `VEZ DE: ${player.name.toUpperCase()}`;

    document.getElementById("secret-word-box").innerText =
        "[ ÁREA SEGURA ]";

    document.getElementById("secret-word-box").style.color = "#ffffff";

    document.getElementById("btn-action-reveal").innerText =
        "VER PALAVRA";

    estaMostrandoPalavra = false;
}

function gerenciarCliqueRevelar() {
    const player = selectedPlayersList[revealPlayerIndex];

    const box = document.getElementById("secret-word-box");
    const button = document.getElementById("btn-action-reveal");

    if (!estaMostrandoPalavra) {
        box.innerText = player.word;

        box.style.color = player.isImpostor
            ? "#ff007f"
            : "#00ffcc";

        button.innerText = "OCULTAR E PASSAR";

        estaMostrandoPalavra = true;

    } else {
        revealPlayerIndex++;

        if (revealPlayerIndex < selectedPlayersList.length) {
            prepararRevelacaoJogador();
        } else {
            dispararContagemInicial();
        }
    }
}


/* =========================================
   CONTAGEM REGRESSIVA
========================================= */

function dispararContagemInicial() {
    document.getElementById("round-indicator").innerText =
        `RODADA ${currentRound} DE ${totalRounds}`;

    document.getElementById("chosen-starter").innerText =
        `RODADA ${currentRound} — BOA SORTE!`;

    const overlay = document.getElementById("countdown-overlay");
    const timer = document.getElementById("timer-number");

    overlay.classList.remove("hidden");

    let number = 3;

    timer.innerText = number;

    const interval = setInterval(() => {
        number--;

        timer.innerText = number > 0 ? number : "JÁ!";

        if (number <= 0) {
            clearInterval(interval);

            setTimeout(() => {
                overlay.classList.add("hidden");
                irParaTela("screen-game");
            }, 500);
        }
    }, 1000);
}


/* =========================================
   SISTEMA DE VOTAÇÃO COM FOTOS
========================================= */

function abrirVotacao() {
    votos = [];
    votePlayerIndex = 0;
    selectedVoteIndex = null;

    renderizarVotoAtual();

    irParaTela("screen-voting");
}

function renderizarVotoAtual() {
    const player = selectedPlayersList[votePlayerIndex];

    const content = document.getElementById("voting-content");
    const button = document.getElementById("btn-confirm-vote");

    content.innerHTML = "";

    button.disabled = true;

    selectedVoteIndex = null;

    const title = document.createElement("p");

    title.className = "voting-player-title";

    title.textContent =
        `${player.name.toUpperCase()}, QUEM É O IMPOSTOR?`;

    content.appendChild(title);

    const cards = document.createElement("div");

    cards.className = "voting-cards";

    selectedPlayersList.forEach((target, index) => {
        if (index === votePlayerIndex) return;

        const card = document.createElement("button");

        card.type = "button";
        card.className = "vote-card";

        const img = document.createElement("img");

        img.src = target.img;
        img.alt = target.name;

        img.onerror = function () {
            this.style.display = "none";
        };

        const name = document.createElement("span");

        name.textContent = target.name.toUpperCase();

        card.appendChild(img);
        card.appendChild(name);

        card.addEventListener("click", () => {
            document.querySelectorAll(".vote-card").forEach(item => {
                item.classList.remove("selected");
            });

            card.classList.add("selected");

            selectedVoteIndex = index;

            button.disabled = false;
        });

        cards.appendChild(card);
    });

    content.appendChild(cards);

    document.getElementById("vote-progress").innerText =
        `VOTO ${votePlayerIndex + 1} DE ${selectedPlayersList.length} | VOTOS REGISTRADOS: ${votos.length}`;
}

function registrarVotoAtual() {
    if (selectedVoteIndex === null) {
        alert("Selecione um personagem para votar.");
        return;
    }

    const button = document.getElementById("btn-confirm-vote");

    button.disabled = true;

    votos.push({
        voter: votePlayerIndex,
        target: selectedVoteIndex
    });

    votePlayerIndex++;

    if (votePlayerIndex < selectedPlayersList.length) {
        renderizarVotoAtual();
    } else {
        calcularResultadoVotacao();
    }
}


/* =========================================
   RESULTADO DA VOTAÇÃO E PONTUAÇÃO
========================================= */

function calcularResultadoVotacao() {
    const counts = selectedPlayersList.map((player, index) => {
        return votos.filter(vote => vote.target === index).length;
    });

    const maxVotes = Math.max(...counts);

    const leaders = counts
        .map((count, index) => count === maxVotes ? index : -1)
        .filter(index => index >= 0);

    const needed = Math.floor(selectedPlayersList.length / 2) + 1;

    const majority =
        leaders.length === 1 &&
        leaders[0] === indiceImpostorSorteado &&
        maxVotes >= needed;

    const pointLines = [];

    const impostor = selectedPlayersList[indiceImpostorSorteado];

    if (majority) {
        votos
            .filter(vote => vote.target === indiceImpostorSorteado)
            .forEach(vote => {
                selectedPlayersList[vote.voter].score += 4;

                pointLines.push(
                    `${selectedPlayersList[vote.voter].name}: +4 pontos`
                );
            });

    } else {
        impostor.score += 5;

        pointLines.push(
            `${impostor.name} (Impostor): +5 pontos`
        );
    }

    /*
       IMPORTANTE:
       A palavra dos desenvolvedores NÃO é mostrada aqui.
       Ela só será exibida depois do envio do palpite.
    */

    document.getElementById("round-result-text").innerHTML = `
        <p>IMPOSTOR IDENTIFICADO:</p>
        <h2>${escapeHtml(impostor.name)}</h2>

        <p>MAIOR NÚMERO DE VOTOS: ${maxVotes}</p>

        <p class="${majority ? "text-success" : "text-danger"}">
            ${
                majority
                    ? "A MAIORIA DESCOBRIU O IMPOSTOR!"
                    : "A MAIORIA NÃO IDENTIFICOU O IMPOSTOR."
            }
        </p>
    `;

    document.getElementById("round-points").innerHTML = `
        <p class="points-title">PONTOS DA VOTAÇÃO</p>
        ${pointLines.map(line => `<p>${escapeHtml(line)}</p>`).join("")}
    `;

    document.getElementById("impostor-guess").value = "";

    document.getElementById("guess-feedback").innerText = "";

    document.getElementById("word-reveal").classList.add("hidden");

    document.getElementById("revealed-dev-word").innerText = "";

    document.getElementById("btn-guess").disabled = false;

    document.getElementById("btn-continue-round").disabled = true;

    guessSubmitted = false;

    irParaTela("screen-result");
}


/* =========================================
   PALPITE DO IMPOSTOR
========================================= */

function enviarPalpiteImpostor() {
    if (guessSubmitted) return;

    const input = document.getElementById("impostor-guess");

    const guess = input.value.trim().toLocaleUpperCase("pt-BR");

    if (!guess) {
        alert("Digite seu palpite.");
        return;
    }

    guessSubmitted = true;

    const impostor = selectedPlayersList[indiceImpostorSorteado];

    const limparTexto = texto => {
        return texto
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toUpperCase()
            .trim();
    };

    const acertou =
        limparTexto(guess) === limparTexto(parPalavrasAtual.dev);

    const feedback = document.getElementById("guess-feedback");

    if (acertou) {
        impostor.score += 3;

        feedback.innerText = "ACERTOU! +3 PONTOS EXTRAS.";

        feedback.className = "text-success";

        document.getElementById("round-points").innerHTML += `
            <p>${escapeHtml(impostor.name)}: +3 pontos pelo palpite correto.</p>
        `;

    } else {
        feedback.innerText = "NÃO FOI DESSA VEZ!";

        feedback.className = "text-danger";
    }

    /*
       A palavra é revelada somente agora,
       depois que o impostor enviou o palpite.
    */

    document.getElementById("revealed-dev-word").innerText =
        parPalavrasAtual.dev;

    document.getElementById("word-reveal").classList.remove("hidden");

    document.getElementById("btn-guess").disabled = true;

    document.getElementById("btn-continue-round").disabled = false;
}


/* =========================================
   PLACAR
========================================= */

function continuarAposRodada() {
    if (!guessSubmitted) return;

    renderizarPlacar(false);
}

function renderizarPlacar(final = false) {
    const sorted = [...selectedPlayersList].sort(
        (a, b) => b.score - a.score
    );

    document.getElementById("scoreboard-title").innerText =
        final ? "RESULTADO FINAL" : "PLACAR DA PARTIDA";

    document.getElementById("scoreboard-subtitle").innerText =
        final
            ? `CAMPEONATO ENCERRADO — ${totalRounds} RODADAS`
            : `RODADA ${currentRound} DE ${totalRounds}`;

    const content = document.getElementById("scoreboard-content");

    content.innerHTML = sorted.map((player, index) => `
        <div class="score-line ${index === 0 ? "winner" : ""}">
            <span>${index + 1}º ${escapeHtml(player.name)}</span>
            <strong>${player.score} PTS</strong>
        </div>
    `).join("");

    const lastRound = currentRound >= totalRounds;

    document.getElementById("btn-next-round").style.display =
        !final && !lastRound ? "block" : "none";

    document.getElementById("btn-finish-match").style.display =
        final || lastRound ? "block" : "none";

    irParaTela("screen-scoreboard");
}

function iniciarProximaRodada() {
    currentRound++;

    iniciarNovaRodada(false);
}


/* =========================================
   ENCERRAMENTO DO CAMPEONATO
========================================= */

async function encerrarCampeonato() {
    const highestScore = Math.max(
        ...selectedPlayersList.map(player => player.score)
    );

    const winner = selectedPlayersList
        .filter(player => player.score === highestScore)
        .sort((a, b) => a.name.localeCompare(b.name))[0];

    await salvarHistorico(winner);

    alert(
        `Vencedor: ${winner.name} — ${winner.score} pontos!`
    );

    irParaTela("screen-menu");
}

async function salvarHistorico(winner) {
    try {
        const { error } = await supabaseClient
            .from("historico_partidas")
            .insert([{
                vencedor: winner.name,
                pontuacao: winner.score,
                usuario_email: usuarioLogadoEmail
            }]);

        if (error) {
            throw error;
        }

        await carregarHistorico();

    } catch (error) {
        console.error("Erro ao salvar histórico:", error);

        alert(
            "Não foi possível salvar o histórico. Verifique se a tabela possui as colunas vencedor, pontuacao e usuario_email."
        );
    }
}


/* =========================================
   OUTRAS FUNÇÕES
========================================= */

function confirmarSaidaPartida() {
    if (
        confirm("Deseja sair? O campeonato atual será perdido.")
    ) {
        irParaTela("screen-menu");
    }
}

function toggleLogs() {
    const container = document.getElementById("logs-container");

    const arrow = document.getElementById("log-arrow");

    container.classList.toggle("show");

    arrow.innerText =
        container.classList.contains("show") ? "▲" : "▼";
}

function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}


/* =========================================
   EFEITO MATRIX
========================================= */

document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("matrix-canvas");

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*<>/";

    const fontSize = 14;

    let width;
    let height;
    let drops = [];

    function resetCanvas() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;

        drops = Array(
            Math.floor(width / fontSize)
        ).fill(1);
    }

    function drawMatrix() {
        ctx.fillStyle = "rgba(13, 17, 23, 0.08)";
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = "#00ffcc";
        ctx.font = `${fontSize}px monospace`;

        drops.forEach((drop, index) => {
            const character = characters.charAt(
                Math.floor(Math.random() * characters.length)
            );

            ctx.fillText(
                character,
                index * fontSize,
                drop * fontSize
            );

            if (
                drop * fontSize > height &&
                Math.random() > 0.975
            ) {
                drops[index] = 0;
            } else {
                drops[index]++;
            }
        });
    }

    resetCanvas();

    window.addEventListener("resize", resetCanvas);

    setInterval(drawMatrix, 90);
});


/* =========================================
   SOM DE CLIQUE
========================================= */

document.addEventListener("click", event => {
    if (event.target.closest("button")) {
        tocarClique();
    }
});
