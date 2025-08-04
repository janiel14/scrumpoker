/* filepath: /home/zotac-v2/projects/scrumpoker/script.js */
// Variáveis globais
const socket = io();
let currentUser = null;
let currentRoom = null;
let selectedCard = null;

const CARDS = ['0', '1', '2', '3', '5', '8', '13', '21', '34', '55', '89', '?', '☕'];

// Elementos DOM
const joinSection = document.getElementById('join-section');
const pokerSection = document.getElementById('poker-section');
const roomNameEl = document.getElementById('room-name');
const userNameEl = document.getElementById('user-name');
const connectionStatus = document.getElementById('connection-status');
const storyInput = document.getElementById('story-input');
const currentStoryEl = document.getElementById('current-story');
const votingStatus = document.getElementById('voting-status');
const statusText = document.getElementById('status-text');
const cardsSection = document.getElementById('cards-section');
const cardsContainer = document.getElementById('cards-container');
const resultsSection = document.getElementById('results-section');
const voteResults = document.getElementById('vote-results');
const voteStats = document.getElementById('vote-stats');
const creatorControls = document.getElementById('creator-controls');
const revealBtn = document.getElementById('reveal-btn');
const usersContainer = document.getElementById('users-container');
const userCount = document.getElementById('user-count');
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const leaveBtn = document.getElementById('leave-btn');
const shareBtn = document.getElementById('share-btn');

// Eventos de conexão
socket.on('connect', () => {
    connectionStatus.textContent = 'Conectado';
    connectionStatus.style.color = '#27ae60';

    const roomId = localStorage.getItem('scrumPokerRoomId');
    const userName = localStorage.getItem('scrumPokerUserName');
    const isSpectator = localStorage.getItem('scrumPokerIsSpectator') === 'true';

    if (roomId && userName) {
        document.getElementById('room-id').value = roomId;
        document.getElementById('user-name-input').value = userName;
        document.getElementById('spectator-mode').checked = isSpectator;
        joinRoom();

        socket.once('roomJoined', () => {
            socket.emit('getRoomState');
        });
    }
});

socket.on('disconnect', () => {
    connectionStatus.textContent = 'Desconectado';
    connectionStatus.style.color = '#e74c3c';
    hideLeaveButton();
    hideRoomInfo();
});

// Entrar na sala
function joinRoom() {
    const roomId = document.getElementById('room-id').value.trim();
    const userName = document.getElementById('user-name-input').value.trim();
    const isSpectator = document.getElementById('spectator-mode').checked;

    if (!roomId || !userName) {
        alert('Por favor, preencha todos os campos!');
        return;
    }
    
    if (roomId.length > 20) {
        alert('ID da sala deve ter no máximo 20 caracteres!');
        return;
    }
    
    if (userName.length > 30) {
        alert('Nome deve ter no máximo 30 caracteres!');
        return;
    }

    localStorage.setItem('scrumPokerRoomId', roomId);
    localStorage.setItem('scrumPokerUserName', userName);
    localStorage.setItem('scrumPokerIsSpectator', isSpectator);

    socket.emit('joinRoom', {
        roomId: roomId,
        userName: userName,
        isSpectator: isSpectator
    });
}

// Recebe o estado atual da sala e atualiza a interface
socket.on('roomState', (data) => {
    currentRoom = data.room;
    currentUser = data.user;

    joinSection.classList.add('hidden');
    pokerSection.classList.remove('hidden');
    
    roomNameEl.textContent = `Sala: ${currentRoom.id}`;
    userNameEl.textContent = `Usuário: ${currentUser.name}${currentUser.isSpectator ? ' (Espectador)' : ''}${currentUser.isCreator ? ' (Criador)' : ''}`;
    currentStoryEl.textContent = currentRoom.currentStory || '';

    if (currentUser.isCreator) {
        creatorControls.classList.remove('hidden');
    } else {
        creatorControls.classList.add('hidden');
    }

    updateUsersList(currentRoom.users);

    if (currentRoom.votingActive) {
        showVotingInterface();
        if (!currentUser.isSpectator) {
            createCards(CARDS);

            if (currentUser.vote) {
                const cardEls = document.querySelectorAll('.card');
                cardEls.forEach(cardEl => {
                    if (cardEl.textContent === currentUser.vote) {
                        cardEl.classList.add('selected');
                        selectedCard = currentUser.vote;
                        cardEls.forEach(c => c.classList.add('disabled'));
                        statusText.textContent = `Você votou: ${currentUser.vote}. Aguardando outros jogadores...`;
                    }
                });
            }
        }
        if (currentRoom.votesRevealed) {
            showResults(currentRoom.votes);
            cardsSection.classList.add('hidden');
            statusText.textContent = 'Votos revelados!';
        }
    } else {
        resetInterface();
    }

    showLeaveButton();
    updateStoryInputVisibility();
    showRoomInfo();
});

