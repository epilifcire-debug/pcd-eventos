# pcd-eventos
Cadastro de pessoas com deficiência em situação de baixa renda para eventos artísticos 

# 🧩 Sistema PCD Eventos

Sistema completo para cadastro e gerenciamento de pessoas e eventos PCD, com envio de documentos (imagens e PDFs), controle de obrigatórios, semáforo de status (verde/vermelho), backup e relatórios automáticos.

---

## 📂 Estrutura do Projeto

pcd-eventos/
│
├── index.html        ← Tela principal (após login)
├── login.html        ← Tela de login
├── server.js         ← Já pronto e compatível
├── package.json
└── /documentos/
pcd-eventos-backend/
│
├── server.js              ← Servidor Express.js principal
├── package.json           ← Configuração de dependências e scripts
├── /documentos/           ← Diretório criado automaticamente para uploads
└── /logs/                 ← (opcional) Armazena logs de upload
