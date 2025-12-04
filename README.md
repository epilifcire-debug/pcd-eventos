# 🧩 Sistema PCD — Eventos

Sistema completo para **gestão de Pessoas, Eventos e Documentos**, com autenticação e painel administrativo.

## 🚀 Tecnologias

- **Frontend:** HTML, CSS, JavaScript (vanilla)
- **Backend:** Node.js + Express
- **Banco de Dados:** SQLite
- **Autenticação:** JWT (JSON Web Token)
- **Uploads:** Multer (arquivos de fotos e PDFs)

---

## 🖥️ Estrutura do Projeto

📁 pcd-eventos/
├── index.html # Página principal (frontend)
├── style.min.css # Estilos minificados
├── app.min.js # Lógica do frontend (login, eventos, etc.)
├── logo.png # Logotipo do sistema
├── server.js # Servidor Express + API REST
├── db.sqlite # Banco de dados SQLite
├── package.json # Configurações do projeto Node
├── package-lock.json # Dependências bloqueadas
└── documentos/ # (criado automaticamente) uploads de usuários


---

## ⚙️ Instalação local

```bash
# 1️⃣ Clonar o repositório
git clone https://github.com/epilifcire-debug/pcd-eventos.git
cd pcd-eventos

# 2️⃣ Instalar dependências
npm install

# 3️⃣ Iniciar o servidor backend
node server.js
