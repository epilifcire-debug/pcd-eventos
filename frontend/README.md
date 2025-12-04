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

```
📁 pcd-eventos/
├── index.html         # Página principal (frontend)
├── style.min.css      # Estilos minificados
├── app.min.js         # Lógica do frontend (login, eventos, etc.)
├── logo.png           # Logotipo do sistema
├── server.js          # Servidor Express + API REST
├── db.sqlite          # Banco de dados SQLite
├── package.json       # Configurações do projeto Node
├── package-lock.json  # Dependências bloqueadas
└── documentos/        # (criado automaticamente) uploads de usuários
```

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
```

Por padrão, o servidor roda em:
👉 **http://localhost:3000**

---

## 🌐 Configuração do Frontend (GitHub Pages)

Para publicar o **frontend** no GitHub Pages:

1. Vá em **Settings → Pages**  
2. Em “Branch”, selecione:  
   - **Branch:** `main` (ou `master`, dependendo do nome)  
   - **Folder:** `/ (root)`  
3. Clique em **Save**

Certifique-se de que:
- O arquivo `index.html` está na **raiz do repositório**
- O link do backend em `app.min.js` aponte para:
  ```js
  "https://pcd-eventos.onrender.com"
  ```
  (como já está configurado)

---

## 👤 Login Padrão

Use o seguinte para acessar o painel:

```
Email: admin@pcd.com
Senha: 1234
```

Um novo usuário admin é criado automaticamente se não existir.

---

## 📦 Funcionalidades

- [x] Login com JWT
- [x] Cadastro e listagem de eventos
- [x] Cadastro e listagem de pessoas
- [x] Upload de documentos (fotos, PDFs)
- [x] Painel admin (criar, ativar, desativar usuários)
- [x] Tema claro/escuro

---

## 🧠 Desenvolvido por

**Eric Filipe**  
💻 Projeto: [https://epilifcire-debug.github.io/pcd-eventos/](https://epilifcire-debug.github.io/pcd-eventos/)  
📧 Contato: *em breve*

---

## ⚠️ Observação

O **GitHub Pages** serve apenas o **frontend**.  
O **backend (Node.js)** precisa estar hospedado separadamente (por exemplo, no [Render.com](https://render.com/) ou [Railway](https://railway.app/)).

Certifique-se de que o backend esteja **online** e o `API_BASE` em `app.min.js` aponte para ele.
