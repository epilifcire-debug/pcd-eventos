# pcd-eventos
Cadastro de pessoas com deficiência em situação de baixa renda para eventos artísticos 

# 🧩 Sistema PCD Eventos

Sistema completo para cadastro e gerenciamento de pessoas e eventos PCD, com envio de documentos (imagens e PDFs), controle de obrigatórios, semáforo de status (verde/vermelho), backup e relatórios automáticos.

---

## 📂 Estrutura do Projeto

pcd-eventos/
│
├── server.js                 ← Backend Express + Frontend integrados
├── package.json              ← Dependências e scripts
├── .gitignore                ← Arquivos ignorados pelo Git
│
├── /frontend/                ← Interface do usuário
│   ├── index.html
│   ├── login.html
│   └── logo.png
│
└── /documentos/              ← Criada automaticamente para uploads
    ├── João da Silva/
    │   ├── foto.jpg
    │   ├── doc-nacional.png
    │   └── comprovante.pdf
    └── logs/
        └── logs.json
