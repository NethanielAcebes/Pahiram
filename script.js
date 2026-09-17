// Updated State to track Fulfilled and Borrowed counts
const state = {
    fulfilledCount: 0,
    borrowedCount: 0,
    firstName: 'Test',
    lastName: 'User',
    major: 'Computer Science',
    bio: 'Ready to help my peers.',
    recentRequests: [
        { id: 101, name: 'MacBook Charger', category: 'Tech', desc: 'USB-C Power Adapter. Needed ASAP for presentation!', timestamp: '5 min ago' },
        { id: 102, name: 'Scientific Calculator', category: 'Academics', desc: 'TI-84 / Casio FX. Needed for Physics midterms today.', timestamp: '1 hour ago' }
    ]
};

// Items array now includes a 'status' property ('pending' or 'confirmed')
let items = [
    { id: 1, title: 'MacBook Charger', cat: 'Tech', type: 'request', desc: 'USB-C Power Adapter. Needed ASAP for presentation!', date: '', time: '', location: '', owner: 'me', status: 'pending' },
    { id: 2, title: 'Scientific Calculator', cat: 'Academics', type: 'request', desc: 'TI-84 / Casio FX. Needed for Physics midterms today.', date: '', time: '', location: '', owner: 'peer', status: 'pending' },
    { id: 3, title: 'Compact Umbrella', cat: 'Utility', type: 'offer', desc: 'Available for pickup at Main Library lobby during rain.', date: '', time: '', location: 'Main Library Lobby', owner: 'peer', status: 'pending' }
];

let itemToDeleteId = null;

const dashFulfilled = document.getElementById('dash-fulfilled-count');
const dashBorrowed = document.getElementById('dash-borrowed-count');
const profFulfilled = document.getElementById('prof-fulfilled-count');
const profBorrowed = document.getElementById('prof-borrowed-count');
const recentList = document.getElementById('recent-requests-list');
const requestCount = document.getElementById('request-count');

function showToast(msg) {
    const el = document.getElementById('toast-msg');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(el._timeout);
    el._timeout = setTimeout(() => el.classList.remove('show'), 3000);
}

function openModal(id) { document.getElementById(id).classList.add('active'); }
function closeModal(id) { document.getElementById(id).classList.remove('active'); }

function navigateTo(viewId) {
    document.querySelectorAll('.view-section').forEach(v => v.classList.remove('active'));
    document.getElementById(viewId).classList.add('active');
    document.querySelectorAll('.sidebar .nav-item').forEach(n => n.classList.remove('active'));
    document.querySelector(`.sidebar .nav-item[data-view="${viewId}"]`)?.classList.add('active');
}

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

