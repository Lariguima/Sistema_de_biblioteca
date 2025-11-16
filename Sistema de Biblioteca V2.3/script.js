// Dados de exemplo para demonstração - AGORA COM PERSISTÊNCIA
let books = JSON.parse(localStorage.getItem('libraryBooks')) || [{'author': 'Machado de Assis',
  'category': 'ficcao',
  'id': 1,
  'isbn': '978-85-359-0277-4',
  'publisher': 'Editora A',
  'status': 'available',
  'title': 'Dom Casmurro',
  'year': 1899},
 {'author': 'Aluísio Azevedo',
  'category': 'ficcao',
  'id': 2,
  'isbn': '978-85-7232-227-8',
  'publisher': 'Editora B',
  'status': 'borrowed',
  'title': 'O Cortiço',
  'year': 1890},
 {'author': 'Jorge Amado',
  'category': 'ficcao',
  'id': 3,
  'isbn': '978-65-86020-10-9',
  'publisher': 'Companhia das Letras',
  'status': 'available',
  'title': 'Capitães da Areia',
  'year': 1937},
 {'author': 'Clarice Lispector',
  'category': 'ficcao',
  'id': 4,
  'isbn': '978-85-250-5677-5',
  'publisher': 'Rocco',
  'status': 'available',
  'title': 'A Hora da Estrela',
  'year': 1977},
 {'author': 'Graciliano Ramos',
  'category': 'ficcao',
  'id': 5,
  'isbn': '978-85-391-0844-8',
  'publisher': 'Record',
  'status': 'available',
  'title': 'Vidas Secas',
  'year': 1938}];

let students = JSON.parse(localStorage.getItem('libraryStudents')) || [{'activeLoans': 1,
  'course': 'Engenharia',
  'email': 'joao@escola.com',
  'id': 1,
  'name': 'João Silva',
  'registration': '2023001'},
 {'activeLoans': 0,
  'course': 'Medicina',
  'email': 'maria@escola.com',
  'id': 2,
  'name': 'Maria Santos',
  'registration': '2023002'},
 {'activeLoans': 0,
  'course': 'Direito',
  'email': 'pedro@escola.com',
  'id': 3,
  'name': 'Pedro Andrade',
  'registration': '2023003'},
 {'activeLoans': 2,
  'course': 'Arquitetura',
  'email': 'ana@escola.com',
  'id': 4,
  'name': 'Ana Oliveira',
  'registration': '2023004'},
 {'activeLoans': 0,
  'course': 'Computação',
  'email': 'lucas@escola.com',
  'id': 5,
  'name': 'Lucas Pereira',
  'registration': '2023005'}];

let loans = JSON.parse(localStorage.getItem('libraryLoans')) || [
    { 
        id: 1, 
        studentId: 1, 
        bookId: 2, 
        loanDate: "2024-03-01", 
        dueDate: "2024-03-15", 
        returnDate: null, 
        status: "active" 
    },
    // Adicione um empréstimo atrasado para teste
    { 
        id: 2, 
        studentId: 4, 
        bookId: 1, 
        loanDate: "2024-03-05", 
        dueDate: "2024-03-12",  // Data passada
        returnDate: null, 
        status: "active" 
    }
];

// Variáveis para controle de paginação
let currentBookPage = 1;
let currentLoanPage = 1;
let currentStudentPage = 1;
const itemsPerPage = 5;

// Elementos DOM
const loginScreen = document.getElementById('loginScreen');
const mainSystem = document.getElementById('mainSystem');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const currentUser = document.getElementById('currentUser');
const navTabs = document.querySelectorAll('.nav-tab');
const tabContents = document.querySelectorAll('.tab-content');
const alertContainer = document.getElementById('alertContainer');
const confirmationModal = document.getElementById('confirmationModal');
const modalTitle = document.getElementById('modalTitle');
const modalMessage = document.getElementById('modalMessage');
const confirmAction = document.getElementById('confirmAction');
const cancelAction = document.getElementById('cancelAction');
const closeModal = document.querySelector('.close-modal');

// FUNÇÃO PARA GERAR IDs ÚNICOS
function generateUniqueId(items) {
    if (items.length === 0) return 1;
    const maxId = Math.max(...items.map(item => item.id), 0);
    return maxId + 1;
}

// FUNÇÃO PARA SALVAR DADOS NO LOCAL STORAGE
function saveData() {
    try {
        localStorage.setItem('libraryBooks', JSON.stringify(books));
        localStorage.setItem('libraryStudents', JSON.stringify(students));
        localStorage.setItem('libraryLoans', JSON.stringify(loans));
    } catch (e) {
        console.error('Erro ao salvar dados:', e);
        showAlert('Erro ao salvar dados. O armazenamento pode estar cheio.', 'error');
    }
}

