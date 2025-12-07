🧠 Projeto: PCD Eventos — Sistema com Backup Automático e Cloudinary
📋 Descrição

Este projeto é um sistema de cadastro e gestão de eventos, pessoas e usuários, com backup automático local e online utilizando Cloudinary.

O sistema salva automaticamente todos os dados do navegador e envia cópias em JSON para a nuvem a cada 30 segundos.
Além disso, ele verifica se há backups mais recentes no Cloudinary e atualiza automaticamente os dados locais, mantendo tudo sincronizado entre os dispositivos.

🚀 Funcionalidades Principais
🗂️ Frontend (index.html)

Interface responsiva com cards e tabelas (totalmente preservada).

Backup automático local no localStorage.

Backup online enviado para o servidor e armazenado no Cloudinary.

Sincronização automática: baixa backups mais recentes sempre que entrar no site ou a cada 30 segundos.

Compatível com backup incremental e Cloudinary JSON raw.

💾 Backend (server.js)

Servidor Node.js com Express e CORS.

Rota /backup-json: recebe o JSON e faz upload automático pro Cloudinary.

Rota /upload: envia arquivos e documentos (imagens, PDFs, etc.).

Rota /listar-backups: retorna o backup mais recente (com public_id, created_at, url).

Integração segura com variáveis de ambiente (.env).

⚙️ Tecnologias Utilizadas
Tipo	Tecnologias
Frontend	HTML, CSS, JavaScript
Backend	Node.js, Express, CORS
Upload & Backup	Cloudinary, multer, streamifier
Configuração	dotenv
Hospedagem	Render, Railway, ou localhost
📁 Estrutura do Projeto
pcd-eventos/
│
├── index.html               # Interface principal do sistema
├── server.js                # Servidor Node.js com backup automático
├── .env                     # Configurações privadas (Cloudinary)
├── .env.example             # Modelo de configuração
├── package.json             # Dependências e scripts
└── README.md                # Documentação do projeto

🔧 Configuração do Ambiente
1️⃣ Instalar dependências
npm install

2️⃣ Criar arquivo .env

Crie um arquivo .env na raiz do projeto com as suas credenciais do Cloudinary:

CLOUDINARY_CLOUD_NAME=djln3mjwd
CLOUDINARY_API_KEY=SUA_API_KEY
CLOUDINARY_API_SECRET=SEU_API_SECRET
PORT=3000


⚠️ Importante: nunca publique o arquivo .env no GitHub.
Adicione .env ao arquivo .gitignore.

▶️ Executar o Servidor
node server.js


Servidor disponível em:

http://localhost:3000

🌐 Executar o Site

Abra o arquivo index.html no navegador
ou sirva localmente com um live server (VS Code, por exemplo).

O site irá:

Carregar automaticamente os dados locais.

Enviar backup pro servidor (Cloudinary).

Verificar e aplicar backup remoto se houver atualização.

🔄 Fluxo do Backup Automático
flowchart TD
    A[Usuário interage no site] --> B[Dados salvos no localStorage]
    B --> C[Função backupAutomatico()]
    C --> D[POST /backup-json]
    D --> E[Servidor Node.js]
    E --> F[Upload Cloudinary (backups_pcd/)]
    F --> G[Cloudinary armazena JSON]
    G --> H[Listar backups mais recentes (/listar-backups)]
    H --> I[Frontend compara public_id]
    I --> J[Se novo, baixa e atualiza dados locais]

📦 Dependências Principais
Pacote	Função
express	Servidor HTTP
cors	Liberação de requisições externas
multer	Upload de arquivos
cloudinary	API de armazenamento em nuvem
multer-storage-cloudinary	Integração multer ↔ Cloudinary
streamifier	Envia JSON direto sem salvar em disco
dotenv	Gerenciamento de variáveis de ambiente
🧰 Scripts Úteis
# Iniciar o servidor
node server.js

# Em desenvolvimento (com atualização automática, se quiser)
npm install -g nodemon
nodemon server.js

🛠️ Manutenção e Backup

O servidor mantém backups no Cloudinary na pasta:
backups_pcd/backup-[timestamp].json

Você pode visualizar ou restaurar diretamente no painel Cloudinary.

O sistema baixa automaticamente o backup mais recente ao iniciar.

🧑‍💻 Autor

Eric Filipe
💡 Desenvolvido com suporte do ChatGPT (OpenAI)
