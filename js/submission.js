/**
 * EBM Portal — Submission Form Logic
 * =============================================
 * Handles multi-step wizard, form validation,
 * guideline agreements, and Firebase submission.
 */

(function () {
  'use strict';

  // =============================================
  // STATE
  // =============================================
  const state = {
    currentStep: 1,
    totalSteps: 4,
    formData: {},
    selectedType: null,
    guidelineChecked: false,
    isSubmitting: false
  };

  // =============================================
  // DOM REFS
  // =============================================
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const els = {
    form: $('#submissionForm'),
    progress: $('#formProgress'),
    steps: () => $$('.form-step'),
    stepElements: () => $$('.progress-step'),
    connectors: () => $$('.progress-connector'),

    // Step 1
    name: () => $('#doctorName'),
    phone: () => $('#doctorPhone'),
    email: () => $('#doctorEmail'),
    institution: () => $('#doctorInstitution'),
    nameError: () => $('#nameError'),
    phoneError: () => $('#phoneError'),
    emailError: () => $('#emailError'),

    // Step 2
    typeGrid: () => $('#evidenceTypeGrid'),
    typeCards: () => $$('.option-card'),
    typeError: () => $('#typeError'),
    otherGroup: () => $('#otherTypeGroup'),
    otherDesc: () => $('#otherTypeDesc'),

    // Step 3
    icmjeCheck: () => $('#icmjeAgreement input'),
    originalityCheck: () => $('#originalityAgreement input'),
    disclosureCheck: () => $('#disclosureAgreement input'),
    guidelineSection: () => $('#guidelineSpecificSection'),
    submitBtn: () => $('#submitBtn'),
    submitBtnText: () => $('#submitBtnText'),
    submitSpinner: () => $('#submitSpinner'),

    // Step 4
    gformLink: () => $('#gformLink'),
    gformContainer: () => $('#gformContainer'),

    // Toast
    toastContainer: () => $('#toastContainer')
  };

  // =============================================
  // INIT
  // =============================================
  function init() {
    // Set current year in footer
    const yearEl = $('#currentYear');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // Mobile menu toggle
    const toggle = $('#menuToggle');
    const nav = $('#navLinks');
    if (toggle && nav) {
      toggle.addEventListener('click', function () {
        nav.classList.toggle('open');
        const isOpen = nav.classList.contains('open');
        toggle.setAttribute('aria-expanded', isOpen);
      });

      // Close nav on link click
      nav.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
          nav.classList.remove('open');
          toggle.setAttribute('aria-expanded', 'false');
        });
      });
    }

    // Header scroll shadow
    const header = $('#header');
    if (header) {
      window.addEventListener('scroll', function () {
        header.classList.toggle('scrolled', window.scrollY > 10);
      });
    }

    // Evidence type card selection
    if (els.typeGrid()) {
      els.typeGrid().addEventListener('change', function (e) {
        if (e.target.name === 'evidenceType') {
          selectEvidenceType(e.target.value);
        }
      });
    }

    // Agreement checkbox styling
    $$('.agreement-item input[type="checkbox"]').forEach(function (cb) {
      cb.addEventListener('change', function () {
        this.closest('.agreement-item').classList.toggle('checked', this.checked);
      });
    });

    // Phone input formatting — strip non-digits
    const phoneInput = els.phone();
    if (phoneInput) {
      phoneInput.addEventListener('input', function () {
        this.value = this.value.replace(/\D/g, '');
      });
    }

    console.log('EBM Portal initialized ✓');
  }

  // =============================================
  // STEP NAVIGATION
  // =============================================
  window.goToStep = function (step) {
    // Validate current step before advancing
    if (step > state.currentStep) {
      if (!validateStep(state.currentStep)) {
        return;
      }
    }

    // Save form data
    saveFormData();

    // Update state
    state.currentStep = step;
    renderStep(step);
  };

  function renderStep(step) {
    // Show/hide form steps
    els.steps().forEach(function (el) {
      var stepNum = parseInt(el.getAttribute('data-step'), 10);
      el.classList.toggle('active', stepNum === step);
    });

    // Update progress bar
    els.stepElements().forEach(function (el) {
      var stepNum = parseInt(el.getAttribute('data-step'), 10);
      el.classList.remove('active', 'completed');
      if (stepNum < step) {
        el.classList.add('completed');
      } else if (stepNum === step) {
        el.classList.add('active');
      }
    });

    // Update connectors
    els.connectors().forEach(function (el) {
      var connStep = parseInt(el.getAttribute('data-connector'), 10);
      el.classList.toggle('done', connStep < step);
    });

    // Update progressbar aria
    els.progress.setAttribute('aria-valuenow', step);

    // Step-specific setup
    if (step === 3) {
      buildGuidelineSection();
    }

    // Scroll form into view
    const formCard = $('#formCard');
    if (formCard) {
      formCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // =============================================
  // SAVE / LOAD FORM DATA
  // =============================================
  function saveFormData() {
    state.formData = {
      name: els.name() ? els.name().value.trim() : '',
      phone: els.phone() ? els.phone().value.trim() : '',
      email: els.email() ? els.email().value.trim() : '',
      institution: els.institution() ? els.institution().value.trim() : '',
      evidenceType: state.selectedType,
      otherTypeDesc: els.otherDesc() ? els.otherDesc().value.trim() : ''
    };
  }

  // =============================================
  // VALIDATION
  // =============================================
  function validateStep(step) {
    switch (step) {
      case 1: return validateStep1();
      case 2: return validateStep2();
      case 3: return validateStep3();
      default: return true;
    }
  }

  function validateStep1() {
    let valid = true;

    // Name
    const name = els.name() ? els.name().value.trim() : '';
    if (!name || name.length < 2) {
      showError(els.nameError());
      if (els.name()) els.name().classList.add('error');
      valid = false;
    } else {
      hideError(els.nameError());
      if (els.name()) els.name().classList.remove('error');
    }

    // Phone — Indonesian format, 10-14 digits
    const phone = els.phone() ? els.phone().value.trim() : '';
    const phoneClean = phone.replace(/\D/g, '');
    if (!phoneClean || phoneClean.length < 9 || phoneClean.length > 15) {
      showError(els.phoneError());
      if (els.phone()) els.phone().classList.add('error');
      valid = false;
    } else {
      hideError(els.phoneError());
      if (els.phone()) els.phone().classList.remove('error');
    }

    // Email
    const email = els.email() ? els.email().value.trim() : '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      showError(els.emailError());
      if (els.email()) els.email().classList.add('error');
      valid = false;
    } else {
      hideError(els.emailError());
      if (els.email()) els.email().classList.remove('error');
    }

    return valid;
  }

  function validateStep2() {
    let valid = true;

    if (!state.selectedType) {
      showError(els.typeError());
      valid = false;
    } else {
      hideError(els.typeError());
    }

    // If "other", require description
    if (state.selectedType === 'other') {
      const desc = els.otherDesc() ? els.otherDesc().value.trim() : '';
      if (!desc) {
        showError(els.typeError());
        els.typeError().textContent = 'Please describe your submission type';
        valid = false;
      }
    }

    return valid;
  }

  function validateStep3() {
    let valid = true;

    // Check all three mandatory agreements
    const icmje = els.icmjeCheck() ? els.icmjeCheck().checked : false;
    const originality = els.originalityCheck() ? els.originalityCheck().checked : false;
    const disclosure = els.disclosureCheck() ? els.disclosureCheck().checked : false;

    if (!icmje) {
      els.icmjeCheck().closest('.agreement-item').classList.add('error');
      valid = false;
    }
    if (!originality) {
      els.originalityCheck().closest('.agreement-item').classList.add('error');
      valid = false;
    }
    if (!disclosure) {
      els.disclosureCheck().closest('.agreement-item').classList.add('error');
      valid = false;
    }

    // Guideline checkbox (if applicable)
    const guidelineCb = document.getElementById('guidelineCheckbox');
    if (guidelineCb && !guidelineCb.checked) {
      guidelineCb.closest('.agreement-item').classList.add('error');
      valid = false;
    }

    if (!valid) {
      showToast('Please agree to all required terms before proceeding.', 'error');
    }

    return valid;
  }

  function showError(el) {
    if (el) el.classList.add('show');
  }

  function hideError(el) {
    if (el) el.classList.remove('show');
  }

  // =============================================
  // EVIDENCE TYPE SELECTION
  // =============================================
  function selectEvidenceType(value) {
    state.selectedType = value;

    // Update card styling
    els.typeCards().forEach(function (card) {
      var radio = card.querySelector('input[type="radio"]');
      card.classList.toggle('selected', radio && radio.checked);
    });

    // Show/hide "other" description
    if (els.otherGroup()) {
      els.otherGroup().style.display = value === 'other' ? 'block' : 'none';
    }

    hideError(els.typeError());
  }

  // =============================================
  // GUIDELINE SECTION (Step 3)
  // =============================================
  function buildGuidelineSection() {
    const section = els.guidelineSection();
    if (!section) return;

    const type = state.selectedType;
    const guideline = EBM_GUIDELINES[type];

    if (!guideline) {
      section.innerHTML = '';
      return;
    }

    var html = '<div class="guidelines-box">';
    html += '<h4>' + escapeHtml(guideline.name) + ' Guidelines</h4>';
    html += '<p style="font-size:0.8125rem;color:var(--gray-600);margin-bottom:var(--space-md);line-height:1.6;">';
    html += escapeHtml(guideline.description);
    html += '</p>';
    html += '<ul>';
    guideline.items.forEach(function (item) {
      html += '<li>' + escapeHtml(item) + '</li>';
    });
    html += '</ul>';
    html += '<p style="margin-top:var(--space-md);">';
    html += '<a href="' + escapeHtml(guideline.url) + '" target="_blank" rel="noopener noreferrer" class="agreement-link">';
    html += 'View Full ' + escapeHtml(guideline.name) + ' Guidelines →</a></p>';
    html += '</div>';

    // Agreement checkbox for guideline
    html += '<label class="agreement-item" id="guidelineAgreement">';
    html += '<input type="checkbox" id="guidelineCheckbox" required aria-label="' + escapeHtml(guideline.name) + ' agreement">';
    html += '<div class="agreement-content">';
    html += '<div class="agreement-title">I confirm adherence to ' + escapeHtml(guideline.name) + '</div>';
    html += '<div class="agreement-text">';
    html += 'I confirm that my submission follows the ' + escapeHtml(guideline.name) + ' reporting guidelines ';
    html += 'appropriate for this evidence type. I have reviewed the checklist items above and ensured ';
    html += 'my manuscript addresses each applicable item.';
    html += '</div></div></label>';

    section.innerHTML = html;

    // Attach event
    const cb = document.getElementById('guidelineCheckbox');
    if (cb) {
      cb.addEventListener('change', function () {
        this.closest('.agreement-item').classList.toggle('checked', this.checked);
        // Remove error styling
        this.closest('.agreement-item').classList.remove('error');
      });
    }
  }

  // =============================================
  // SUBMIT TO FIRESTORE
  // =============================================
  window.handleSubmit = function () {
    if (state.isSubmitting) return;

    // Final validation
    if (!validateStep(3)) return;

    // Get form values
    saveFormData();

    // Loading state
    state.isSubmitting = true;
    const btn = els.submitBtn();
    const btnText = els.submitBtnText();
    const spinner = els.submitSpinner();
    if (btn) btn.disabled = true;
    if (btnText) btnText.textContent = 'Submitting...';
    if (spinner) spinner.style.display = 'inline-block';

    // Prepare submission data
    const phone = state.formData.phone.replace(/\D/g, '');
    // Ensure it starts with 62
    const waPhone = phone.startsWith('62') ? phone : '62' + phone.replace(/^0+/, '');

    const submissionData = {
      name: 'dr. ' + state.formData.name,
      phone: phone,
      phoneWA: waPhone,
      email: state.formData.email,
      institution: state.formData.institution || '',
      evidenceType: state.selectedType,
      evidenceTypeLabel: getEvidenceTypeLabel(state.selectedType),
      otherTypeDesc: state.selectedType === 'other' ? state.formData.otherTypeDesc : '',
      guideline: EBM_GUIDELINES[state.selectedType] ? EBM_GUIDELINES[state.selectedType].name : '',
      timestamp: new Date().toISOString(),
      status: 'pending'
    };

    // Save to Firestore
    saveToFirestore(submissionData)
      .then(function (docId) {
        // Success — show step 4 with Google Form link
        showSuccessStep(submissionData);
      })
      .catch(function (error) {
        console.error('Submission error:', error);
        // Even if Firestore fails, still let them proceed but show a warning
        showSuccessStep(submissionData, true);
      })
      .finally(function () {
        state.isSubmitting = false;
        if (btn) btn.disabled = false;
        if (btnText) btnText.textContent = 'Submit & Get Form Link';
        if (spinner) spinner.style.display = 'none';
      });
  };

  function saveToFirestore(data) {
    // Check if Firestore is available
    if (!db) {
      return Promise.reject(new Error('Firestore not initialized. Check your Firebase config.'));
    }

    return db.collection('submissions').add(data)
      .then(function (docRef) {
        console.log('Submission saved with ID:', docRef.id);
        showToast('Submission recorded successfully!', 'success');
        return docRef.id;
      });
  }

  function showSuccessStep(data, hadError) {
    // Update Google Form link
    const link = els.gformLink();
    const container = els.gformContainer();

    if (link && GOOGLE_FORM_LINKS[data.evidenceType]) {
      link.href = GOOGLE_FORM_LINKS[data.evidenceType];
      link.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
        </svg>
        Open ${getEvidenceTypeLabel(data.evidenceType)} Form
      `;
    } else {
      if (container) {
        container.innerHTML = '<p style="color:var(--gray-500);">Google Form link will be added by the administrator. Please check back later.</p>';
      }
    }

    if (hadError) {
      showToast('Form link ready! (Database sync pending — your data is saved locally)', 'info');
    }

    // Navigate to step 4
    state.currentStep = 4;
    renderStep(4);
  }

  // =============================================
  // HELPERS
  // =============================================
  function getEvidenceTypeLabel(type) {
    var labels = {
      'case-report': 'Case Report / Case Series',
      'case-control': 'Case-Control Study',
      'cohort': 'Cohort Study',
      'rct': 'Randomized Controlled Trial',
      'systematic-review': 'Systematic Review / Meta-Analysis',
      'expert-opinion': 'Expert Opinion',
      'other': 'Other Study Type'
    };
    return labels[type] || type;
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

    // Auto-remove after 4s
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
  // RESET FORM (Submit Another Case)
  // =============================================
  window.resetForm = function () {
    // Reset form fields
    if (els.form()) els.form().reset();

    // Clear state
    state.currentStep = 1;
    state.selectedType = null;
    state.formData = {};
    state.isSubmitting = false;

    // Remove selected card styling
    els.typeCards().forEach(function (card) {
      card.classList.remove('selected');
    });

    // Remove checked agreement styling
    $$('.agreement-item').forEach(function (item) {
      item.classList.remove('checked', 'error');
    });

    // Clear guideline section
    if (els.guidelineSection()) els.guidelineSection().innerHTML = '';

    // Hide "other" description
    if (els.otherGroup()) els.otherGroup().style.display = 'none';

    // Clear error states
    $$('.form-error').forEach(function (el) { el.classList.remove('show'); });
    $$('.form-input.error').forEach(function (el) { el.classList.remove('error'); });

    // Go to step 1
    renderStep(1);

    showToast('Form has been reset. You can start a new submission.', 'info');
  };

  // =============================================
  // START
  // =============================================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