// FUNÇÃO PARA VERIFICAR EMPRÉSTIMOS ATRASADOS
function checkOverdueLoans() {
    const today = new Date().toISOString().split('T')[0];
    let updated = false;
    
    loans.forEach(loan => {
        if (loan.status === 'active' && loan.dueDate < today) {
            loan.status = 'overdue';
            updated = true;
            
            // Atualizar também o status do livro
            const book = books.find(b => b.id === loan.bookId);
            if (book && book.status !== 'overdue') {
                book.status = 'overdue';
            }
        }
    });
    
    if (updated) {
        saveData();
        updateStatistics();
        
        // Atualizar tabelas se estiverem visíveis
        if (document.getElementById('loans').classList.contains('active')) {
            renderLoansTable();
        }
        if (document.getElementById('dashboard').classList.contains('active')) {
            renderDueSoonLoans();
        }
    }
}

// FUNÇÃO PARA CANCELAR EDIÇÃO
function cancelEdit() {
    clearBookForm();
    clearStudentForm();
    
    // Restaurar botões para estado original
    const addBookBtn = document.getElementById('addBookBtn');
    addBookBtn.textContent = 'Cadastrar Livro';
    addBookBtn.onclick = addBook;
    
    const addStudentBtn = document.getElementById('addStudentBtn');
    addStudentBtn.textContent = 'Cadastrar Aluno';
    addStudentBtn.onclick = addStudent;
    
    showAlert('Edição cancelada.', 'warning');
}

// Inicialização do sistema
document.addEventListener('DOMContentLoaded', function() {
    checkOverdueLoans(); // Verificar empréstimos atrasados
    setInterval(checkOverdueLoans, 60000); // Verificar a cada minuto
    
    // Event Listeners
    loginBtn.addEventListener('click', handleLogin);
    logoutBtn.addEventListener('click', handleLogout);
    
    navTabs.forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });
    
    // Botões de ação rápida
    document.querySelectorAll('[data-tab]').forEach(button => {
        button.addEventListener('click', function() {
            switchTab(this.dataset.tab);
        });
    });
    
    // Modal
    closeModal.addEventListener('click', closeConfirmationModal);
    cancelAction.addEventListener('click', closeConfirmationModal);
    confirmAction.addEventListener('click', executeConfirmedAction);
    
    // Eventos de livros
    document.getElementById('addBookBtn').addEventListener('click', addBook);
    document.getElementById('searchBookBtn').addEventListener('click', searchBooks);
    document.getElementById('clearBookSearch').addEventListener('click', clearBookSearch);
    
    // Eventos de empréstimos
    document.getElementById('registerLoanBtn').addEventListener('click', registerLoan);
    document.getElementById('registerReturnBtn').addEventListener('click', registerReturn);
    document.getElementById('searchLoanBtn').addEventListener('click', searchLoans);
    document.getElementById('clearLoanSearch').addEventListener('click', clearLoanSearch);
    
    // Eventos de alunos
    document.getElementById('addStudentBtn').addEventListener('click', addStudent);
    document.getElementById('searchStudentBtn').addEventListener('click', searchStudents);
    document.getElementById('clearStudentSearch').addEventListener('click', clearStudentSearch);
    
    // Eventos de relatórios
    document.getElementById('generatePopularBooks').addEventListener('click', generatePopularBooksReport);
    document.getElementById('generateOverdueReport').addEventListener('click', generateOverdueReport);
    document.getElementById('generateLoanHistory').addEventListener('click', generateLoanHistory);
    
    // Carregar dados iniciais
    updateStatistics();
    renderBooksTable();
    renderLoansTable();
    renderStudentsTable();
    renderDueSoonLoans();
});

// Funções de autenticação
function handleLogin() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const userRole = document.getElementById('userRole').value;
    
    if (username && password) {
        loginScreen.classList.add('hidden');
        mainSystem.classList.remove('hidden');
        currentUser.textContent = `${username} (${userRole})`;
        showAlert('Login realizado com sucesso!', 'success');
    } else {
        showAlert('Por favor, preencha todos os campos!', 'error');
    }
}

function handleLogout() {
    mainSystem.classList.add('hidden');
    loginScreen.classList.remove('hidden');
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
}

// Navegação entre abas
function switchTab(tabName) {
    // Remover classe active de todas as abas e conteúdos
    navTabs.forEach(tab => tab.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));
    
    // Adicionar classe active à aba e conteúdo selecionados
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(tabName).classList.add('active');
    
    // Atualizar dados específicos da aba se necessário
    if (tabName === 'dashboard') {
        updateStatistics();
        renderDueSoonLoans();
    } else if (tabName === 'books') {
        renderBooksTable();
    } else if (tabName === 'loans') {
        renderLoansTable();
    } else if (tabName === 'students') {
        renderStudentsTable();
    }
}

