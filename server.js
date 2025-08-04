const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const port = process.env.NODE_PORT || 3000;

// Estruturas de dados para gerenciar salas e usuários
const rooms = new Map();
const users = new Map();

// Cartas disponíveis para votação
const CARDS = ['0', '1', '2', '3', '5', '8', '13', '21', '34', '55', '89', '?', '☕'];

app.use(express.static(__dirname));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/client.html");
});

// Função para criar uma nova sala
function createRoom(roomId, creatorId) {
    const room = {
        id: roomId,
        creator: creatorId,
        users: new Map(),
        currentStory: '',
        votes: new Map(),
        votingActive: false,
        votesRevealed: false,
        createdAt: Date.now()
    };
    rooms.set(roomId, room);
    return room;
}

// Função para adicionar usuário à sala
function addUserToRoom(roomId, userId, userName, isSpectator = false) {
    const room = rooms.get(roomId);
    if (!room) return null;

    const user = {
        id: userId,
        name: userName,
        isSpectator: isSpectator,
        vote: null,
        isCreator: userId === room.creator
    };

    room.users.set(userId, user);
    users.set(userId, { ...user, roomId });
    return room;
}

// Função para remover usuário da sala
function removeUserFromRoom(userId) {
    const user = users.get(userId);
    if (!user) return null;

    const room = rooms.get(user.roomId);
    if (room) {
        room.users.delete(userId);
        room.votes.delete(userId);
        
        // Se o criador sair, transferir para outro usuário ou deletar sala
        if (user.isCreator && room.users.size > 0) {
            const newCreator = Array.from(room.users.values())[0];
            newCreator.isCreator = true;
            room.creator = newCreator.id;
        } else if (room.users.size === 0) {
            rooms.delete(user.roomId);
        }
    }
    
    users.delete(userId);
    return user;
}

// Função para calcular estatísticas das votações
function calculateVotingStats(room) {
    const numericVotes = Array.from(room.votes.values())
        .filter(vote => vote !== '?' && vote !== '☕' && !isNaN(vote))
        .map(vote => parseInt(vote));

    if (numericVotes.length === 0) return null;

    const sum = numericVotes.reduce((a, b) => a + b, 0);
    const avg = sum / numericVotes.length;
    const min = Math.min(...numericVotes);
    const max = Math.max(...numericVotes);

    return { avg: avg.toFixed(1), min, max, count: numericVotes.length };
}

io.on('connection', (socket) => {
    console.log('New user connected:', socket.id);

    // Quando usuário se junta a uma sala
    socket.on('joinRoom', (data) => {
        const { roomId, userName, isSpectator = false } = data;
        
        let room = rooms.get(roomId);
        if (!room) {
            room = createRoom(roomId, socket.id);
        }

        // Sair da sala anterior se existir
        const existingUser = users.get(socket.id);
        if (existingUser) {
            socket.leave(existingUser.roomId);
            removeUserFromRoom(socket.id);
        }

        // Entrar na nova sala
        socket.join(roomId);
        addUserToRoom(roomId, socket.id, userName, isSpectator);

        // Enviar dados atuais da sala para o usuário
        socket.emit('roomJoined', {
            room: {
                id: room.id,
                currentStory: room.currentStory,
                votingActive: room.votingActive,
                votesRevealed: room.votesRevealed,
                users: Array.from(room.users.values()),
                votes: room.votesRevealed ? Object.fromEntries(room.votes) : {}
            },
            user: room.users.get(socket.id)
        });

        // Notificar outros usuários da sala
        socket.to(roomId).emit('userJoined', room.users.get(socket.id));
        
        // Enviar lista atualizada de usuários
        io.to(roomId).emit('usersUpdated', Array.from(room.users.values()));
        
        console.log(`User ${userName} joined room ${roomId}`);
    });

    // Iniciar nova votação
    socket.on('startVoting', (data) => {
        const user = users.get(socket.id);
        if (!user || !user.isCreator) return;

        const room = rooms.get(user.roomId);
        if (!room) return;

        room.currentStory = data.story || '';
        room.votingActive = true;
        room.votesRevealed = false;
        room.votes.clear();

        io.to(user.roomId).emit('votingStarted', {
            story: room.currentStory,
            cards: CARDS
        });

        console.log(`Voting started in room ${user.roomId} for story: ${room.currentStory}`);
    });

    // Submeter voto
    socket.on('submitVote', (data) => {
        const user = users.get(socket.id);
        if (!user || user.isSpectator) return;

        const room = rooms.get(user.roomId);
        if (!room || !room.votingActive || room.votesRevealed) return;

        const { vote } = data;
        if (!CARDS.includes(vote)) return;

        room.votes.set(socket.id, vote);
        user.vote = vote;

        // Notificar que usuário votou (sem revelar o voto)
        io.to(user.roomId).emit('userVoted', {
            userId: socket.id,
            userName: user.name,
            hasVoted: true
        });

        // Verificar se todos votaram
        const votingUsers = Array.from(room.users.values()).filter(u => !u.isSpectator);
        const votedUsers = votingUsers.filter(u => room.votes.has(u.id));
        
        if (votedUsers.length === votingUsers.length && votingUsers.length > 0) {
            io.to(user.roomId).emit('allUsersVoted');
        }

        console.log(`User ${user.name} voted in room ${user.roomId}`);
    });

    // Revelar votos
    socket.on('revealVotes', () => {
        const user = users.get(socket.id);
        if (!user || !user.isCreator) return;

        const room = rooms.get(user.roomId);
        if (!room || !room.votingActive) return;

        room.votesRevealed = true;
        
        const votes = {};
        room.votes.forEach((vote, userId) => {
            const voter = room.users.get(userId);
            if (voter) {
                votes[userId] = {
                    userName: voter.name,
                    vote: vote
                };
            }
        });

        const stats = calculateVotingStats(room);

        io.to(user.roomId).emit('votesRevealed', {
            votes: votes,
            stats: stats
        });

        console.log(`Votes revealed in room ${user.roomId}`);
    });

    // Resetar votação
    socket.on('resetVoting', () => {
        const user = users.get(socket.id);
        if (!user || !user.isCreator) return;

        const room = rooms.get(user.roomId);
        if (!room) return;

        room.votingActive = false;
        room.votesRevealed = false;
        room.votes.clear();
        room.currentStory = '';

        // Limpar votos dos usuários
        room.users.forEach(u => u.vote = null);

        io.to(user.roomId).emit('votingReset');

        console.log(`Voting reset in room ${user.roomId}`);
    });

    // Chat
    socket.on('sendMessage', (data) => {
        const user = users.get(socket.id);
        if (!user) return;

        const message = {
            id: Date.now(),
            userName: user.name,
            text: data.text,
            timestamp: Date.now()
        };

        io.to(user.roomId).emit('newMessage', message);
    });

    // Desconexão
    socket.on('disconnect', () => {
        const user = removeUserFromRoom(socket.id);
        if (user) {
            socket.to(user.roomId).emit('userLeft', {
                userId: socket.id,
                userName: user.name
            });
            
            const room = rooms.get(user.roomId);
            if (room) {
                io.to(user.roomId).emit('usersUpdated', Array.from(room.users.values()));
            }
        }
        
        console.log('User disconnected:', socket.id);
    });
});

server.listen(port, () => {
    console.log(`Scrum Poker server is running on port ${port}`);
});