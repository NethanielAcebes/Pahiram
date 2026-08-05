// --- STATE (10/100 trust, 1 lent, 1 helped) ---
const state = {
    itemsLent: 1,
    peersHelped: 1,
    trustScore: 10,
    firstName: 'Test',
    lastName: 'User',
    major: 'Computer Science',
    bio: 'Ready to help my peers.',
    recentRequests: [
        { id: 101, name: 'MacBook Charger', category: 'Tech', desc: 'USB-C Power Adapter / MagSafe. Needed ASAP for presentation!', timestamp: '5 min ago' },
        { id: 102, name: 'Scientific Calculator', category: 'Academics', desc: 'TI-84 / Casio FX series. Needed for Physics midterms today.', timestamp: '1 hour ago' }
    ]
};

// EXACT 3 requested example items. NO Sports category.
const CORE_ITEMS = [
    { id: 1, title: 'MacBook Charger', cat: 'Tech', desc: 'USB-C Power Adapter / MagSafe. Needed ASAP for presentation!' },
    { id: 2, title: 'Scientific Calculator', cat: 'Academics', desc: 'TI-84 / Casio FX series. Needed for Physics midterms today.' },
    { id: 3, title: 'Umbrella', cat: 'Utility', desc: 'Unexpected rain? Borrow a compact umbrella.' }
];

let mockLendItems = JSON.parse(JSON.stringify(CORE_ITEMS));
let mockBorrowItems = JSON.parse(JSON.stringify(CORE_ITEMS));

// --- DOM REFS ---
const dashPeers = document.getElementById('dash-peers-count');
const dashLent = document.getElementById('dash-lent-count');
const dashTrustFill = document.getElementById('dash-trust-fill');
const dashTrustLabel = document.getElementById('dash-trust-label');
const profPeers = document.getElementById('prof-peers-count');
const profLent = document.getElementById('prof-lent-count');
const profTrustFill = document.getElementById('prof-trust-fill');
const profTrustLabel = document.getElementById('prof-trust-label');
const recentList = document.getElementById('recent-requests-list');
const requestCount = document.getElementById('request-count');

function updateUI() {
    const s = state;
    dashPeers.textContent = s.peersHelped;
    dashLent.textContent = s.itemsLent;
    const trustW = Math.min(s.trustScore, 100);
    dashTrustFill.style.width = trustW + '%';
    dashTrustLabel.textContent = trustW + '/100';
    profPeers.textContent = s.peersHelped;
    profLent.textContent = s.itemsLent;
    profTrustFill.style.width = trustW + '%';
    profTrustLabel.textContent = trustW + '/100';
    document.getElementById('profile-name').textContent = s.firstName + ' ' + s.lastName;
    document.getElementById('profile-major').textContent = s.major;
    document.getElementById('profile-bio').textContent = s.bio;
    renderRecentRequests();
}

function renderRecentRequests() {
    recentList.innerHTML = '';
    if (state.recentRequests.length === 0) {
        recentList.innerHTML = '<div class="text-muted" style="padding:16px 0;">No requests yet. Be the first!</div>';
        requestCount.textContent = '0 items';
        return;
    }
    requestCount.textContent = state.recentRequests.length + ' items';
    state.recentRequests.slice(0, 6).forEach(item => {
        const div = document.createElement('div');
        div.className = 'recent-item';
        const iconClass = item.category === 'Tech' ? 'laptop' : item.category === 'Academics' ? 'graduation-cap' : 'umbrella';
        div.innerHTML = `
            <div class="recent-icon"><i class="fas fa-${iconClass}"></i></div>
            <div style="flex:1"><b>${item.name}</b><div class="text-small">${item.timestamp}</div></div>
            <div style="display:flex; align-items:center; gap:8px; flex-shrink:0;">
                <span class="badge-pill">${item.category}</span>
                <button class="item-delete" data-type="recent" data-id="${item.id}"><i class="fas fa-trash"></i></button>
            </div>`;
        recentList.appendChild(div);
    });
}