// Sistema de alertas
function showAlert(message, type) {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.innerHTML = `
        <span>${type === 'success' ? '✓' : type === 'error' ? '✗' : '⚠'}</span>
        <span>${message}</span>
    `;
    
    alertContainer.appendChild(alert);
    
    // Remover alerta após 5 segundos
    setTimeout(() => {
        alert.remove();
    }, 5000);
}

// Modal de confirmação
let pendingAction = null;

function showConfirmationModal(title, message, action) {
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    pendingAction = action;
    confirmationModal.style.display = 'flex';
}

function closeConfirmationModal() {
    confirmationModal.style.display = 'none';
    pendingAction = null;
}

function executeConfirmedAction() {
    if (pendingAction) {
        pendingAction();
    }
    closeConfirmationModal();
}

// Funções para livros
function addBook() {
    const isbn = document.getElementById('isbn').value.trim();
    const title = document.getElementById('title').value.trim();
    const author = document.getElementById('author').value.trim();
    const year = document.getElementById('publicationYear').value;
    const category = document.getElementById('category').value;
    const publisher = document.getElementById('publisher').value.trim();
    
    if (!isbn || !title || !author || !year) {
        showAlert('Por favor, preencha todos os campos obrigatórios!', 'error');
        return;
    }
    
    // Validar ano
    const currentYear = new Date().getFullYear();
    if (year < 1000 || year > currentYear) {
        showAlert(`Por favor, insira um ano válido (1000-${currentYear})!`, 'error');
        return;
    }
    
    // Validar ISBN (formato básico)
    if (!/^[0-9\-]+$/.test(isbn)) {
        showAlert('ISBN deve conter apenas números e hífens!', 'error');
        return;
    }
    
    // Verificar se ISBN já existe
    const existingBook = books.find(book => book.isbn === isbn);
    if (existingBook) {
        showAlert('Já existe um livro com este ISBN cadastrado!', 'error');
        return;
    }
    
    const newBook = {
        id: generateUniqueId(books),
        isbn,
        title,
        author,
        year: parseInt(year),
        category,
        publisher,
        status: 'available'
    };
    
    books.push(newBook);
    saveData();
    renderBooksTable();
    updateStatistics();
    clearBookForm();
    
    showAlert('Livro cadastrado com sucesso!', 'success');
}

function clearBookForm() {
    document.getElementById('isbn').value = '';
    document.getElementById('title').value = '';
    document.getElementById('author').value = '';
    document.getElementById('publicationYear').value = '';
    document.getElementById('category').value = '';
    document.getElementById('publisher').value = '';
}

function editBook(bookId) {
    const book = books.find(b => b.id === bookId);
    if (book) {
        document.getElementById('isbn').value = book.isbn;
        document.getElementById('title').value = book.title;
        document.getElementById('author').value = book.author;
        document.getElementById('publicationYear').value = book.year;
        document.getElementById('category').value = book.category;
        document.getElementById('publisher').value = book.publisher;
        
        // Alterar o botão para "Atualizar Livro"
        const addButton = document.getElementById('addBookBtn');
        addButton.textContent = 'Atualizar Livro';
        addButton.onclick = function() { updateBook(bookId); };
        
        // Rolar para o formulário
        document.getElementById('books').scrollIntoView({ behavior: 'smooth' });
    }
}

function updateBook(bookId) {
    const isbn = document.getElementById('isbn').value.trim();
    const title = document.getElementById('title').value.trim();
    const author = document.getElementById('author').value.trim();
    const year = document.getElementById('publicationYear').value;
    const category = document.getElementById('category').value;
    const publisher = document.getElementById('publisher').value.trim();
    
    if (!isbn || !title || !author || !year) {
        showAlert('Por favor, preencha todos os campos obrigatórios!', 'error');
        return;
    }
    
    // Validar ano
    const currentYear = new Date().getFullYear();
    if (year < 1000 || year > currentYear) {
        showAlert(`Por favor, insira um ano válido (1000-${currentYear})!`, 'error');
        return;
    }
    
    const bookIndex = books.findIndex(b => b.id === bookId);
    if (bookIndex !== -1) {
        // Verificar se o ISBN já existe em outro livro
        const existingBook = books.find(book => book.isbn === isbn && book.id !== bookId);
        if (existingBook) {
            showAlert('Já existe outro livro com este ISBN!', 'error');
            return;
        }
        
        books[bookIndex] = {
            ...books[bookIndex],
            isbn,
            title,
            author,
            year: parseInt(year),
            category,
            publisher
        };
        
        saveData();
        renderBooksTable();
        clearBookForm();
        
        // Restaurar o botão para "Cadastrar Livro"
        const addButton = document.getElementById('addBookBtn');
        addButton.textContent = 'Cadastrar Livro';
        addButton.onclick = addBook;
        
        showAlert('Livro atualizado com sucesso!', 'success');
    } else {
        showAlert('Livro não encontrado!', 'error');
    }
}

