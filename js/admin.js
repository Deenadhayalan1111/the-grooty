/* =========================================================
   THE GROOT OOTY — Admin Panel Controller
   Restricted: Room & Property Price Editing Only
   ========================================================= */
import { supabase } from './supabase.js';

window.handleAdminLogin = handleAdminLogin;
window.handleAdminLogout = handleAdminLogout;
window.saveQuickPrice = saveQuickPrice;
window.saveCardPrice = saveCardPrice;
window.openRoomModal = openRoomModal;
window.closeRoomModal = closeRoomModal;
window.handleSaveRoomModal = handleSaveRoomModal;

document.addEventListener('DOMContentLoaded', () => {
  initAdminAuth();
  initAdminTabs();
});

/* ---------------------------------------------------------
   1. AUTHENTICATION
   --------------------------------------------------------- */

async function initAdminAuth() {
  const authScreen = document.getElementById('admin-auth-screen');
  const dashScreen = document.getElementById('admin-dashboard-screen');
  
  const { data: { session }, error } = await supabase.auth.getSession();

  if (session && session.user) {
    const { data: profile, error: profileError } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
    
    let isAuthorized = false;
    if (!profileError && profile && profile.role && String(profile.role).trim().toLowerCase() === 'admin') {
      isAuthorized = true;
    }

    if (isAuthorized) {
      if (authScreen) authScreen.style.display = 'none';
      if (dashScreen) dashScreen.classList.add('active');
      if (window.location.pathname === '/admin' || window.location.pathname === '/admin.html') {
        window.history.pushState(null, '', '/admin/dashboard');
      }
      loadDashboardData();
    } else {
      await supabase.auth.signOut();
      if (authScreen) authScreen.style.display = 'flex';
      if (dashScreen) dashScreen.classList.remove('active');
      if (window.location.pathname === '/admin/dashboard') {
        window.location.href = '/admin';
      }
    }
  } else {
    if (authScreen) authScreen.style.display = 'flex';
    if (dashScreen) dashScreen.classList.remove('active');
    if (window.location.pathname === '/admin/dashboard') {
      window.location.href = '/admin';
    }
  }
}

async function handleAdminLogin(e) {
  e.preventDefault();
  const email = document.getElementById('admin-email').value.trim();
  const passcode = document.getElementById('admin-passcode').value.trim();
  const errorEl = document.getElementById('admin-login-error');
  const btn = e.target.querySelector('button[type="submit"]');

  if (!email || !passcode) {
    if (errorEl) {
      errorEl.innerText = "Email and password are required.";
      errorEl.style.display = 'block';
    }
    return;
  }

  const originalBtnText = btn.innerHTML;
  btn.innerHTML = "Authenticating...";
  btn.disabled = true;

  const { data, error } = await supabase.auth.signInWithPassword({ email, password: passcode });

  if (error) {
    if (errorEl) {
      errorEl.innerText = error.message;
      errorEl.style.display = 'block';
    }
    btn.innerHTML = originalBtnText;
    btn.disabled = false;
    return;
  }

  const { data: profile, error: profileError } = await supabase.from('profiles').select('role').eq('id', data.user.id).single();

  let isAuthorized = false;
  if (!profileError && profile && profile.role && String(profile.role).trim().toLowerCase() === 'admin') {
    isAuthorized = true;
  }

  if (!isAuthorized) {
    await supabase.auth.signOut();
    if (errorEl) {
      if (profileError) {
        console.error("Profile check error:", profileError);
        errorEl.innerText = "Authorization failed: Could not read profile. Please ensure RLS policies allow SELECT for authenticated users on public.profiles.";
      } else if (!profile) {
        errorEl.innerText = "Authorization failed: Profile record not found for this user in public.profiles.";
      } else {
        errorEl.innerText = `Authorization failed: Your role is '${profile.role}', but 'admin' is required.`;
      }
      errorEl.style.display = 'block';
    }
    btn.innerHTML = originalBtnText;
    btn.disabled = false;
    return;
  }

  if (errorEl) errorEl.style.display = 'none';
  btn.innerHTML = originalBtnText;
  btn.disabled = false;
  
  showToast('Admin access granted.');
  initAdminAuth();
}

