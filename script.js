document.addEventListener("DOMContentLoaded", async function() {
    const SQL = await initSqlJs({ locateFile: file => `https://cdn.jsdelivr.net/npm/sql.js/dist/${file}` });

    function loadDatabase() {
        let db;
        const dbFile = localStorage.getItem("db");
        if (dbFile) {
            const fileBuffer = new Uint8Array(atob(dbFile).split("").map(c => c.charCodeAt(0)));
            db = new SQL.Database(fileBuffer);
        } else {
            db = new SQL.Database();
            db.run(`
                CREATE TABLE IF NOT EXISTS users (
                    username TEXT PRIMARY KEY,
                    password TEXT NOT NULL,
                    accessLevel TEXT NOT NULL
                );
            `);
        }
        return db;
    }

    const db = loadDatabase();
    function saveDatabase() {
        const data = db.export();
        localStorage.setItem("db", btoa(String.fromCharCode.apply(null, new Uint8Array(data))));
    }

    document.getElementById("registerFormContent").addEventListener("submit", function(event) {
        event.preventDefault(); 

        const username = document.getElementById("nome_completo").value;
        const password = document.getElementById("senha").value;
        const accessLevel = document.getElementById("cargo").value;

        try {
            db.run("INSERT INTO users (username, password, accessLevel) VALUES (?, ?, ?)", [username, password, accessLevel]);
            saveDatabase();
            alert("Usuário cadastrado com sucesso!");
            document.getElementById("registerSection").classList.add("hidden");
            document.getElementById("loginSection").classList.remove("hidden");
        } catch (e) {
            alert("O Usuario já exite, tente novamente !");
        }
    });

    document.getElementById("loginForm").addEventListener("submit", function(event) {
        event.preventDefault();

        const username = document.getElementById("nome_usuario").value;
        const password = document.getElementById("senha_usuario").value;

        const stmt = db.prepare("SELECT * FROM users WHERE username = ? AND password = ?");
        stmt.bind([username, password]);
        const result = stmt.step();

        if (result) {
            const user = stmt.getAsObject();
            document.getElementById("message").textContent = "Dados corretos!";
            document.getElementById("message").style.color = "green";
            localStorage.setItem("userAccessLevel", user.accessLevel);

            setTimeout(function() {
                window.location.href = "index2.html";
            }, 1000);
        } else {
            document.getElementById("message").textContent = "Usuário ou senha incorretos.";
            document.getElementById("message").style.color = "red";
        }
    });

    document.getElementById("showRegisterForm").addEventListener("click", function() {
        document.getElementById("loginSection").classList.add("hidden");
        document.getElementById("registerSection").classList.remove("hidden");
    });

    document.getElementById("showLoginForm").addEventListener("click", function() {
        document.getElementById("registerSection").classList.add("hidden");
        document.getElementById("loginSection").classList.remove("hidden");
    });
});


//index2

document.addEventListener('DOMContentLoaded', () => {
    const showAddFormBtn = document.getElementById('showAddFormBtn');
    const addForm = document.getElementById('addForm');
    const resourceForm = document.getElementById('resourceForm');
    const cancelBtn = document.getElementById('cancelBtn');
    const resourcesTableBody = document.getElementById('resourcesTableBody');
    const notificationList = document.getElementById('notificationList');
    const logoutBtn = document.getElementById('logoutBtn');

    const userAccessLevel = localStorage.getItem("userAccessLevel");

    let resources = [];
    let editingIndex = -1;

    if (userAccessLevel === "Funcionario" || userAccessLevel === "Gerente" || userAccessLevel === "Administrador") {
        showAddFormBtn.classList.remove('hidden');
    }

    showAddFormBtn.addEventListener('click', () => {
        addForm.classList.toggle('hidden');
        clearForm();
    });

    cancelBtn.addEventListener('click', () => {
        addForm.classList.add('hidden');
        clearForm();
    });
    resourceForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const code = document.getElementById('code').value;
        const category = document.getElementById('category').value;
        const name = document.getElementById('name').value;
        const quantity = document.getElementById('quantity').value;
        const description = document.getElementById('description').value;

        if (editingIndex > -1) {
            resources[editingIndex] = { code, category, name, quantity, description };
            editingIndex = -1;
        } else {
            resources.push({ code, category, name, quantity, description });
        }

        renderTable();
        addForm.classList.add('hidden');
        clearForm();
    });

    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem("userAccessLevel");
        window.location.href = "index.html";
    });

    function clearForm() {
        document.getElementById('resourceId').value = '';
        document.getElementById('code').value = '';
        document.getElementById('category').value = '';
        document.getElementById('name').value = '';
        document.getElementById('quantity').value = '';
        document.getElementById('description').value = '';
    }

    function renderTable() {
        resourcesTableBody.innerHTML = '';

        resources.forEach((resource, index) => {
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${resource.code}</td>
                <td>${resource.category}</td>
                <td>${resource.name}</td>
                <td>${resource.quantity}</td>
                <td>${resource.description}</td>
                <td>
                    <button class="editBtn" onclick="editResource(${index})">Editar</button>
                    <button class="deleteBtn" onclick="deleteResource(${index})">Excluir</button>
                </td>
            `;

            resourcesTableBody.appendChild(row);
        });
    }

    function addNotification(message) {
        const notificationItem = document.createElement('li');
        notificationItem.textContent = message;
        notificationList.appendChild(notificationItem);

        setTimeout(() => {
            notificationItem.remove();
        }, 5000);
    }

    window.editResource = (index) => {
        const resource = resources[index];
        document.getElementById('code').value = resource.code;
        document.getElementById('category').value = resource.category;
        document.getElementById('name').value = resource.name;
        document.getElementById('quantity').value = resource.quantity;
        document.getElementById('description').value = resource.description;

        addForm.classList.remove('hidden');
        editingIndex = index;
    }

    window.deleteResource = (index) => {
        resources.splice(index, 1);
        renderTable();
    }
});


document.addEventListener('DOMContentLoaded', () => {
    const showRegisterForm = document.getElementById('showRegisterForm');
    const showLoginForm = document.getElementById('showLoginForm');
    const loginSection = document.getElementById('loginSection');
    const registerSection = document.getElementById('registerSection');

    showRegisterForm.addEventListener('click', (event) => {
        event.preventDefault();
        loginSection.classList.add('hidden');
        registerSection.classList.remove('hidden');
    });

    showLoginForm.addEventListener('click', (event) => {
        event.preventDefault();
        registerSection.classList.add('hidden');
        loginSection.classList.remove('hidden');
    });
});
