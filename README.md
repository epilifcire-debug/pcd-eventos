🧩 Sistema PCD — Eventos

Sistema completo de cadastro e gerenciamento de eventos e participantes PCD, com upload de documentos, relatórios, backup e painel administrativo.
Feito em Node.js + Express + Multer + HTML/JS puro, compatível com modo local e Render (deploy online).

🚀 Funcionalidades Principais

✅ Login e controle de acesso

Perfis de usuário: Administrador e Padrão.

Permissões diferenciadas (Admin pode gerenciar usuários).

✅ Gerenciamento de Eventos

Cadastro, edição e exclusão de eventos.

Data, nome e descrição.

✅ Cadastro de Pessoas

Nome, CPF, telefone, descrição e vinculação a eventos.

Upload de múltiplos documentos (PDF, JPG, PNG).

Verificação automática de documentos obrigatórios.

✅ Upload e Visualização de Documentos

Cada pessoa tem sua pasta própria em /documentos/NomePessoa/.

Uploads processados pelo servidor via multer.

Visualização de arquivos armazenados no backend.

✅ Relatórios

Geração de relatórios filtrados por evento.

Exportação em PDF ou visualização para impressão.

✅ Backup

Exportação e importação de backup manual (JSON).

Backup automático a cada 60 segundos (salvo em localStorage).

✅ Administração

Gerenciamento de usuários: criar, editar e remover.

Controle de acesso com senha e tipo de usuário.

✅ Outros recursos

Tema claro/escuro com persistência.

Interface responsiva e moderna.

Detecção automática de servidor (Local/Render).

⚙️ Estrutura do Projeto
pcd-eventos/
├── server.js             # Servidor Express com rotas e upload (multer)
├── package.json          # Dependências e scripts NPM
├── package-lock.json
├── /documentos/          # Pasta onde os uploads são salvos
└── /public/
    ├── index.html        # Frontend completo (interface do sistema)
    ├── style.css         # Estilos opcionais (embutidos no HTML)
    └── assets/           # Imagens, ícones, logos