function incrementImpact() {
    state.itemsLent += 1;
    state.peersHelped += 1;
    state.trustScore = Math.min(100, state.trustScore + 10);
    updateUI();
}

function deleteItem(type, id) {
    if (type === 'recent') {
        state.recentRequests = state.recentRequests.filter(i => i.id !== id);
        renderRecentRequests();
        showToast('Item removed from Recent Requests');
    } else if (type === 'lend') {
        mockLendItems = mockLendItems.filter(i => i.id !== id);
        renderLendItems();
        showToast('Request removed from list');
    } else if (type === 'borrow') {
        mockBorrowItems = mockBorrowItems.filter(i => i.id !== id);
        renderBorrowItems();
        showToast('Item removed from list');
    }
}

// --- TOAST ---
function showToast(msg) {
    const el = document.getElementById('toast-msg');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(el._timeout);
    el._timeout = setTimeout(() => el.classList.remove('show'), 3000);
}

// --- NAVIGATION (STAY ON VIEW) ---
function navigateTo(viewId) {
    document.querySelectorAll('.view-section').forEach(v => v.classList.remove('active'));
    document.getElementById(viewId).classList.add('active');
    document.querySelectorAll('.sidebar .nav-item').forEach(n => n.classList.remove('active'));
    document.querySelector(`.sidebar .nav-item[data-view="${viewId}"]`)?.classList.add('active');
}

// --- THEME TOGGLE ---
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const icon = document.querySelector('.theme-label i');
    if(document.body.classList.contains('dark-mode')) {
        icon.className = 'fas fa-sun';
        document.querySelector('.theme-label').childNodes[2].textContent = ' Light';
    } else {
        icon.className = 'fas fa-moon';
        document.querySelector('.theme-label').childNodes[2].textContent = ' Dark';
    }
}

// --- MODALS ---
function openModal(id) { document.getElementById(id).classList.add('active'); }
function closeModal(id) { document.getElementById(id).classList.remove('active'); }

// --- RENDER GRIDS (SIDE-BY-SIDE FIX) ---
function renderLendItems() {
    const container = document.getElementById('lend-items-container');
    container.innerHTML = '';
    mockLendItems.forEach(item => {
        const card = document.createElement('div');
        card.className = 'item-card';
        const iconClass = item.cat === 'Tech' ? 'laptop' : item.cat === 'Academics' ? 'graduation-cap' : 'umbrella';
        card.innerHTML = `
            <div class="card-header-actions">
                <div class="card-header-left">
                    <div style="background:var(--badge-bg); padding:8px 12px; border-radius:40px; transition:background 0.3s;">
                        <i class="fas fa-${iconClass}"></i>
                    </div>
                </div>
                <div class="card-header-right">
                    <span class="badge-pill">${item.cat}</span>
                    <button class="item-delete" data-type="lend" data-id="${item.id}"><i class="fas fa-trash"></i></button>
                </div>
            </div>
            <h4>${item.title}</h4><p>${item.desc}</p>
            <button class="btn-mint" data-action="fulfill">Fulfill Request →</button>`;
        container.appendChild(card);
    });
}

function renderBorrowItems() {
    const container = document.getElementById('borrow-items-container');
    container.innerHTML = '';
    mockBorrowItems.forEach(item => {
        const card = document.createElement('div');
        card.className = 'item-card';
        const iconClass = item.cat === 'Tech' ? 'laptop' : item.cat === 'Academics' ? 'graduation-cap' : 'umbrella';
        card.innerHTML = `
            <div class="card-header-actions">
                <div class="card-header-left">
                    <div style="background:var(--badge-bg); padding:8px 12px; border-radius:40px; transition:background 0.3s;">
                        <i class="fas fa-${iconClass}"></i>
                    </div>
                </div>
                <div class="card-header-right">
                    <span class="badge-pill">${item.cat}</span>
                    <button class="item-delete" data-type="borrow" data-id="${item.id}"><i class="fas fa-trash"></i></button>
                </div>
            </div>
            <h4>${item.title}</h4><p>${item.desc}</p>
            <button class="btn-mint" data-action="select">Select Item →</button>`;
        container.appendChild(card);
    });
}

