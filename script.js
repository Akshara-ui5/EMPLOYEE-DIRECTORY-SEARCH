/* ---------- Sample data ---------- */
const sampleEmployees = [
  { id: "e1", name: "Alice Johnson", email: "alice@company.com", department: "Engineering", position: "Senior Engineer", phone: "+91 9876543210", skills: ["React", "Node.js"], managerId: null },
  { id: "e2", name: "Bob Smith", email: "bob@company.com", department: "HR", position: "HR Manager", phone: "+91 9123456780", skills: ["People Ops"], managerId: null },
  { id: "e3", name: "Claire Lee", email: "claire@company.com", department: "Sales", position: "Account Executive", phone: "+91 9988776655", skills: ["Negotiation"], managerId: "e2" },
  { id: "e4", name: "David Kim", email: "david@company.com", department: "Design", position: "Product Designer", phone: "+91 9001122334", skills: ["Figma", "UX"], managerId: null }
];

function uid(prefix = 'id') {
  return prefix + Math.random().toString(36).slice(2, 9);
}

/* ---------- View Navigation ---------- */
const navLinks = document.querySelectorAll('.nav-link');
navLinks.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));
    link.classList.add('active');
    showView(link.dataset.view);
  });
});

function showView(view) {
  document.querySelectorAll('main section').forEach(sec => sec.style.display = 'none');
  document.getElementById(`view-${view}`).style.display = '';

  if (view === 'dashboard') {
    document.getElementById('current-user').textContent = getCurrentUser() || 'Guest';
    renderResults();
  } else if (view === 'admin') {
    renderEmployeeTable();
  }
}

/* ---------- Auth Simulation ---------- */
function getCurrentUser() {
  return localStorage.getItem('mock_user') || null;
}

document.getElementById('login-btn').addEventListener('click', () => {
  const email = document.getElementById('login-email').value.trim();
  const pass = document.getElementById('login-pass').value.trim();
  const isAdmin = email === 'admin@company.com' && pass === 'password';

  localStorage.setItem('mock_user', isAdmin ? 'Admin' : 'User');
  alert(`Logged in as ${isAdmin ? 'Admin' : 'User'} (demo)`);
  document.querySelector('[data-view="dashboard"]').click();
});

/* ---------- Employee Data ---------- */
function loadEmployees() {
  const data = localStorage.getItem('mock_employees');
  return data ? JSON.parse(data) : sampleEmployees;
}

function saveEmployees(list) {
  localStorage.setItem('mock_employees', JSON.stringify(list));
}

/* ---------- Dashboard: Search & Filter ---------- */
document.getElementById('global-search').addEventListener('input', renderResults);
document.getElementById('filter-dept').addEventListener('change', renderResults);
document.getElementById('filter-role').addEventListener('change', renderResults);
document.getElementById('clear-filters').addEventListener('click', () => {
  document.getElementById('global-search').value = '';
  document.getElementById('filter-dept').value = '';
  document.getElementById('filter-role').value = '';
  renderResults();
});

function renderResults() {
  const q = document.getElementById('global-search').value.toLowerCase();
  const dept = document.getElementById('filter-dept').value;
  const role = document.getElementById('filter-role').value;
  const employees = loadEmployees();

  const filtered = employees.filter(emp => {
    if (dept && emp.department !== dept) return false;
    if (role && !emp.position.toLowerCase().includes(role.toLowerCase())) return false;
    return !q || (emp.name + emp.email + (emp.skills || []).join(' ')).toLowerCase().includes(q);
  });

  const html = filtered.map(emp => `
    <div class="employee-card">
      <div class="avatar">${emp.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</div>
      <div class="emp-meta">
        <h4>${emp.name}</h4>
        <p class="muted">${emp.position} • ${emp.department}</p>
        <p class="muted-sm">${emp.email} • ${emp.phone}</p>
      </div>
      <div>
        <button class="tiny-btn" onclick="openDetails('${emp.id}')">View</button>
      </div>
    </div>
  `).join('');

  document.getElementById('results').innerHTML = html || '<div class="muted-sm">No results found</div>';
}

/* ---------- Modal ---------- */
const modal = document.getElementById('modal');
const modalBody = document.getElementById('modal-body');
document.getElementById('modal-close').addEventListener('click', () => {
  modal.style.display = 'none';
  modalBody.innerHTML = '';
});