function deleteBook(bookId) {
    const book = books.find(b => b.id === bookId);
    if (!book) {
        showAlert('Livro não encontrado!', 'error');
        return;
    }
    
    // Verificar se o livro está emprestado
    const activeLoan = loans.find(loan => loan.bookId === bookId && (loan.status === 'active' || loan.status === 'overdue'));
    if (activeLoan) {
        showAlert('Não é possível excluir um livro que está emprestado!', 'error');
        return;
    }
    
    showConfirmationModal(
        'Excluir Livro',
        'Tem certeza que deseja excluir este livro? Esta ação não pode ser desfeita.',
        function() {
            const bookIndex = books.findIndex(b => b.id === bookId);
            if (bookIndex !== -1) {
                books.splice(bookIndex, 1);
                saveData();
                renderBooksTable();
                updateStatistics();
                showAlert('Livro excluído com sucesso!', 'success');
            } else {
                showAlert('Erro ao excluir livro!', 'error');
            }
        }
    );
}

function searchBooks() {
    const searchTerm = document.getElementById('bookSearch').value.toLowerCase();
    currentBookPage = 1;
    renderBooksTable(searchTerm);
}

function clearBookSearch() {
    document.getElementById('bookSearch').value = '';
    currentBookPage = 1;
    renderBooksTable();
}

