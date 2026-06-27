/**
 * EBM Portal — Admin Dashboard Logic
 * =============================================
 * Handles authentication, submissions CRUD,
 * search/filter, and WhatsApp integration.
 */

(function () {
  'use strict';

  // =============================================
  // STATE
  // =============================================
  let allSubmissions = [];
  let filteredSubmissions = [];
  let currentUser = null;
  let authListener = null;

  // =============================================
  // DOM REFS
  // =============================================
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const els = {
    // Login
    loginView: () => $('#loginView'),
    loginForm: () => $('#loginForm'),
    loginEmail: () => $('#loginEmail'),
    loginPassword: () => $('#loginPassword'),
    loginBtn: () => $('#loginBtn'),
    loginBtnText: () => $('#loginBtnText'),
    loginSpinner: () => $('#loginSpinner'),
    loginError: () => $('#loginError'),

    // Dashboard
    dashboardView: () => $('#dashboardView'),
    adminEmail: () => $('#adminEmail'),

    // Stats
    statTotal: () => $('#statTotal'),
    statPending: () => $('#statPending'),
    statContacted: () => $('#statContacted'),
    statToday: () => $('#statToday'),

    // Table
    tableContainer: () => $('#tableContainer'),
    tableLoading: () => $('#tableLoading'),
    tableEmpty: () => $('#tableEmpty'),
    tableWrapper: () => $('#tableWrapper'),
    tableBody: () => $('#tableBody'),

    // Filters
    searchInput: () => $('#searchInput'),
    statusFilter: () => $('#statusFilter'),

    // Toast
    toastContainer: () => $('#toastContainer')
  };

  // =============================================
  // INIT
  // =============================================
  function init() {
    if (typeof firebase === 'undefined' || !firebase.apps.length) {
      showLoginError('Firebase not initialized. Please check your configuration in config.js');
      return;
    }

    // Check auth state on load
    firebase.auth().onAuthStateChanged(function (user) {
      if (user) {
        currentUser = user;
        showDashboard(user);
        loadSubmissions();
      } else {
        showLogin();
      }
    });

    // Header scroll shadow
    const header = $('#header');
    if (header) {
      window.addEventListener('scroll', function () {
        header.classList.toggle('scrolled', window.scrollY > 10);
      });
    }
  }

  // =============================================
  // AUTHENTICATION
  // =============================================
  window.handleLogin = function (event) {
    event.preventDefault();

    const email = els.loginEmail() ? els.loginEmail().value.trim() : '';
    const password = els.loginPassword() ? els.loginPassword().value : '';

    if (!email || !password) {
      showLoginError('Please enter your email and password.');
      return false;
    }

    // Show loading
    setLoginLoading(true);

    firebase.auth().signInWithEmailAndPassword(email, password)
      .then(function (userCredential) {
        // Success — handled by onAuthStateChanged
        setLoginLoading(false);
      })
      .catch(function (error) {
        setLoginLoading(false);
        var message = getAuthErrorMessage(error.code);
        showLoginError(message);
      });

    return false;
  };

  window.handleLogout = function () {
    firebase.auth().signOut().then(function () {
      currentUser = null;
      allSubmissions = [];
      filteredSubmissions = [];
      showLogin();
    }).catch(function (error) {
      showToast('Failed to sign out: ' + error.message, 'error');
    });
  };

  function setLoginLoading(loading) {
    const btn = els.loginBtn();
    const text = els.loginBtnText();
    const spinner = els.loginSpinner();
    if (btn) btn.disabled = loading;
    if (text) text.textContent = loading ? 'Signing In...' : 'Sign In';
    if (spinner) spinner.style.display = loading ? 'inline-block' : 'none';
  }

  function showLoginError(message) {
    const el = els.loginError();
    if (el) {
      el.textContent = message;
      el.classList.add('show');
    }
  }

  function getAuthErrorMessage(code) {
    var messages = {
      'auth/user-not-found': 'No account found with this email address.',
      'auth/wrong-password': 'Incorrect password. Please try again.',
      'auth/invalid-credential': 'Invalid email or password. Please try again.',
      'auth/invalid-email': 'Please enter a valid email address.',
      'auth/user-disabled': 'This account has been disabled.',
      'auth/too-many-requests': 'Too many login attempts. Please try again later.'
    };
    return messages[code] || 'Login failed. Please check your credentials.';
  }

  // =============================================
  // VIEW SWITCHING
  // =============================================
  function showLogin() {
    if (els.loginView()) els.loginView().style.display = 'flex';
    if (els.dashboardView()) els.dashboardView().style.display = 'none';
    // Clear login form
    if (els.loginPassword()) els.loginPassword().value = '';
    if (els.loginError()) els.loginError().classList.remove('show');
  }

  function showDashboard(user) {
    if (els.loginView()) els.loginView().style.display = 'none';
    if (els.dashboardView()) els.dashboardView().style.display = 'block';
    if (els.adminEmail()) els.adminEmail().textContent = user.email;
  }

  // =============================================
  // LOAD SUBMISSIONS
  // =============================================
  function loadSubmissions() {
    showLoading(true);

    if (!db) {
      showLoading(false);
      showEmptyState(true);
      showToast('Firestore not initialized. Check your config.', 'error');
      return;
    }

    // Listen for real-time updates
    if (authListener) {
      authListener(); // Unsubscribe previous listener
    }

    authListener = db.collection('submissions')
      .orderBy('timestamp', 'desc')
      .onSnapshot(function (snapshot) {
        allSubmissions = [];
        snapshot.forEach(function (doc) {
          var data = doc.data();
          data.id = doc.id;
          allSubmissions.push(data);
        });

        showLoading(false);
        applyFilters();
        updateStats();
      }, function (error) {
        console.error('Firestore error:', error);
        showLoading(false);
        showEmptyState(true);
        showToast('Error loading submissions: ' + error.message, 'error');
      });
  }

  // =============================================
  // SEARCH & FILTER
  // =============================================
  window.handleSearch = function () {
    applyFilters();
  };

  window.handleFilter = function () {
    applyFilters();
  };

  function applyFilters() {
    const searchTerm = els.searchInput()
      ? els.searchInput().value.toLowerCase().trim()
      : '';
    const statusFilter = els.statusFilter()
      ? els.statusFilter().value
      : 'all';

    filteredSubmissions = allSubmissions.filter(function (sub) {
      // Status filter
      if (statusFilter !== 'all' && sub.status !== statusFilter) {
        return false;
      }

      // Search filter
      if (searchTerm) {
        var name = (sub.name || '').toLowerCase();
        var email = (sub.email || '').toLowerCase();
        var phone = (sub.phone || '');
        var type = (sub.evidenceTypeLabel || '').toLowerCase();
        var institution = (sub.institution || '').toLowerCase();

        var matchesSearch =
          name.indexOf(searchTerm) !== -1 ||
          email.indexOf(searchTerm) !== -1 ||
          phone.indexOf(searchTerm) !== -1 ||
          type.indexOf(searchTerm) !== -1 ||
          institution.indexOf(searchTerm) !== -1;

        if (!matchesSearch) return false;
      }

      return true;
    });

    renderTable();
  }

  // =============================================
  // STATS
  // =============================================
  function updateStats() {
    var total = allSubmissions.length;
    var pending = allSubmissions.filter(function (s) { return s.status === 'pending'; }).length;
    var contacted = allSubmissions.filter(function (s) { return s.status === 'contacted' || s.status === 'review'; }).length;

    var today = new Date();
    var todayStr = today.toISOString().slice(0, 10);
    var submittedToday = allSubmissions.filter(function (s) {
      return s.timestamp && s.timestamp.slice(0, 10) === todayStr;
    }).length;

    if (els.statTotal()) els.statTotal().textContent = total;
    if (els.statPending()) els.statPending().textContent = pending;
    if (els.statContacted()) els.statContacted().textContent = contacted;
    if (els.statToday()) els.statToday().textContent = submittedToday;
  }

  // =============================================
  // TABLE RENDERING
  // =============================================
  function renderTable() {
    const tbody = els.tableBody();
    if (!tbody) return;

    if (filteredSubmissions.length === 0) {
      showEmptyState(true);
      showTable(false);
      return;
    }

    showEmptyState(false);
    showTable(true);

    var html = '';
    filteredSubmissions.forEach(function (sub) {
      var formattedDate = formatDate(sub.timestamp);
      var statusClass = 'status-' + (sub.status || 'pending');
      var statusLabel = (sub.status || 'pending').charAt(0).toUpperCase() + (sub.status || 'pending').slice(1);
      var waLink = 'https://wa.me/' + (sub.phoneWA || '62' + sub.phone);

      html += '<tr>';
      html += '<td><strong>' + escapeHtml(sub.name || 'N/A') + '</strong>';
      if (sub.institution) {
        html += '<br><span style="font-size:0.6875rem;color:var(--gray-500);">' + escapeHtml(sub.institution) + '</span>';
      }
      html += '</td>';
      html += '<td>';
      html += '<div>' + escapeHtml(sub.email || '') + '</div>';
      html += '<div style="font-size:0.6875rem;color:var(--gray-500);">0' + escapeHtml(sub.phone || '') + '</div>';
      html += '</td>';
      html += '<td>' + escapeHtml(sub.evidenceTypeLabel || '—') + '</td>';
      html += '<td><span style="font-size:0.6875rem;">' + escapeHtml(sub.guideline || '—') + '</span></td>';
      html += '<td style="white-space:nowrap;font-size:0.75rem;">' + formattedDate + '</td>';
      html += '<td><span class="status-badge ' + statusClass + '">' + statusLabel + '</span></td>';
      html += '<td>';
      html += '<div style="display:flex;gap:4px;flex-wrap:nowrap;">';

      // WhatsApp button
      html += '<a href="' + waLink + '" target="_blank" rel="noopener noreferrer" class="action-btn wa-btn" title="Contact via WhatsApp">';
      html += '💬 WA</a>';

      // Status update buttons
      if (sub.status !== 'contacted') {
        html += '<button class="action-btn contact-btn" onclick="updateStatus(\'' + sub.id + '\',\'contacted\')" title="Mark as contacted">Mark Contacted</button>';
      }
      if (sub.status !== 'pending') {
        html += '<button class="action-btn" onclick="updateStatus(\'' + sub.id + '\',\'pending\')" title="Reset to pending">Reset</button>';
      }

      html += '</div></td>';
      html += '</tr>';
    });

    tbody.innerHTML = html;
  }

  // =============================================
  // UPDATE STATUS
  // =============================================
  window.updateStatus = function (docId, newStatus) {
    if (!db) {
      showToast('Database not available.', 'error');
      return;
    }

    db.collection('submissions').doc(docId).update({
      status: newStatus
    }).then(function () {
      showToast('Status updated to ' + newStatus + '.', 'success');
    }).catch(function (error) {
      console.error('Update error:', error);
      showToast('Failed to update status: ' + error.message, 'error');
    });
  };

  // =============================================
  // UI HELPERS
  // =============================================
  function showLoading(isLoading) {
    if (els.tableLoading()) els.tableLoading().style.display = isLoading ? 'block' : 'none';
    if (isLoading) {
      showTable(false);
      showEmptyState(false);
    }
  }

  function showEmptyState(show) {
    if (els.tableEmpty()) els.tableEmpty().style.display = show ? 'block' : 'none';
  }

  function showTable(show) {
    if (els.tableWrapper()) els.tableWrapper().style.display = show ? 'block' : 'none';
  }

  function formatDate(timestamp) {
    if (!timestamp) return '—';
    try {
      var d = new Date(timestamp);
      if (isNaN(d.getTime())) return '—';
      var options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
      return d.toLocaleDateString('en-US', options);
    } catch (e) {
      return '—';
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  // =============================================
  // TOAST NOTIFICATIONS
  // =============================================
  function showToast(message, type) {
    type = type || 'info';
    var container = els.toastContainer();
    if (!container) return;

    var toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(function () {
      if (toast.parentNode) {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(function () {
          if (toast.parentNode) toast.parentNode.removeChild(toast);
        }, 300);
      }
    }, 4000);
  }

  // =============================================
  // START
  // =============================================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