function updateUI() {
    const s = state;
    dashFulfilled.textContent = s.fulfilledCount;
    dashBorrowed.textContent = s.borrowedCount;
    profFulfilled.textContent = s.fulfilledCount;
    profBorrowed.textContent = s.borrowedCount;
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
            </div>`;
        recentList.appendChild(div);
    });
}

function renderCardGrid(containerId, itemsArray, badgeLabel, isMySection) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    if (itemsArray.length === 0) {
        const msg = isMySection ? 'You have no items here yet.' : 'No items available in this section.';
        container.innerHTML = `<div class="text-muted" style="grid-column: 1/-1; text-align:center; padding: 40px;">${msg}</div>`;
        return;
    }

    itemsArray.forEach(item => {
        const card = document.createElement('div');
        card.className = 'item-card';
        const iconClass = item.cat === 'Tech' ? 'laptop' : item.cat === 'Academics' ? 'graduation-cap' : 'umbrella';
        
        const displayDate = item.date ? `📅 ${item.date}` : '📅 Flexible';
        const displayTime = item.time ? `⏰ ${item.time}` : '⏰ Anytime';
        const displayLocation = item.location ? `📍 ${item.location}` : '📍 Flexible';

        // Determine button state based on item status
        let actionButton = '';
        if (item.status === 'confirmed') {
            const confirmedText = (containerId === 'community-requests-container') ? 'Fulfilled ✓' : 'Requested ✓';
            actionButton = `<button class="btn-confirmed">${confirmedText}</button>`;
        } else {
            if (containerId === 'community-requests-container') {
                actionButton = `<button class="btn-mint" data-action="fulfill">Fulfill Request →</button>`;
            } else if (containerId === 'available-items-container') {
                actionButton = `<button class="btn-mint" data-action="request">Request to Borrow →</button>`;
            }
        }

        card.innerHTML = `
            <div class="card-header-actions">
                <div class="card-header-left">
                    <div style="background:var(--badge-bg); padding:8px 12px; border-radius:40px; transition:background 0.3s;">
                        <i class="fas fa-${iconClass}"></i>
                    </div>
                </div>
                <div class="card-header-right">
                    <span class="badge-pill">${badgeLabel}</span>
                    <button class="item-delete" data-id="${item.id}"><i class="fas fa-trash"></i></button>
                </div>
            </div>
            <h4>${item.title}</h4><p>${item.desc}</p>
            <div class="metadata-row">
                <span class="metadata-item">${displayDate}</span>
                <span class="metadata-item">${displayTime}</span>
                <span class="metadata-item">${displayLocation}</span>
            </div>
            ${actionButton}
        `;
        container.appendChild(card);
    });
}

function renderAllSections() {
    const myOffers = items.filter(i => i.type === 'offer');
    renderCardGrid('my-offers-container', myOffers, 'Offered', true);
    document.getElementById('my-offers-count').textContent = myOffers.length;
    
    const communityRequests = items.filter(i => i.type === 'request');
    renderCardGrid('community-requests-container', communityRequests, 'Requested', false);
    document.getElementById('community-requests-count').textContent = communityRequests.length;

    const myRequests = items.filter(i => i.type === 'request');
    renderCardGrid('my-requests-container', myRequests, 'Requested', true);
    document.getElementById('my-requests-count').textContent = myRequests.length;
    
    const availableItems = items.filter(i => i.type === 'offer');
    renderCardGrid('available-items-container', availableItems, 'Offered', false);
    document.getElementById('available-items-count').textContent = availableItems.length;
}

function handleDeleteClick(id) {
    itemToDeleteId = id;
    openModal('delete-modal');
}

function confirmDelete() {
    if (itemToDeleteId !== null) {
        items = items.filter(i => i.id !== itemToDeleteId);
        renderAllSections();
        updateUI();
        closeModal('delete-modal');
        showToast('Item deleted successfully');
        itemToDeleteId = null;
    }
}

document.addEventListener('click', function(e) {
    const navTarget = e.target.closest('[data-view]');
    if (navTarget) { navigateTo(navTarget.dataset.view); return; }

    const actionCard = e.target.closest('.action-card');
    if (actionCard) {
        const view = actionCard.dataset.navigate;
        if (view) navigateTo(view);
        return;
    }

    const deleteBtn = e.target.closest('.item-delete');
    if (deleteBtn) {
        const id = parseInt(deleteBtn.dataset.id);
        handleDeleteClick(id);
        return;
    }

    // Handle Fulfill Request Click
    const fulfillBtn = e.target.closest('[data-action="fulfill"]');
    if (fulfillBtn) {
        const card = fulfillBtn.closest('.item-card');
        const deleteBtn = card.querySelector('.item-delete');
        const itemId = parseInt(deleteBtn.dataset.id);
        const item = items.find(i => i.id === itemId);
        if (item && item.status !== 'confirmed') {
            item.status = 'confirmed';
            state.fulfilledCount += 1;
            renderAllSections();
            updateUI();
            showToast('Request fulfilled! Status updated.');
        }
        return;
    }

    // Handle Request to Borrow Click
    const requestBtn = e.target.closest('[data-action="request"]');
    if (requestBtn) {
        const card = requestBtn.closest('.item-card');
        const deleteBtn = card.querySelector('.item-delete');
        const itemId = parseInt(deleteBtn.dataset.id);
        const item = items.find(i => i.id === itemId);
        if (item && item.status !== 'confirmed') {
            item.status = 'confirmed';
            state.borrowedCount += 1;
            renderAllSections();
            updateUI();
            showToast('Item requested! Status updated.');
        }
        return;
    }

    const openOfferBtn = e.target.closest('#open-offer-modal');
    if (openOfferBtn) { openModal('offer-modal'); return; }

    const openRequestBtn = e.target.closest('#open-request-modal');
    if (openRequestBtn) { openModal('request-modal'); return; }

    const themeToggle = e.target.closest('#theme-toggle');
    if (themeToggle) { toggleTheme(); return; }
});

document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) { closeModal(overlay.id); }
    });
    const box = overlay.querySelector('.modal-box');
    if (box) {
        box.addEventListener('click', function(e) { e.stopPropagation(); });
    }
});

document.querySelectorAll('.close-modal-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
        e.preventDefault();
        const modal = this.closest('.modal-overlay');
        if (modal) {
            closeModal(modal.id);
        }
    });
});

document.getElementById('offer-submit-btn').addEventListener('click', function(e) {
    e.preventDefault();
    const cat = document.getElementById('offer-cat').value;
    const name = document.getElementById('offer-name').value.trim();
    const desc = document.getElementById('offer-desc').value.trim();
    const date = document.getElementById('offer-date').value;
    const time = document.getElementById('offer-time').value;
    const loc = document.getElementById('offer-location').value.trim();
    
    if (!name) { showToast('Please enter an item name'); return; }
    
    items.unshift({ id: Date.now(), title: name, cat: cat, type: 'offer', desc: desc || 'Available for lending.', date: date, time: time, location: loc, owner: 'me', status: 'pending' });
    renderAllSections();
    closeModal('offer-modal');
    document.getElementById('offer-form').reset();
    showToast('Item offered successfully!');
});

document.getElementById('request-submit-btn').addEventListener('click', function(e) {
    e.preventDefault();
    const cat = document.getElementById('req-cat').value;
    const name = document.getElementById('req-name').value.trim();
    const desc = document.getElementById('req-desc').value.trim();
    const date = document.getElementById('req-date').value;
    const time = document.getElementById('req-time').value;
    const loc = document.getElementById('req-location').value.trim();
    
    if (!name) { showToast('Please enter an item name'); return; }
    
    state.recentRequests.unshift({ id: Date.now(), name, category: cat, desc: desc || 'Urgent request.', timestamp: 'Just now', date, time, location: loc || 'Campus' });
    items.unshift({ id: Date.now(), title: name, cat: cat, type: 'request', desc: desc || 'Urgent request.', date: date, time: time, location: loc, owner: 'me', status: 'pending' });
    
    renderAllSections();
    updateUI();
    closeModal('request-modal');
    document.getElementById('request-form').reset();
    showToast('Request added successfully!');
});

document.getElementById('confirm-delete-btn').addEventListener('click', function() {
    confirmDelete();
});

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

document.addEventListener('DOMContentLoaded', () => {
    renderAllSections();
    updateUI();
});