function renderBooksTable(searchTerm = '') {
    const tbody = document.getElementById('booksTable').querySelector('tbody');
    tbody.innerHTML = '';
    
    let filteredBooks = books;
    
    if (searchTerm) {
        filteredBooks = books.filter(book => 
            book.title.toLowerCase().includes(searchTerm) ||
            book.author.toLowerCase().includes(searchTerm) ||
            book.isbn.toLowerCase().includes(searchTerm)
        );
    }
    
    const startIndex = (currentBookPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedBooks = filteredBooks.slice(startIndex, endIndex);
    
    if (paginatedBooks.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty-state">Nenhum livro encontrado</td></tr>';
    } else {
        paginatedBooks.forEach(book => {
            const statusClass = book.status === 'available' ? 'status-available' : 
                              book.status === 'borrowed' ? 'status-borrowed' : 'status-overdue';
            const statusText = book.status === 'available' ? 'Disponível' : 
                             book.status === 'borrowed' ? 'Emprestado' : 'Atrasado';
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${book.isbn}</td>
                <td>${book.title}</td>
                <td>${book.author}</td>
                <td>${book.year}</td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                <td>
                    <button class="btn btn-primary" onclick="editBook(${book.id})">Editar</button>
                    <button class="btn btn-danger" onclick="deleteBook(${book.id})">Excluir</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }
    
    renderPagination('bookPagination', filteredBooks.length, currentBookPage, 'book');
}

// Funções para empréstimos
function registerLoan() {
    const studentRegistration = document.getElementById('studentId').value.trim();
    const bookCode = document.getElementById('bookCode').value.trim();
    const loanDays = parseInt(document.getElementById('loanDays').value);
    
    if (!studentRegistration || !bookCode) {
        showAlert('Por favor, preencha todos os campos!', 'error');
        return;
    }
    
    // Verificar se o aluno existe
    const student = students.find(s => s.registration === studentRegistration);
    if (!student) {
        showAlert('Aluno não encontrado!', 'error');
        return;
    }
    
    // Verificar se o livro existe
    const book = books.find(b => b.isbn === bookCode);
    if (!book) {
        showAlert('Livro não encontrado!', 'error');
        return;
    }
    
    // Verificar se o livro está disponível
    if (book.status !== 'available') {
        showAlert('Este livro não está disponível para empréstimo!', 'error');
        return;
    }
    
    // Calcular datas CORRETAMENTE
    const loanDate = new Date();
    const dueDate = new Date(loanDate);
    dueDate.setDate(loanDate.getDate() + loanDays);
    
    // Formatar datas para YYYY-MM-DD
    const formatDate = (date) => {
        return date.toISOString().split('T')[0];
    };
    
    const newLoan = {
        id: generateUniqueId(loans),
        studentId: student.id,
        bookId: book.id,
        loanDate: formatDate(loanDate),
        dueDate: formatDate(dueDate),
        returnDate: null,
        status: 'active'
    };
    
    loans.push(newLoan);
    
    // Atualizar status do livro
    book.status = 'borrowed';
    
    // Atualizar contador de empréstimos do aluno
    student.activeLoans++;
    
    saveData();
    renderLoansTable();
    updateStatistics();
    clearLoanForm();
    
    showAlert('Empréstimo registrado com sucesso!', 'success');
}

function registerReturn() {
    const bookCode = document.getElementById('returnBookCode').value.trim();
    
    if (!bookCode) {
        showAlert('Por favor, informe o código do livro!', 'error');
        return;
    }
    
    // Verificar se o livro existe
    const book = books.find(b => b.isbn === bookCode);
    if (!book) {
        showAlert('Livro não encontrado!', 'error');
        return;
    }
    
    // Verificar se o livro está emprestado
    const activeLoan = loans.find(loan => loan.bookId === book.id && (loan.status === 'active' || loan.status === 'overdue'));
    if (!activeLoan) {
        showAlert('Este livro não está emprestado atualmente!', 'error');
        return;
    }
    
    // Atualizar empréstimo
    activeLoan.returnDate = new Date().toISOString().split('T')[0];
    activeLoan.status = 'returned';
    
    // Atualizar status do livro
    book.status = 'available';
    
    // Atualizar contador de empréstimos do aluno
    const student = students.find(s => s.id === activeLoan.studentId);
    if (student) {
        student.activeLoans--;
    }
    
    saveData();
    renderLoansTable();
    updateStatistics();
    document.getElementById('returnBookCode').value = '';
    
    showAlert('Devolução registrada com sucesso!', 'success');
}

function searchLoans() {
    const searchTerm = document.getElementById('loanSearch').value.toLowerCase();
    const statusFilter = document.getElementById('loanStatusFilter').value;
    currentLoanPage = 1;
    renderLoansTable(searchTerm, statusFilter);
}

function clearLoanSearch() {
    document.getElementById('loanSearch').value = '';
    document.getElementById('loanStatusFilter').value = '';
    currentLoanPage = 1;
    renderLoansTable();
}

function renderLoansTable(searchTerm = '', statusFilter = '') {
    const tbody = document.getElementById('loansTable').querySelector('tbody');
    tbody.innerHTML = '';
    
    let filteredLoans = loans.map(loan => {
        const student = students.find(s => s.id === loan.studentId);
        const book = books.find(b => b.id === loan.bookId);
        return {
            ...loan,
            studentName: student ? student.name : 'N/A',
            bookTitle: book ? book.title : 'N/A'
        };
    });
    
    if (searchTerm) {
        filteredLoans = filteredLoans.filter(loan => 
            loan.studentName.toLowerCase().includes(searchTerm) ||
            loan.bookTitle.toLowerCase().includes(searchTerm)
        );
    }
    
    if (statusFilter) {
        filteredLoans = filteredLoans.filter(loan => loan.status === statusFilter);
    }
    
    const startIndex = (currentLoanPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedLoans = filteredLoans.slice(startIndex, endIndex);
    
    if (paginatedLoans.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty-state">Nenhum empréstimo encontrado</td></tr>';
    } else {
        paginatedLoans.forEach(loan => {
            const statusClass = loan.status === 'active' ? 'status-available' : 
                              loan.status === 'overdue' ? 'status-overdue' : 'status-borrowed';
            const statusText = loan.status === 'active' ? 'Ativo' : 
                             loan.status === 'overdue' ? 'Atrasado' : 'Devolvido';
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${loan.studentName}</td>
                <td>${loan.bookTitle}</td>
                <td>${loan.loanDate}</td>
                <td>${loan.dueDate}</td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                <td>
                    ${loan.status === 'active' || loan.status === 'overdue' ? 
                        `<button class="btn btn-warning" onclick="renewLoan(${loan.id})">Renovar</button>` : 
                        ''
                    }
                </td>
            `;
            tbody.appendChild(row);
        });
    }
    
    renderPagination('loanPagination', filteredLoans.length, currentLoanPage, 'loan');
}

// Funções para alunos
function addStudent() {
    const registration = document.getElementById('studentRegistration').value.trim();
    const name = document.getElementById('studentName').value.trim();
    const email = document.getElementById('studentEmail').value.trim();
    const course = document.getElementById('studentCourse').value.trim();
    
    if (!registration || !name || !email || !course) {
        showAlert('Por favor, preencha todos os campos!', 'error');
        return;
    }
    
    // Validação de e-mail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showAlert('Por favor, insira um e-mail válido!', 'error');
        return;
    }
    
    // Verificar se a matrícula já existe
    const existingStudent = students.find(student => student.registration === registration);
    if (existingStudent) {
        showAlert('Já existe um aluno com esta matrícula!', 'error');
        return;
    }
    
    const newStudent = {
        id: generateUniqueId(students),
        registration,
        name,
        email,
        course,
        activeLoans: 0
    };
    
    students.push(newStudent);
    saveData();
    renderStudentsTable();
    updateStatistics();
    clearStudentForm();
    
    showAlert('Aluno cadastrado com sucesso!', 'success');
}

function clearStudentForm() {
    document.getElementById('studentRegistration').value = '';
    document.getElementById('studentName').value = '';
    document.getElementById('studentEmail').value = '';
    document.getElementById('studentCourse').value = '';
}

function editStudent(studentId) {
    const student = students.find(s => s.id === studentId);
    if (student) {
        document.getElementById('studentRegistration').value = student.registration;
        document.getElementById('studentName').value = student.name;
        document.getElementById('studentEmail').value = student.email;
        document.getElementById('studentCourse').value = student.course;
        
        // Alterar o botão para "Atualizar Aluno"
        const addButton = document.getElementById('addStudentBtn');
        addButton.textContent = 'Atualizar Aluno';
        addButton.onclick = function() { updateStudent(studentId); };
        
        // Rolar para o formulário
        document.getElementById('students').scrollIntoView({ behavior: 'smooth' });
    }
}

function updateStudent(studentId) {
    const registration = document.getElementById('studentRegistration').value.trim();
    const name = document.getElementById('studentName').value.trim();
    const email = document.getElementById('studentEmail').value.trim();
    const course = document.getElementById('studentCourse').value.trim();
    
    if (!registration || !name || !email || !course) {
        showAlert('Por favor, preencha todos os campos!', 'error');
        return;
    }
    
    // Validação de e-mail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showAlert('Por favor, insira um e-mail válido!', 'error');
        return;
    }
    
    const studentIndex = students.findIndex(s => s.id === studentId);
    if (studentIndex !== -1) {
        // Verificar se a matrícula já existe em outro aluno
        const existingStudent = students.find(student => student.registration === registration && student.id !== studentId);
        if (existingStudent) {
            showAlert('Já existe outro aluno com esta matrícula!', 'error');
            return;
        }
        
        students[studentIndex] = {
            ...students[studentIndex],
            registration,
            name,
            email,
            course
        };
        
        saveData();
        renderStudentsTable();
        clearStudentForm();
        
        // Restaurar o botão para "Cadastrar Aluno"
        const addButton = document.getElementById('addStudentBtn');
        addButton.textContent = 'Cadastrar Aluno';
        addButton.onclick = addStudent;
        
        showAlert('Aluno atualizado com sucesso!', 'success');
    } else {
        showAlert('Aluno não encontrado!', 'error');
    }
}

function deleteStudent(studentId) {
    const student = students.find(s => s.id === studentId);
    if (!student) {
        showAlert('Aluno não encontrado!', 'error');
        return;
    }
    
    // Verificar se o aluno tem empréstimos ativos
    if (student.activeLoans > 0) {
        showAlert('Não é possível excluir um aluno com empréstimos ativos!', 'error');
        return;
    }
    
    showConfirmationModal(
        'Excluir Aluno',
        'Tem certeza que deseja excluir este aluno? Esta ação não pode ser desfeita.',
        function() {
            const studentIndex = students.findIndex(s => s.id === studentId);
            if (studentIndex !== -1) {
                students.splice(studentIndex, 1);
                saveData();
                renderStudentsTable();
                updateStatistics();
                showAlert('Aluno excluído com sucesso!', 'success');
            } else {
                showAlert('Erro ao excluir aluno!', 'error');
            }
        }
    );
}

function searchStudents() {
    const searchTerm = document.getElementById('studentSearch').value.toLowerCase();
    currentStudentPage = 1;
    renderStudentsTable(searchTerm);
}

function clearStudentSearch() {
    document.getElementById('studentSearch').value = '';
    currentStudentPage = 1;
    renderStudentsTable();
}

function renderStudentsTable(searchTerm = '') {
    const tbody = document.getElementById('studentsTable').querySelector('tbody');
    tbody.innerHTML = '';
    
    let filteredStudents = students;
    
    if (searchTerm) {
        filteredStudents = students.filter(student => 
            student.name.toLowerCase().includes(searchTerm) ||
            student.registration.toLowerCase().includes(searchTerm)
        );
    }
    
    const startIndex = (currentStudentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedStudents = filteredStudents.slice(startIndex, endIndex);
    
    if (paginatedStudents.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty-state">Nenhum aluno encontrado</td></tr>';
    } else {
        paginatedStudents.forEach(student => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${student.registration}</td>
                <td>${student.name}</td>
                <td>${student.course}</td>
                <td>${student.email}</td>
                <td>${student.activeLoans}</td>
                <td>
                    <button class="btn btn-primary" onclick="editStudent(${student.id})">Editar</button>
                    <button class="btn btn-danger" onclick="deleteStudent(${student.id})">Excluir</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }
    
    renderPagination('studentPagination', filteredStudents.length, currentStudentPage, 'student');
}

// Funções para relatórios
function generatePopularBooksReport() {
    const reportContent = document.getElementById('reportContent');
    const reportTitle = document.getElementById('reportTitle');
    
    reportTitle.textContent = 'Livros Mais Populares';
    
    // Contar empréstimos por livro
    const bookLoans = {};
    loans.forEach(loan => {
        if (!bookLoans[loan.bookId]) {
            bookLoans[loan.bookId] = 0;
        }
        bookLoans[loan.bookId]++;
    });
    
    // Ordenar por popularidade
    const popularBooks = Object.keys(bookLoans)
        .map(bookId => {
            const book = books.find(b => b.id === parseInt(bookId));
            return {
                title: book ? book.title : 'Livro Desconhecido',
                author: book ? book.author : 'Autor Desconhecido',
                loans: bookLoans[bookId]
            };
        })
        .sort((a, b) => b.loans - a.loans);
    
    if (popularBooks.length === 0) {
        reportContent.innerHTML = '<p class="empty-state">Nenhum dado de empréstimo disponível.</p>';
    } else {
        let html = '<table><thead><tr><th>Posição</th><th>Livro</th><th>Autor</th><th>Nº de Empréstimos</th></tr></thead><tbody>';
        
        popularBooks.forEach((book, index) => {
            html += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${book.title}</td>
                    <td>${book.author}</td>
                    <td>${book.loans}</td>
                </tr>
            `;
        });
        
        html += '</tbody></table>';
        reportContent.innerHTML = html;
    }
}

function generateOverdueReport() {
    const reportContent = document.getElementById('reportContent');
    const reportTitle = document.getElementById('reportTitle');
    
    reportTitle.textContent = 'Empréstimos Atrasados';
    
    const today = new Date().toISOString().split('T')[0];
    const overdueLoans = loans
        .map(loan => {
            const student = students.find(s => s.id === loan.studentId);
            const book = books.find(b => b.id === loan.bookId);
            return {
                ...loan,
                studentName: student ? student.name : 'N/A',
                bookTitle: book ? book.title : 'N/A'
            };
        })
        .filter(loan => loan.status === 'overdue' || (loan.status === 'active' && loan.dueDate < today));
    
    if (overdueLoans.length === 0) {
        reportContent.innerHTML = '<p class="empty-state">Nenhum empréstimo atrasado.</p>';
    } else {
        let html = '<table><thead><tr><th>Aluno</th><th>Livro</th><th>Data de Empréstimo</th><th>Data de Devolução</th><th>Dias em Atraso</th></tr></thead><tbody>';
        
        overdueLoans.forEach(loan => {
            const dueDate = new Date(loan.dueDate);
            const today = new Date();
            const timeDiff = today.getTime() - dueDate.getTime();
            const daysOverdue = Math.max(0, Math.floor(timeDiff / (1000 * 3600 * 24)));
            
            html += `
                <tr>
                    <td>${loan.studentName}</td>
                    <td>${loan.bookTitle}</td>
                    <td>${loan.loanDate}</td>
                    <td>${loan.dueDate}</td>
                    <td>${daysOverdue}</td>
                </tr>
            `;
        });
        
        html += '</tbody></table>';
        reportContent.innerHTML = html;
    }
}

function generateLoanHistory() {
    const reportContent = document.getElementById('reportContent');
    const reportTitle = document.getElementById('reportTitle');
    
    reportTitle.textContent = 'Histórico de Empréstimos';
    
    const loanHistory = loans
        .map(loan => {
            const student = students.find(s => s.id === loan.studentId);
            const book = books.find(b => b.id === loan.bookId);
            return {
                ...loan,
                studentName: student ? student.name : 'N/A',
                bookTitle: book ? book.title : 'N/A'
            };
        })
        .sort((a, b) => new Date(b.loanDate) - new Date(a.loanDate));
    
    if (loanHistory.length === 0) {
        reportContent.innerHTML = '<p class="empty-state">Nenhum empréstimo registrado.</p>';
    } else {
        let html = '<table><thead><tr><th>Aluno</th><th>Livro</th><th>Data de Empréstimo</th><th>Data de Devolução</th><th>Status</th></tr></thead><tbody>';
        
        loanHistory.forEach(loan => {
            const statusText = loan.status === 'active' ? 'Ativo' : 
                             loan.status === 'overdue' ? 'Atrasado' : 'Devolvido';
            
            html += `
                <tr>
                    <td>${loan.studentName}</td>
                    <td>${loan.bookTitle}</td>
                    <td>${loan.loanDate}</td>
                    <td>${loan.returnDate || 'Não devolvido'}</td>
                    <td>${statusText}</td>
                </tr>
            `;
        });
        
        html += '</tbody></table>';
        reportContent.innerHTML = html;
    }
}

// Funções auxiliares
function updateStatistics() {
    document.getElementById('totalStudents').textContent = students.length;
    document.getElementById('totalBooks').textContent = books.length;
    
    // CORREÇÃO: Empréstimos ativos incluem tanto 'active' quanto 'overdue'
    const activeLoansCount = loans.filter(loan => 
        loan.status === 'active' || loan.status === 'overdue'
    ).length;
    document.getElementById('activeLoans').textContent = activeLoansCount;
    
    document.getElementById('totalLoans').textContent = loans.length;
    document.getElementById('availableBooks').textContent = books.filter(book => book.status === 'available').length;
    
    // CORREÇÃO: Empréstimos atrasados são apenas os com status 'overdue'
    const overdueLoansCount = loans.filter(loan => loan.status === 'overdue').length;
    document.getElementById('overdueLoans').textContent = overdueLoansCount;
}

function renderDueSoonLoans() {
    const tbody = document.getElementById('dueSoonTable').querySelector('tbody');
    tbody.innerHTML = '';
    
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    
    const dueSoonLoans = loans
        .filter(loan => loan.status === 'active' || loan.status === 'overdue')
        .map(loan => {
            const student = students.find(s => s.id === loan.studentId);
            const book = books.find(b => b.id === loan.bookId);
            return {
                ...loan,
                studentName: student ? student.name : 'N/A',
                bookTitle: book ? book.title : 'N/A',
                dueDateObj: new Date(loan.dueDate)
            };
        })
        .sort((a, b) => a.dueDateObj - b.dueDateObj);
    
    if (dueSoonLoans.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="empty-state">Nenhum empréstimo próximo do vencimento</td></tr>';
    } else {
        dueSoonLoans.forEach(loan => {
            const daysUntilDue = Math.ceil((loan.dueDateObj - today) / (1000 * 60 * 60 * 24));
            let statusText, statusClass;
            
            if (daysUntilDue < 0) {
                statusText = `Atrasado há ${Math.abs(daysUntilDue)} dia(s)`;
                statusClass = 'status-overdue';
            } else if (daysUntilDue === 0) {
                statusText = 'Vence hoje';
                statusClass = 'status-overdue';
            } else {
                statusText = `Vence em ${daysUntilDue} dia(s)`;
                statusClass = daysUntilDue <= 2 ? 'status-overdue' : 'status-borrowed';
            }
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${loan.studentName}</td>
                <td>${loan.bookTitle}</td>
                <td>${loan.dueDate}</td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            `;
            tbody.appendChild(row);
        });
    }
}

function clearLoanForm() {
    document.getElementById('studentId').value = '';
    document.getElementById('bookCode').value = '';
}

function renewLoan(loanId) {
    const loan = loans.find(l => l.id === loanId);
    if (!loan) {
        showAlert('Empréstimo não encontrado!', 'error');
        return;
    }
    
    // Adicionar 7 dias à data de devolução
    const dueDate = new Date(loan.dueDate);
    dueDate.setDate(dueDate.getDate() + 7);
    loan.dueDate = dueDate.toISOString().split('T')[0];
    
    // Se estava atrasado, voltar para ativo
    if (loan.status === 'overdue') {
        loan.status = 'active';
        
        // Atualizar também o status do livro
        const book = books.find(b => b.id === loan.bookId);
        if (book) {
            book.status = 'borrowed';
        }
    }
    
    saveData();
    renderLoansTable();
    updateStatistics();
    showAlert('Empréstimo renovado com sucesso!', 'success');
}

function renderPagination(containerId, totalItems, currentPage, type) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    if (totalPages <= 1) return;
    
    // Botão anterior
    if (currentPage > 1) {
        const prevButton = document.createElement('button');
        prevButton.className = 'page-btn';
        prevButton.textContent = '«';
        prevButton.onclick = () => changePage(currentPage - 1, type);
        container.appendChild(prevButton);
    }
    
    // Páginas
    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.className = `page-btn ${i === currentPage ? 'active' : ''}`;
        pageButton.textContent = i;
        pageButton.onclick = () => changePage(i, type);
        container.appendChild(pageButton);
    }
    
    // Botão próximo
    if (currentPage < totalPages) {
        const nextButton = document.createElement('button');
        nextButton.className = 'page-btn';
        nextButton.textContent = '»';
        nextButton.onclick = () => changePage(currentPage + 1, type);
        container.appendChild(nextButton);
    }
}

function changePage(page, type) {
    if (type === 'book') {
        currentBookPage = page;
        renderBooksTable(document.getElementById('bookSearch').value);
    } else if (type === 'loan') {
        currentLoanPage = page;
        renderLoansTable(
            document.getElementById('loanSearch').value,
            document.getElementById('loanStatusFilter').value
        );
    } else if (type === 'student') {
        currentStudentPage = page;
        renderStudentsTable(document.getElementById('studentSearch').value);
    }
}