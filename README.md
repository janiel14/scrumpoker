# 🃏 Scrum Poker

Uma aplicação web em tempo real para Planning Poker (Scrum Poker) que permite às equipes ágeis estimar histórias de usuário de forma colaborativa.

## 🚀 Funcionalidades

### Para Usuários
- **Salas Personalizadas**: Crie ou entre em salas com IDs únicos
- **Votação em Tempo Real**: Sistema de votação com cartas Fibonacci (0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, ?, ☕)
- **Modo Espectador**: Observe as sessões sem participar da votação
- **Chat Integrado**: Comunicação em tempo real entre os participantes
- **Interface Responsiva**: Funciona em desktop e dispositivos móveis

### Para Facilitadores (Criadores da Sala)
- **Controle da Sessão**: Iniciar, revelar e resetar votações
- **Gestão de Histórias**: Definir e editar histórias/tarefas para estimativa
- **Estatísticas Automáticas**: Média, mínimo, máximo das estimativas
- **Visualização de Resultados**: Ver todos os votos após revelação

### Recursos Técnicos
- **Multi-usuário**: Suporte a múltiplas salas simultâneas
- **Conexão Persistente**: WebSocket com Socket.IO
- **Sincronização**: Estado sincronizado entre todos os participantes
- **Indicadores Visuais**: Status de conexão e votação em tempo real

## 🛠️ Instalação e Execução

### Pré-requisitos
- Node.js (versão 14 ou superior)
- npm ou yarn

### Passos para execução

1. **Instalar dependências**:
```bash
npm install
```

2. **Iniciar o servidor**:
```bash
npm start
```

3. **Acessar a aplicação**:
   - Abra o navegador em `http://localhost:3000`
   - Para acesso em rede local, use o IP da máquina: `http://SEU_IP:3000`

## 📱 Como Usar

### 1. Criar/Entrar em uma Sala
- Digite um ID único para a sala (ex: "sprint-23", "team-alpha")
- Insira seu nome
- Escolha se quer entrar como espectador (opcional)
- Clique em "Entrar na Sala"

### 2. Para Facilitadores (Primeiro a entrar = Criador)
- Digite a história/tarefa no campo correspondente
- Clique em "Iniciar Votação" para começar
- Aguarde todos votarem
- Clique em "Revelar Votos" para mostrar resultados
- Use "Nova Votação" para resetar e começar nova estimativa

### 3. Para Participantes
- Aguarde o facilitador iniciar a votação
- Selecione sua carta clicando nela
- Aguarde a revelação dos votos
- Discuta os resultados no chat se necessário

### 4. Sistema de Cartas
- **Números Fibonacci**: 0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89
- **?**: Não sei/Preciso de mais informações
- **☕**: Pausa/Break

## 🎯 Estrutura do Projeto

```
scrumpoker/
├── server.js          # Servidor Node.js com Socket.IO
├── client.html        # Interface web do cliente
├── package.json       # Configurações e dependências
└── README.md          # Este arquivo
```

## 🔧 Tecnologias Utilizadas

- **Backend**: Node.js, Express.js, Socket.IO
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Comunicação**: WebSocket em tempo real
- **Estilo**: CSS responsivo com gradientes e animações

## 🌐 Configuração de Rede

Para usar em rede local ou produção:

1. **Rede Local**: 
   - O servidor escuta em `0.0.0.0:3000` por padrão
   - Acesse via IP da máquina: `http://192.168.1.X:3000`

2. **Produção**:
   - Configure a variável `PORT` no ambiente
   - Use um reverse proxy (nginx) se necessário
   - Configure HTTPS para produção

## 🚀 Funcionalidades Avançadas

### Gestão de Salas
- Salas são criadas automaticamente quando alguém entra
- O primeiro usuário torna-se o facilitador
- Se o facilitador sair, a função é transferida automaticamente
- Salas vazias são removidas automaticamente

### Sincronização em Tempo Real
- Estado da votação sincronizado entre todos os clientes
- Indicadores visuais de quem já votou
- Notificações de entrada/saída de usuários
- Chat com timestamps

### Interface Responsiva
- Design adaptativo para mobile e desktop
- Cartas com hover effects e animações
- Cores diferenciadas para facilitadores e espectadores
- Status de conexão visível

## 🐛 Solução de Problemas

### Problemas Comuns

1. **Não consigo me conectar**:
   - Verifique se o servidor está rodando
   - Confirme o endereço IP/porta
   - Desabilite firewall/antivírus temporariamente

2. **Votação não funciona**:
   - Certifique-se de não estar em modo espectador
   - Verifique se a votação foi iniciada pelo facilitador
   - Recarregue a página se necessário

3. **Chat não aparece mensagens**:
   - Verifique a conexão WebSocket
   - Confirme se está na mesma sala que outros usuários

## 📝 Licença

Este projeto está sob a licença ISC. Veja o arquivo package.json para mais detalhes.

## 🤝 Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para:
- Reportar bugs
- Sugerir melhorias
- Enviar pull requests
- Melhorar a documentação

---

**Desenvolvido para facilitar sessões de Planning Poker em equipes ágeis! 🎯**