async function handleAdminLogout() {
  await supabase.auth.signOut();
  window.location.href = '/admin';
}

/* ---------------------------------------------------------
   2. TABS NAVIGATION
   --------------------------------------------------------- */

function initAdminTabs() {
  const tabBtns = document.querySelectorAll('.admin-tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.dataset.tab;
      switchTab(tabId);
    });
  });
}

function switchTab(tabId) {
  document.querySelectorAll('.admin-tab-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.tab === tabId);
  });

  document.querySelectorAll('.admin-tab-content').forEach(c => {
    c.classList.toggle('active', c.id === `tab-${tabId}`);
  });

  if (tabId === 'dashboard') renderDashboardOverview();
  if (tabId === 'rooms') renderRoomsManagement();
  if (tabId === 'gallery') renderGalleryManagement();
  if (tabId === 'settings') renderSettingsForm();
}

/* ---------------------------------------------------------
   3. DATA LOADING & RENDERING
   --------------------------------------------------------- */

async function loadDashboardData() {
  if (window.GrootStore) {
    await window.GrootStore.fetchLiveRooms();
  }
  renderDashboardOverview();
  renderRoomsManagement();
  renderGalleryManagement();
  renderSettingsForm();

  if (window.GrootStore) {
    window.GrootStore.subscribe(() => {
      renderDashboardOverview();
      renderRoomsManagement();
      renderGalleryManagement();
    });
  }
}

/* --- TAB 1: OVERVIEW DASHBOARD (PRICE EDITING TABLE) --- */
function renderDashboardOverview() {
  if (!window.GrootStore) return;

  const rooms = window.GrootStore.getRooms();
  const totalEl = document.getElementById('stat-total-rooms');
  if (totalEl) totalEl.textContent = rooms.length;

  const tableWrap = document.getElementById('dashboard-rooms-table-wrap');
  if (!tableWrap) return;

  let html = `
    <div style="overflow-x:auto;">
      <table style="width:100%; border-collapse:collapse; text-align:left;">
        <thead>
          <tr style="border-bottom:1px solid rgba(255,255,255,0.12); color:var(--admin-text-muted); font-size:0.75rem; text-transform:uppercase; letter-spacing:0.08em;">
            <th style="padding:12px 14px;">Accommodation (Read-Only)</th>
            <th style="padding:12px 14px;">Price / Night (Editable)</th>
            <th style="padding:12px 14px;">Status (Read-Only)</th>
            <th style="padding:12px 14px; text-align:right;">Action</th>
          </tr>
        </thead>
        <tbody>
  `;

  rooms.forEach(r => {
    html += `
      <tr style="border-bottom:1px solid rgba(255,255,255,0.06); font-size:0.9rem;">
        <td style="padding:14px; display:flex; align-items:center; gap:12px;">
          <img src="${r.image}" alt="${r.name}" style="width:48px; height:36px; border-radius:6px; object-fit:cover;" />
          <div>
            <div style="font-weight:700; color:#FFFFFF;">${r.name}</div>
            <div style="font-size:0.75rem; color:var(--admin-text-muted);">${r.tagline || ''}</div>
          </div>
        </td>
        <td style="padding:14px;">
          <div style="display:flex; align-items:center; gap:6px;">
            <span style="color:var(--admin-accent-glow); font-weight:700;">₹</span>
            <input
              type="number"
              id="dash-price-${r.id}"
              value="${r.price}"
              step="100"
              min="0"
              style="width:95px; background:rgba(0,0,0,0.4); border:1px solid rgba(159,207,73,0.4); border-radius:6px; color:#FFFFFF; padding:6px 8px; font-weight:700; font-size:0.95rem;"
            />
            <button onclick="saveQuickPrice('${r.id}')" class="admin-btn admin-btn-primary" style="padding:5px 12px; font-size:0.75rem;">Save</button>
          </div>
        </td>
        <td style="padding:14px;">
          <span class="status-pill available" style="border:none;">
            ● Available
          </span>
        </td>
        <td style="padding:14px; text-align:right;">
          <button onclick="openRoomModal('${r.id}')" class="admin-btn admin-btn-outline" style="padding:6px 12px; font-size:0.8rem;">
            Edit Price &rarr;
          </button>
        </td>
      </tr>
    `;
  });

  html += `</tbody></table></div>`;
  tableWrap.innerHTML = html;
}