// Sala unida com sucesso
socket.on('roomJoined', (data) => {
    currentRoom = data.room;
    currentUser = data.user;

    joinSection.classList.add('hidden');
    pokerSection.classList.remove('hidden');
    
    roomNameEl.textContent = `Sala: ${currentRoom.id}`;
    userNameEl.textContent = `Usuário: ${currentUser.name}${currentUser.isSpectator ? ' (Espectador)' : ''}${currentUser.isCreator ? ' (Criador)' : ''}`;
    currentStoryEl.textContent = currentRoom.currentStory || '';

    if (currentUser.isCreator) {
        creatorControls.classList.remove('hidden');
    } else {
        creatorControls.classList.add('hidden');
    }

    updateUsersList(currentRoom.users);

    if (currentRoom.votingActive) {
        showVotingInterface();
        if (currentRoom.votesRevealed) {
            showResults(currentRoom.votes);
        }
    }

    showLeaveButton();
    updateStoryInputVisibility();
    showRoomInfo();
});

// Eventos de usuários
socket.on('userJoined', (user) => {
    addChatMessage(`${user.name} entrou na sala`, 'system');
});

socket.on('userLeft', (data) => {
    addChatMessage(`${data.userName} saiu da sala`, 'system');
});

socket.on('usersUpdated', (users) => {
    updateUsersList(users);

    const me = users.find(u => u.id === currentUser.id);
    if (me) {
        currentUser.isCreator = me.isCreator;
        if (currentUser.isCreator) {
            creatorControls.classList.remove('hidden');
        } else {
            creatorControls.classList.add('hidden');
        }
    }

    updateStoryInputVisibility();
});

// Eventos de votação
socket.on('votingStarted', (data) => {
    currentStoryEl.textContent = data.story;
    storyInput.value = '';
    selectedCard = null;
    
    showVotingInterface();
    createCards(data.cards);
    
    statusText.textContent = currentUser.isSpectator ? 
        'Votação em andamento (você é espectador)' : 
        'Selecione sua carta para votar!';
    
    resultsSection.classList.add('hidden');
    
    if (currentUser.isCreator) {
        revealBtn.disabled = true;
    }
});

socket.on('userVoted', (data) => {
    const userEl = document.querySelector(`[data-user-id="${data.userId}"]`);
    if (userEl) {
        const indicator = userEl.querySelector('.vote-indicator');
        indicator.classList.add('voted');
    }
});

socket.on('allUsersVoted', () => {
    if (currentUser.isCreator) {
        revealBtn.disabled = false;
        statusText.textContent = 'Todos votaram! Você pode revelar os votos.';
    } else {
        statusText.textContent = 'Todos votaram! Aguardando revelação...';
    }
});

socket.on('votesRevealed', (data) => {
    showResults(data.votes, data.stats);
    cardsSection.classList.add('hidden');
    statusText.textContent = 'Votos revelados!';
});

socket.on('votingReset', () => {
    resetInterface();
    statusText.textContent = 'Aguardando próxima votação...';
});

// Chat
socket.on('newMessage', (message) => {
    addChatMessage(`${message.userName}: ${message.text}`, 'user', message.timestamp);
});

// Erros
socket.on('error', (data) => {
    alert(`Erro: ${data.message}`);
    console.error('Server error:', data.message);
});

socket.on('leftRoom', () => {
    joinSection.classList.remove('hidden');
    pokerSection.classList.add('hidden');
    currentRoom = null;
    currentUser = null;
    hideLeaveButton();
    hideRoomInfo();
    addChatMessage('Você saiu da sala', 'system');
});

// Funções da interface
function showVotingInterface() {
    votingStatus.classList.remove('hidden');
    if (!currentUser.isSpectator) {
        cardsSection.classList.remove('hidden');
    }
}

function createCards(cards) {
    cardsContainer.innerHTML = '';
    cards.forEach(card => {
        const cardEl = document.createElement('div');
        cardEl.className = 'card';
        cardEl.textContent = card;
        cardEl.onclick = () => selectCard(card, cardEl);
        cardsContainer.appendChild(cardEl);
    });
}

function selectCard(card, cardEl) {
    if (currentUser.isSpectator) return;
    
    const prevSelected = document.querySelector('.card.selected');
    if (prevSelected) prevSelected.classList.remove('selected');
    
    cardEl.classList.add('selected');
    selectedCard = card;
    
    socket.emit('submitVote', { vote: card });
    
    document.querySelectorAll('.card').forEach(c => c.classList.add('disabled'));
    
    statusText.textContent = `Você votou: ${card}. Aguardando outros jogadores...`;
}

