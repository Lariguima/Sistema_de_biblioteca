# Sistema de Biblioteca

## Visão Geral

O Sistema de Biblioteca é uma aplicação web moderna desenvolvida para
gerenciar o funcionamento completo de uma biblioteca. Desenvolvido com
**HTML**, **CSS** e **JavaScript**, oferece uma interface intuitiva para
controle de livros, alunos, empréstimos e relatórios.

## Funcionalidades

### 🔐 Autenticação

- Login com diferentes tipos de usuário (Administrador e Atendente)
- Controle de sessão e logout seguro
- Interface adaptada ao tipo de usuário

### 📊 Dashboard

- Estatísticas em tempo real
- Ações rápidas
- Alertas de vencimento
- Visão geral do estado da biblioteca

### 📚 Gestão de Livros

- Cadastro completo: ISBN, título, autor, ano, categoria, editora
- Edição e exclusão
- Busca avançada
- Status: Disponível, Emprestado, Atrasado
- Validações: ISBN único, ano válido, campos obrigatórios

### 👥 Gestão de Alunos

- Cadastro com matrícula única
- Controle de empréstimos por aluno
- Busca por nome ou matrícula
- Validação de e-mail e campos obrigatórios

### 🔄 Gestão de Empréstimos

- Registro de empréstimos e devoluções
- Renovação (7 dias)
- Status: Ativo, Atrasado, Devolvido
- Verificações automáticas

### 📈 Relatórios

- Livros mais populares
- Empréstimos atrasados
- Histórico completo

## 🛠️ Tecnologias Utilizadas

- **HTML5**
- **CSS3**
- **JavaScript Vanilla**
- **Local Storage**

## 📁 Estrutura do Projeto

    biblioteca/
    ├── index.html
    ├── readme.md
    ├── script.js
    └── style.css

## 🎯 Como Usar

### 1. Primeiro Acesso

1.  Abra o `index.html`
2.  Use qualquer usuário/senha (modo demonstração)
3.  Escolha o tipo de usuário
4.  Clique em **Entrar**

### 2. Operações Básicas

#### 📖 Cadastrar Livro

- Navegue para **Livros**
- Preencha: ISBN, título, autor, ano, categoria, editora
- Clique em **Cadastrar Livro**

#### 👨‍🎓 Cadastrar Aluno

- Acesse **Alunos**
- Preencha: matrícula, nome, e-mail, curso
- Clique em **Cadastrar Aluno**

#### 🔄 Registrar Empréstimo

- Vá para **Empréstimos**
- Informe: matrícula, ISBN, dias (7/14/21)
- Clique em **Registrar Empréstimo**

#### 📥 Registrar Devolução

- Na aba **Empréstimos**
- Informe o ISBN
- Clique em **Registrar Devolução**

## 🔧 Estrutura de Dados

### Livro

```javascript
{
  id: number,
  isbn: string,
  title: string,
  author: string,
  year: number,
  category: string,
  publisher: string,
  status: 'available' | 'borrowed' | 'overdue'
}
```

### Aluno

```javascript
{
  id: number,
  registration: string,
  name: string,
  email: string,
  course: string,
  activeLoans: number
}
```

### Empréstimo

```javascript
{
  id: number,
  studentId: number,
  bookId: number,
  loanDate: 'YYYY-MM-DD',
  dueDate: 'YYYY-MM-DD',
  returnDate: 'YYYY-MM-DD' | null,
  status: 'active' | 'overdue' | 'returned'
}
```

## ⚙️ Personalização

### Categorias de Livros

Adicionar nova categoria no HTML:

```html
<option value="nova-categoria">Nova Categoria</option>
```

### Períodos de Empréstimo

```html
<option value="30">30 dias</option>
```

## 🎨 Design e Interface

- Responsivo
- Paleta moderna em azul e verde
- Navegação por abas
- Feedback visual (alertas, modais)

## 🔒 Validações e Regras

### Livros

- ISBN único
- Ano válido
- Campos obrigatórios
- ❌ Não pode excluir livro emprestado

### Alunos

- Matrícula única
- E-mail válido
- Campos obrigatórios
- ❌ Não pode excluir aluno com empréstimo ativo

### Empréstimos

- Livro deve estar disponível
- Aluno deve existir
- Datas e status automáticos

## 💾 Persistência

Salvo em Local Storage: - Livros - Alunos - Empréstimos

## 🐛 Solução de Problemas

- Livro não disponível → verifique empréstimos ativos
- Não excluir aluno/livro → aguarde devolução
- Empréstimo não registrado → verifique matrícula/ISBN
- E-mail inválido → usuário@dominio.com

## 🔄 Fluxo

1.  Cadastrar livro
2.  Cadastrar aluno
3.  Registrar empréstimo
4.  Registrar devolução
5.  Dashboard atualiza automaticamente

## 📱 Responsividade

- Desktop
- Tablet
- Mobile

## 🚀 Recursos Avançados

- Busca e filtros
- Estatísticas em tempo real
- Cálculo automático de devolução

## 📄 Licença

Projeto educacional.

Desenvolvido por:
Caio Panta da Silva Ferreira
Larissa Victoria Guimarães de Freitas
João Gabriel de Araújo Vital
maria gabriela do prado lima
João Victor Silva e Souza