/* --- TAB 2: ROOMS & PRICING MANAGEMENT --- */
function renderRoomsManagement() {
  if (!window.GrootStore) return;

  const container = document.getElementById('admin-rooms-list');
  if (!container) return;

  const rooms = window.GrootStore.getRooms();
  container.innerHTML = '';

  rooms.forEach(r => {
    const card = document.createElement('div');
    card.className = 'admin-room-card';

    card.innerHTML = `
      <div class="admin-room-img-wrap">
        <img src="${r.image}" alt="${r.name}" />
      </div>
      <div class="admin-room-body">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.5rem; flex-wrap:gap:6px;">
          <h3 class="admin-room-name">${r.name}</h3>
          <span class="status-pill available">
            ● Available
          </span>
        </div>
        <p class="admin-room-desc">${r.shortDescription || r.description}</p>
        
        <div class="admin-price-row">
          <span style="font-size:0.85rem; color:var(--admin-text-muted);">Price / Night:</span>
          <span style="font-weight:700; color:var(--admin-accent-glow);">₹</span>
          <input type="number" id="room-card-price-${r.id}" class="admin-price-input" value="${r.price}" step="100" min="0" />
          <button onclick="saveCardPrice('${r.id}')" class="admin-btn admin-btn-primary" style="padding:6px 12px; font-size:0.8rem;">Save</button>
        </div>

        <div class="admin-room-actions" style="margin-top:auto; padding-top:0.75rem; border-top:1px solid rgba(255,255,255,0.08);">
          <button onclick="openRoomModal('${r.id}')" class="admin-btn admin-btn-outline" style="flex:1;">
            Edit Price
          </button>
          <a href="room-detail.html?room=${r.slug || r.id}" target="_blank" class="admin-btn admin-btn-outline" style="font-size:0.8rem;" title="View public live room page">
            ↗ Preview Live
          </a>
        </div>
      </div>
    `;

    container.appendChild(card);
  });
}

async function saveQuickPrice(roomId) {
  const input = document.getElementById(`dash-price-${roomId}`);
  if (!input) return;
  const newPrice = parseInt(input.value, 10);
  if (isNaN(newPrice) || newPrice < 0) {
    alert('Please enter a valid price amount.');
    return;
  }
  
  const btn = input.nextElementSibling;
  const originalText = btn.innerHTML;
  btn.innerHTML = 'Saving...';
  btn.disabled = true;

  const result = await window.GrootStore.updateRoomPrice(roomId, newPrice);
  
  btn.innerHTML = originalText;
  btn.disabled = false;

  const currentRoom = result.room || window.GrootStore.getRoom(roomId);

  if (result && result.success) {
    showToast(`Updated price for ${currentRoom ? currentRoom.name : 'Room'} to ₹${newPrice.toLocaleString()}`);
  } else {
    alert(`Failed to update price: ${result ? result.error : 'Unknown error'}`);
    if (currentRoom) input.value = currentRoom.price; // Revert UI
  }
}

async function saveCardPrice(roomId) {
  const input = document.getElementById(`room-card-price-${roomId}`);
  if (!input) return;
  const newPrice = parseInt(input.value, 10);
  if (isNaN(newPrice) || newPrice < 0) {
    alert('Please enter a valid price amount.');
    return;
  }

  const btn = input.nextElementSibling;
  const originalText = btn.innerHTML;
  btn.innerHTML = 'Saving...';
  btn.disabled = true;

  const result = await window.GrootStore.updateRoomPrice(roomId, newPrice);
  
  btn.innerHTML = originalText;
  btn.disabled = false;

  const currentRoom = result.room || window.GrootStore.getRoom(roomId);

  if (result && result.success) {
    showToast(`Updated price for ${currentRoom ? currentRoom.name : 'Room'} to ₹${newPrice.toLocaleString()}`);
  } else {
    alert(`Failed to update price: ${result ? result.error : 'Unknown error'}`);
    if (currentRoom) input.value = currentRoom.price; // Revert UI
  }
}