function openDetails(id) {
  const emp = loadEmployees().find(e => e.id === id);
  const manager = emp.managerId ? loadEmployees().find(e => e.id === emp.managerId) : null;
  modalBody.innerHTML = `
    <h3>${emp.name}</h3>
    <p class="muted-sm">${emp.position} • ${emp.department}</p>
    <p><strong>Email:</strong> ${emp.email}</p>
    <p><strong>Phone:</strong> ${emp.phone}</p>
    <p><strong>Skills:</strong> ${(emp.skills || []).join(', ')}</p>
    <p class="muted-sm">Manager: ${manager ? manager.name : '—'}</p>
  `;
  modal.style.display = 'flex';
}

/* ---------- Admin Panel ---------- */
document.getElementById('add-employee-btn').addEventListener('click', () => openEmployeeForm());
document.getElementById('import-sample').addEventListener('click', () => {
  saveEmployees(sampleEmployees);
  renderEmployeeTable();
  alert('Sample employees imported');
});

function renderEmployeeTable() {
  const tbody = document.getElementById('employees-tbody');
  const employees = loadEmployees();
  tbody.innerHTML = employees.map(emp => `
    <tr>
      <td>${emp.name}</td>
      <td>${emp.email}</td>
      <td>${emp.department}</td>
      <td>${emp.position}</td>
      <td>${emp.phone}</td>
      <td>
        <button class="tiny-btn" onclick="openEmployeeForm('${emp.id}')">Edit</button>
        <button class="tiny-btn" onclick="deleteEmployee('${emp.id}')">Delete</button>
      </td>
    </tr>
  `).join('');
}

function openEmployeeForm(id = null) {
  const emp = id ? loadEmployees().find(e => e.id === id) : {
    id: '', name: '', email: '', department: 'Engineering', position: '', phone: '', skills: []
  };

  modalBody.innerHTML = `
    <h3>${id ? 'Edit' : 'Add'} Employee</h3>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
      <div><label class="muted-sm">Name</label><input id="f-name" type="text" value="${emp.name}"></div>
      <div><label class="muted-sm">Email</label><input id="f-email" type="email" value="${emp.email}"></div>
      <div><label class="muted-sm">Department</label><input id="f-dept" type="text" value="${emp.department}"></div>
      <div><label class="muted-sm">Position</label><input id="f-pos" type="text" value="${emp.position}"></div>
      <div><label class="muted-sm">Phone</label><input id="f-phone" type="text" value="${emp.phone}"></div>
      <div><label class="muted-sm">Skills (comma)</label><input id="f-skills" type="text" value="${(emp.skills || []).join(', ')}"></div>
    </div>
    <div class="controls" style="margin-top:14px">
      <button class="tiny-btn" id="cancel-btn">Cancel</button>
      <button class="primary" id="save-emp">${id ? 'Save' : 'Create'}</button>
    </div>
  `;

  modal.style.display = 'flex';

  document.getElementById('cancel-btn').addEventListener('click', () => {
    modal.style.display = 'none';
    modalBody.innerHTML = '';
  });

  document.getElementById('save-emp').addEventListener('click', () => {
    const updated = {
      id: id || uid('emp'),
      name: document.getElementById('f-name').value.trim(),
      email: document.getElementById('f-email').value.trim(),
      department: document.getElementById('f-dept').value.trim(),
      position: document.getElementById('f-pos').value.trim(),
      phone: document.getElementById('f-phone').value.trim(),
      skills: document.getElementById('f-skills').value.trim().split(',').map(s => s.trim()).filter(Boolean),
      managerId: null
    };

    let list = loadEmployees();
    if (id) {
      list = list.map(emp => emp.id === id ? updated : emp);
    } else {
      list.push(updated);
    }
    saveEmployees(list);
    modal.style.display = 'none';
    renderEmployeeTable();
    renderResults();
  });
}

function deleteEmployee(id) {
  if (confirm('Delete this employee?')) {
    const updated = loadEmployees().filter(e => e.id !== id);
    saveEmployees(updated);
    renderEmployeeTable();
    renderResults();
  }
}

/* ---------- Init ---------- */
window.addEventListener('DOMContentLoaded', () => {
  if (!localStorage.getItem('mock_employees')) {
    saveEmployees(sampleEmployees);
  }
  renderResults();
});
