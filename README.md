# 🃏 Scrum Poker

Uma aplicação web em tempo real para Planning Poker/Scrum Poker, permitindo que equipes ágeis estimem histórias de usuário de forma colaborativa e remota.

## 📋 Funcionalidades

### 🎯 **Funcionalidades Principais**
- **Salas Dinâmicas**: Criação automática de salas com IDs personalizados
- **Votação em Tempo Real**: Sistema de votação com cartas Fibonacci
- **Estimativas Simultâneas**: Revelação síncrona dos votos
- **Estatísticas**: Cálculo automático de média, mínimo e máximo
- **Chat Integrado**: Comunicação em tempo real entre participantes

### 👥 **Gerenciamento de Usuários**
- **Criador da Sala**: Controle total sobre votações (primeiro a entrar)
- **Participantes**: Podem votar nas estimativas
- **Espectadores**: Observam sem participar das votações
- **Transferência de Criador**: Automática quando o criador sai
- **Indicadores Visuais**: 👑 para criador, 👁️ para espectadores

### 🔧 **Funcionalidades Técnicas**
- **Persistência de Estado**: Mantém dados ao atualizar a página
- **Compartilhamento de Sala**: URLs diretas para entrada em salas
- **Responsividade**: Interface adaptável para desktop e mobile
- **Reconexão Automática**: Recupera estado após desconexões
- **Recuperação de Voto**: Mantém voto ao atualizar durante votação

## 🛠️ Tecnologias Utilizadas

### **Backend**
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **Socket.IO** - Comunicação em tempo real
- **JavaScript ES6+** - Linguagem de programação

### **Frontend**
- **HTML5** - Estrutura da aplicação
- **CSS3** - Estilização e responsividade
- **JavaScript Vanilla** - Lógica do cliente
- **Socket.IO Client** - Comunicação com servidor

## 🚀 Instalação e Execução

### **Pré-requisitos**
- Node.js (versão 14 ou superior)
- npm ou yarn

### **Passos para Instalação**

1. **Clone o repositório**
```bash
git clone <url-do-repositorio>
cd scrumpoker
```

2. **Instale as dependências**
```bash
npm install
```

3. **Execute o servidor**
```bash
npm start
# ou
node server.js
```

4. **Acesse a aplicação**
```
http://localhost:3000
```

## 📁 Estrutura do Projeto

```
scrumpoker/
├── server.js          # Servidor principal com Socket.IO
├── client.html        # Interface do usuário
├── script.js          # Lógica do frontend
├── styles.css         # Estilos da aplicação
├── package.json       # Dependências do projeto
└── README.md          # Documentação
```

## 🎮 Como Usar

### **1. Criando uma Sala**
- Acesse a aplicação
- Digite um ID único para a sala (máx. 20 caracteres)
- Insira seu nome (máx. 30 caracteres)
- Escolha se deseja ser espectador (opcional)
- Clique em "Entrar na Sala"

### **2. Compartilhando a Sala**
- Clique no botão "🔗 Compartilhar Sala"
- O link será copiado automaticamente
- Compartilhe com outros participantes
- O campo sala será preenchido automaticamente para quem acessar o link

### **3. Iniciando uma Votação** (apenas criador)
- Digite a história/tarefa no campo apropriado
- Clique em "🚀 Iniciar Votação"
- Aguarde todos os participantes votarem

### **4. Votando**
- Selecione uma carta com sua estimativa
- Aguarde outros participantes votarem
- O criador pode revelar os votos quando todos terminarem

### **5. Visualizando Resultados**
- Votos são revelados simultaneamente
- Estatísticas são calculadas automaticamente
- Chat disponível para discussões

### **6. Saindo da Sala**
- Clique no botão "🚪 Sair da Sala" no topo
- Retorna para a tela inicial

## 🃏 Cartas Disponíveis

**Sequência Fibonacci**: `0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89`
**Cartas Especiais**: 
- `?` - Incerteza/Não sei
- `☕` - Pausa/Break

## 🔧 Configuração

### **Variáveis de Ambiente**
```bash
NODE_PORT=3000  # Porta do servidor (opcional)
```

### **Limites da Aplicação**
- **ID da Sala**: 20 caracteres máximo
- **Nome do Usuário**: 30 caracteres máximo
- **Mensagens do Chat**: 200 caracteres máximo
- **História/Tarefa**: 200 caracteres máximo

## 🏗️ Arquitetura