/* --- ROOM PRICE EDIT MODAL --- */
function openRoomModal(roomId) {
  const room = window.GrootStore.getRoom(roomId);
  if (!room) return;

  document.getElementById('modal-room-id').value = room.id;
  document.getElementById('modal-room-name').value = room.name;
  document.getElementById('modal-room-price').value = room.price;

  document.getElementById('admin-room-modal').classList.add('active');
}

function closeRoomModal() {
  document.getElementById('admin-room-modal').classList.remove('active');
}

async function handleSaveRoomModal(e) {
  e.preventDefault();
  const id = document.getElementById('modal-room-id').value;
  const priceInput = document.getElementById('modal-room-price');
  const price = parseInt(priceInput.value, 10);

  if (isNaN(price) || price < 0) {
    alert('Please enter a valid price amount.');
    return;
  }

  const btn = e.target.querySelector('button[type="submit"]');
  const originalText = btn.innerHTML;
  btn.innerHTML = 'Saving...';
  btn.disabled = true;

  const result = await window.GrootStore.updateRoomPrice(id, price);
  
  btn.innerHTML = originalText;
  btn.disabled = false;

  if (result && result.success) {
    closeRoomModal();
    showToast(`Room price updated to ₹${price.toLocaleString()} successfully.`);
  } else {
    alert(`Failed to update price: ${result ? result.error : 'Unknown error'}`);
  }
}

/* --- TAB 3: GALLERY (READ-ONLY DISPLAY) --- */
function renderGalleryManagement() {
  if (!window.GrootStore) return;

  const container = document.getElementById('admin-gallery-list');
  if (!container) return;

  const gallery = window.GrootStore.getGallery(true);
  container.innerHTML = '';

  gallery.forEach(item => {
    const card = document.createElement('div');
    card.className = 'admin-gallery-card';

    card.innerHTML = `
      <img src="${item.url}" alt="${item.title}" class="admin-gallery-thumb" />
      <div class="admin-gallery-info">
        <div class="admin-gallery-title" title="${item.title}">${item.title}</div>
        <div style="font-size:0.75rem; color:var(--admin-text-muted);">
          Assigned: <span style="color:var(--admin-accent-glow); font-weight:600;">${(item.assignedRoom || 'property').toUpperCase()}</span>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:auto; padding-top:0.5rem; border-top:1px solid rgba(255,255,255,0.06);">
          <span style="font-size:0.75rem; color:#25D366; font-weight:700;">
            ● Locked (System Photo)
          </span>
        </div>
      </div>
    `;

    container.appendChild(card);
  });
}

/* --- TAB 4: SETTINGS (READ-ONLY DISPLAY) --- */
function renderSettingsForm() {
  if (!window.GrootStore) return;

  const settings = window.GrootStore.getSettings();
  const wEl = document.getElementById('set-whatsapp');
  const p1El = document.getElementById('set-phone1');
  const p2El = document.getElementById('set-phone2');
  const ciEl = document.getElementById('set-checkin');
  const coEl = document.getElementById('set-checkout');
  const noteEl = document.getElementById('set-note');

  if (wEl) wEl.value = settings.whatsapp || '';
  if (p1El) p1El.value = settings.phone1 || '';
  if (p2El) p2El.value = settings.phone2 || '';
  if (ciEl) ciEl.value = settings.checkInTime || '';
  if (coEl) coEl.value = settings.checkOutTime || '';
  if (noteEl) noteEl.value = settings.bookingNote || '';
}

/* ---------------------------------------------------------
   TOAST NOTIFICATION
   --------------------------------------------------------- */

function showToast(msg) {
  const toast = document.getElementById('admin-toast');
  const msgEl = document.getElementById('toast-msg');
  if (!toast || !msgEl) return;

  msgEl.textContent = msg;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
}