// --- EVENT DELEGATION ---
document.addEventListener('click', function(e) {
    const target = e.target.closest('[data-view]');
    if (target) {
        navigateTo(target.dataset.view);
        return;
    }

    const actionCard = e.target.closest('.action-card');
    if (actionCard) {
        const view = actionCard.dataset.navigate;
        if (view) navigateTo(view);
        return;
    }

    const deleteBtn = e.target.closest('.item-delete');
    if (deleteBtn) {
        const type = deleteBtn.dataset.type;
        const id = parseInt(deleteBtn.dataset.id);
        deleteItem(type, id);
        return;
    }

    const fulfillBtn = e.target.closest('[data-action="fulfill"]');
    if (fulfillBtn) {
        incrementImpact();
        showToast('Request fulfilled! +1 Impact');
        return;
    }

    const selectBtn = e.target.closest('[data-action="select"]');
    if (selectBtn) {
        incrementImpact();
        showToast('Item selected! +1 Impact');
        return;
    }

    const modalOpeners = e.target.closest('#open-offer-modal, #open-request-modal');
    if (modalOpeners) {
        const targetModal = modalOpeners.id === 'open-offer-modal' ? 'offer-modal' : 'request-modal';
        openModal(targetModal);
        return;
    }

    const closeBtns = e.target.closest('.close-modal-btn, .modal-overlay');
    if (closeBtns && closeBtns.classList.contains('modal-overlay')) {
        closeModal(closeBtns.id);
        return;
    } else if (closeBtns && closeBtns.classList.contains('close-modal-btn')) {
        const modal = closeBtns.closest('.modal-overlay');
        if (modal) closeModal(modal.id);
    }

    const themeToggle = e.target.closest('#theme-toggle');
    if (themeToggle) {
        toggleTheme();
        return;
    }
});

// --- OFFER FORM (LEND) ---
document.getElementById('offer-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const cat = document.getElementById('offer-cat').value;
    const name = document.getElementById('offer-name').value.trim();
    const desc = document.getElementById('offer-desc').value.trim();
    if (!name) return;
    mockLendItems.unshift({ id: Date.now(), title: name, cat: cat, desc: desc || 'Available for lending.' });
    renderLendItems();
    closeModal('offer-modal');
    this.reset();
    showToast('Item offered successfully!');
});

// --- REQUEST FORM (BORROW) ---
document.getElementById('request-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const cat = document.getElementById('req-cat').value;
    const name = document.getElementById('req-name').value.trim();
    const desc = document.getElementById('req-desc').value.trim();
    const date = document.getElementById('req-date').value;
    const time = document.getElementById('req-time').value;
    const loc = document.getElementById('req-location').value.trim();
    if (!name) return;
    const newReq = { id: Date.now(), name, category: cat, desc: desc || 'Urgent request.', timestamp: 'Just now', date, time, location: loc || 'Campus' };
    state.recentRequests.unshift(newReq);
    mockBorrowItems.unshift({ id: Date.now(), title: name, cat: cat, desc: desc || 'New request.' });
    renderBorrowItems();
    updateUI();
    closeModal('request-modal');
    this.reset();
    showToast('Request added successfully!');
});

// --- PROFILE SAVE ---
document.getElementById('profile-form').addEventListener('submit', function(e) {
    e.preventDefault();
    state.firstName = document.getElementById('input-fname').value.trim();
    state.lastName = document.getElementById('input-lname').value.trim();
    state.major = document.getElementById('input-major').value;
    state.bio = document.getElementById('input-bio').value.trim();
    updateUI();
    showToast('Profile updated successfully!');
});

document.getElementById('profile-cancel').addEventListener('click', function() {
    document.getElementById('profile-form').reset();
    showToast('Changes discarded');
});

// --- INITIALIZATION ---
renderLendItems();
renderBorrowItems();
updateUI();