### **Backend (server.js)**
- **Gerenciamento de Salas**: Map com dados das salas ativas
- **Gerenciamento de Usuários**: Map com usuários conectados
- **Eventos Socket.IO**: Comunicação bidirecional
- **Lógica de Negócio**: Votação, chat, estatísticas

### **Frontend (client.html + script.js + styles.css)**
- **Interface Responsiva**: CSS Grid/Flexbox
- **Estado da Aplicação**: Variáveis globais sincronizadas
- **Eventos em Tempo Real**: Socket.IO client
- **Persistência Local**: localStorage para reconexão

## 📊 Funcionalidades Técnicas Detalhadas

### **Gerenciamento de Estado**
- Estado da sala persistido no servidor
- Recuperação automática ao atualizar página
- Sincronização em tempo real entre clientes
- Manutenção do voto durante atualizações

### **Sistema de Votação**
- Votos ocultos até revelação
- Validação de cartas permitidas
- Cálculo automático de estatísticas
- Indicadores visuais de progresso

### **Chat em Tempo Real**
- Mensagens instantâneas
- Timestamps automáticos
- Mensagens do sistema (entrada/saída)
- Scroll automático

### **Interface Adaptativa**
- Botões de criador aparecem/desaparecem conforme necessário
- Campo de história visível apenas para criador
- Status de conexão em tempo real
- Informações da sala ocultas quando não conectado

## 🔒 Validações e Segurança

### **Validações de Input**
- Limitação de caracteres em todos os campos
- Sanitização básica de dados
- Validação de cartas permitidas
- Verificação de permissões (criador)

### **Tratamento de Erros**
- Recuperação de desconexões
- Validação de dados no backend
- Feedback visual de erros
- Limpeza automática de salas vazias

## 🎨 Interface do Usuário

### **Design Responsivo**
- Layout adaptável para mobile e desktop
- Cards interativos para votação
- Indicadores visuais de status
- Cores intuitivas para diferentes estados

### **Experiência do Usuário**
- Feedback imediato para ações
- Estado visual claro (conectado/desconectado)
- Navegação intuitiva
- Atalhos de teclado (Enter para enviar)

## 🌐 Configuração de Rede

### **Rede Local**
- O servidor escuta em `0.0.0.0:3000` por padrão
- Acesse via IP da máquina: `http://192.168.1.X:3000`

### **Produção**
- Configure a variável `PORT` no ambiente
- Use um reverse proxy (nginx) se necessário
- Configure HTTPS para produção

## 🐛 Solução de Problemas

### **Problemas Comuns**

1. **Não consigo me conectar**:
   - Verifique se o servidor está rodando
   - Confirme o endereço IP/porta
   - Desabilite firewall/antivírus temporariamente

2. **Perdeu status de criador ao atualizar**:
   - Normal - o primeiro usuário sempre é o criador
   - Saia e entre novamente na sala
   - Se outros saíram, você pode se tornar criador

3. **Votação não funciona**:
   - Certifique-se de não estar em modo espectador
   - Verifique se a votação foi iniciada pelo facilitador
   - Recarregue a página se necessário

4. **Chat não aparece mensagens**:
   - Verifique a conexão WebSocket
   - Confirme se está na mesma sala que outros usuários

## 🚀 Funcionalidades Avançadas

### **Gestão de Salas**
- Salas são criadas automaticamente quando alguém entra
- O primeiro usuário torna-se o facilitador
- Se o facilitador sair, a função é transferida automaticamente
- Salas vazias são removidas automaticamente

### **Sincronização em Tempo Real**
- Estado da votação sincronizado entre todos os clientes
- Indicadores visuais de quem já votou
- Notificações de entrada/saída de usuários
- Chat com timestamps

### **Recursos de URL**
- URLs com parâmetro de sala para entrada direta
- Preenchimento automático do campo sala
- Compartilhamento fácil via botão dedicado

## 🚀 Possíveis Melhorias Futuras

- [ ] Autenticação de usuários
- [ ] Histórico de votações
- [ ] Temas personalizáveis
- [ ] Exportação de resultados
- [ ] Integração com ferramentas de projeto
- [ ] Notificações push
- [ ] Suporte a múltiplos idiomas
- [ ] Timer para votações
- [ ] Cartas customizáveis

## 📝 Licença

Este projeto está sob licença ISC. Veja o arquivo package.json para mais detalhes.

## 🤝 Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📞 Suporte

Em caso de dúvidas ou problemas:
- Abra uma [issue](link-para-issues)
- Entre em contato: [seu-email]

---

**Desenvolvido com ❤️ para facilitar sessões de Planning Poker em equipes ágeis! 🎯**