function showResults(votes, stats) {
    resultsSection.classList.remove('hidden');
    
    voteResults.innerHTML = '';
    Object.values(votes).forEach(vote => {
        const resultEl = document.createElement('div');
        resultEl.className = 'vote-result';
        resultEl.innerHTML = `
            <span>${vote.userName}</span>
            <strong>${vote.vote}</strong>
        `;
        voteResults.appendChild(resultEl);
    });
    
    if (stats) {
        voteStats.classList.remove('hidden');
        voteStats.innerHTML = `
            <h4>Estatísticas:</h4>
            <p><strong>Média:</strong> ${stats.avg}</p>
            <p><strong>Mín/Máx:</strong> ${stats.min} / ${stats.max}</p>
            <p><strong>Votos válidos:</strong> ${stats.count}</p>
        `;
    }
}

function updateUsersList(users) {
    usersContainer.innerHTML = '';
    userCount.textContent = users.length;
    
    users.forEach(user => {
        const userEl = document.createElement('div');
        userEl.className = `user ${user.isCreator ? 'creator' : ''} ${user.isSpectator ? 'spectator' : ''}`;
        userEl.setAttribute('data-user-id', user.id);
        userEl.innerHTML = `
            <span>
                ${user.name}
                ${user.isCreator ? ' 👑' : ''}
                ${user.isSpectator ? ' 👁️' : ''}
            </span>
            <div class="vote-indicator"></div>
        `;
        usersContainer.appendChild(userEl);
    });
}

function resetInterface() {
    cardsSection.classList.add('hidden');
    resultsSection.classList.add('hidden');
    voteStats.classList.add('hidden');
    currentStoryEl.textContent = '';
    selectedCard = null;
    
    document.querySelectorAll('.vote-indicator').forEach(indicator => {
        indicator.classList.remove('voted');
    });
    
    if (currentUser.isCreator) {
        revealBtn.disabled = true;
    }
}

function addChatMessage(text, type = 'user', timestamp = Date.now()) {
    const messageEl = document.createElement('div');
    messageEl.className = 'message';
    
    const time = new Date(timestamp).toLocaleTimeString();
    messageEl.innerHTML = `
        ${text}
        <span class="timestamp">${time}</span>
    `;
    
    chatMessages.appendChild(messageEl);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Funções de controle (criador)
function startVoting() {
    const story = storyInput.value.trim();
    if (!story) {
        alert('Por favor, digite uma história/tarefa!');
        return;
    }
    
    socket.emit('startVoting', { story: story });
}

function revealVotes() {
    socket.emit('revealVotes');
}

function resetVoting() {
    socket.emit('resetVoting');
}

// Controles de botões e interface
function showLeaveButton() {
    leaveBtn.classList.remove('hidden');
    showShareButton();
}

function hideLeaveButton() {
    leaveBtn.classList.add('hidden');
    hideShareButton();
}

function showShareButton() {
    shareBtn.classList.remove('hidden');
}

function hideShareButton() {
    shareBtn.classList.add('hidden');
}

function showRoomInfo() {
    roomNameEl.classList.remove('hidden');
    userNameEl.classList.remove('hidden');
}

function hideRoomInfo() {
    roomNameEl.classList.add('hidden');
    userNameEl.classList.add('hidden');
}

function shareRoom() {
    if (!currentRoom?.id) return;
    const url = `${window.location.origin}?room=${encodeURIComponent(currentRoom.id)}`;
    navigator.clipboard.writeText(url)
        .then(() => {
            alert('Link da sala copiado para área de transferência!');
        })
        .catch(() => {
            prompt('Copie o link da sala:', url);
        });
}

function leaveRoom() {
    socket.emit('leaveRoom');
    joinSection.classList.remove('hidden');
    pokerSection.classList.add('hidden');
    currentRoom = null;
    currentUser = null;
    localStorage.removeItem('scrumPokerRoomId');
    localStorage.removeItem('scrumPokerUserName');
    localStorage.removeItem('scrumPokerIsSpectator');
    hideLeaveButton();
    hideRoomInfo();
}

function sendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;
    
    if (text.length > 200) {
        alert('Mensagem deve ter no máximo 200 caracteres!');
        return;
    }
    
    socket.emit('sendMessage', { text: text });
    chatInput.value = '';
}

function updateStoryInputVisibility() {
    if (currentUser?.isCreator) {
        storyInput.classList.remove('hidden');
    } else {
        storyInput.classList.add('hidden');
    }
}

// Eventos de teclado
document.getElementById('room-id').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') joinRoom();
});

document.getElementById('user-name-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') joinRoom();
});

storyInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && currentUser.isCreator) startVoting();
});

chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

// Preenche campo sala automaticamente se vier na URL
const urlParams = new URLSearchParams(window.location.search);
const sharedRoomId = urlParams.get('room');
if (sharedRoomId) {
    document.getElementById('room-id').value = sharedRoomId;
}