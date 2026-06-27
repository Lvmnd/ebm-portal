/**
 * EBM Portal — Firebase Configuration
 * =============================================
 *
 * INSTRUCTIONS:
 * 1. Go to https://console.firebase.google.com/
 * 2. Create a new project (or use existing)
 * 3. Enable Firestore Database (start in test mode)
 * 4. Enable Authentication → Sign-in method → Email/Password
 * 5. Register a Web App to get your config values
 * 6. Copy your config values below
 * 7. Create an admin user in Firebase Authentication
 *
 * IMPORTANT: For GitHub Pages, Firebase security rules must be configured
 * to allow reads/writes from your domain. See README for details.
 */

const firebaseConfig = {
  apiKey: "AIzaSyCahCLjDlATzEbdBpll2k-LBPbcZVwrV-8",
  authDomain: "ebm-portal.firebaseapp.com",
  projectId: "ebm-portal",
  storageBucket: "ebm-portal.firebasestorage.app",
  messagingSenderId: "292424165502",
  appId: "1:292424165502:web:a6081bdff6f5f8bcf9502f"
};

/**
 * Google Form Links — Replace with your actual form URLs.
 * Each evidence type should have a corresponding Google Form.
 *
 * To create forms:
 * 1. Go to https://forms.google.com/
 * 2. Create a form for each evidence type with the relevant checklist items
 * 3. Publish and copy the "Send" link
 * 4. Paste the links below
 */
const GOOGLE_FORM_LINKS = {
  "systematic-review": "https://forms.gle/8WzurEt4wkk5qNiv5",
  "rct": "https://forms.gle/TM4QB2L2sBK3UjUf6",
  "cohort": "https://forms.gle/Eqyv5QYLVchWw8LbA",
  "case-control": "https://forms.gle/SaAD5LfEoBDjTWay9",
  "case-report": "https://forms.gle/egXwufZZrFUERP1u8",
  "expert-opinion": "https://forms.gle/hseH1eHc1wppupbF6",
  "other": "https://forms.gle/hseH1eHc1wppupbF6"
};

/**
 * Google Form Field Entry IDs — for prefilling doctor name into the form.
 * This eliminates the need for doctors to enter their name twice.
 *
 * How to get entry IDs:
 * 1. Open your Google Form → click ⋮ → "Get pre-filled link"
 * 2. Fill in the doctor name field with anything
 * 3. Click "Get Link" and copy the URL
 * 4. Extract the entry.XXXXXXXXX value after the field value
 *    Example: ?entry.17404869=dr.+Test → entry.17404869
 *
 * Leave empty string "" if the form doesn't have a doctor name field.
 */
const FORM_FIELD_IDS = {
  "case-report":      { doctorName: "entry.17404869" },
  "case-control":     { doctorName: "" },
  "cohort":           { doctorName: "" },
  "rct":              { doctorName: "" },
  "systematic-review":{ doctorName: "" },
  "expert-opinion":   { doctorName: "" },
  "other":            { doctorName: "" }
};

/**
 * Guideline descriptions for each evidence type
 */
const EBM_GUIDELINES = {
  "case-report": {
    name: "CARE (CAse REport)",
    description: "The CARE guidelines provide a framework for reporting case reports. They include 13 items covering title, abstract, introduction, patient information, clinical findings, timeline, diagnostic assessment, therapeutic intervention, follow-up and outcomes, discussion, patient perspective, and informed consent.",
    url: "https://www.care-statement.org/",
    items: [
      "Title — The word 'case report' should appear in the title",
      "Abstract — Structured summary including introduction, case presentation, and conclusion",
      "Introduction — Brief background with citation of relevant literature",
      "Patient Information — Demographics, medical history, family history, psychosocial history",
      "Clinical Findings — Relevant physical examination and clinical findings",
      "Timeline — Chronological description of the case",
      "Diagnostic Assessment — Diagnostic methods, challenges, and reasoning",
      "Therapeutic Intervention — Types, dosage, duration of interventions",
      "Follow-up & Outcomes — Clinical outcomes, follow-up results",
      "Discussion — Strengths, limitations, and relevance to existing literature",
      "Patient Perspective — The patient's experience and perspective when available",
      "Informed Consent — Statement that informed consent was obtained"
    ]
  },
  "case-control": {
    name: "STROBE (STrengthening the Reporting of OBservational Studies in Epidemiology)",
    description: "The STROBE checklist for case-control studies includes 22 items covering title, abstract, introduction, methods (study design, setting, participants, variables, data sources, bias, sample size), statistical methods, results, discussion, and funding.",
    url: "https://www.strobe-statement.org/",
    items: [
      "Title & Abstract — Indicate study design in title, provide structured abstract",
      "Background & Objectives — Scientific background and specific objectives",
      "Study Design — Key elements of study design",
      "Setting — Locations, data sources, and date ranges",
      "Participants — Eligibility criteria, sources, and selection methods for cases and controls",
      "Variables — Clearly define outcomes, exposures, confounders, and effect modifiers",
      "Data Sources — Describe data sources and measurement methods",
      "Bias — Describe efforts to address potential sources of bias",
      "Sample Size — Explain how sample size was determined",
      "Statistical Methods — Describe all statistical methods used"
    ]
  },
  "cohort": {
    name: "STROBE (STrengthening the Reporting of OBservational Studies in Epidemiology)",
    description: "The STROBE checklist for cohort studies includes 22 items covering title, abstract, introduction, methods (study design, setting, participants, variables, data sources, bias, sample size), statistical methods, results, discussion, and funding.",
    url: "https://www.strobe-statement.org/",
    items: [
      "Title & Abstract — Indicate study design in title, provide structured abstract",
      "Background & Objectives — Scientific background and specific objectives",
      "Study Design — Key elements of study design",
      "Setting — Locations, data sources, and date ranges",
      "Participants — Eligibility criteria, sources, and methods for cohort selection",
      "Variables — Clearly define outcomes, exposures, confounders, and effect modifiers",
      "Data Sources — Describe data sources and measurement methods",
      "Bias — Describe efforts to address potential sources of bias",
      "Sample Size — Explain how sample size was determined",
      "Follow-up — Describe length and completeness of follow-up"
    ]
  },
  "rct": {
    name: "CONSORT (CONsolidated Standards of Reporting Trials)",
    description: "The CONSORT statement includes a 25-item checklist and a flow diagram for reporting parallel-group randomized controlled trials. It covers title, abstract, introduction, methods (trial design, participants, interventions, outcomes, sample size, randomization, blinding), results (participant flow, recruitment, baseline data, outcomes), discussion, and registration.",
    url: "https://www.consort-statement.org/",
    items: [
      "Title & Abstract — Identify as randomized trial in title, provide structured abstract",
      "Background & Objectives — Scientific background and specific objectives",
      "Trial Design — Description of trial design (e.g., parallel, factorial)",
      "Participants — Eligibility criteria, settings, and locations",
      "Interventions — Details of interventions for each group",
      "Outcomes — Primary and secondary outcome measures",
      "Sample Size — How sample size was determined",
      "Randomization — Sequence generation, allocation concealment, and implementation",
      "Blinding — Who was blinded and how",
      "Statistical Methods — Methods for primary and secondary outcomes"
    ]
  },
  "systematic-review": {
    name: "PRISMA (Preferred Reporting Items for Systematic Reviews and Meta-Analyses)",
    description: "The PRISMA 2020 statement includes a 27-item checklist and a flow diagram for reporting systematic reviews and meta-analyses. It covers title, abstract, introduction (rationale, objectives), methods (eligibility, information sources, search strategy, selection, data collection, risk of bias, effect measures, synthesis), results, discussion, and registration.",
    url: "https://www.prisma-statement.org/",
    items: [
      "Title — Identify the report as a systematic review",
      "Abstract — Structured summary including background, methods, results, and conclusions",
      "Rationale — Describe the rationale for the review",
      "Objectives — Provide an explicit statement of objectives",
      "Eligibility Criteria — Specify inclusion and exclusion criteria",
      "Information Sources — Describe all databases, registers, and other sources",
      "Search Strategy — Present the full search strategy for at least one database",
      "Selection Process — Specify the methods used to decide which studies to include",
      "Data Collection — Describe data extraction methods",
      "Risk of Bias — Describe methods for assessing risk of bias of included studies"
    ]
  },
  "expert-opinion": {
    name: "General Expert Opinion Standards",
    description: "Expert opinions provide valuable clinical perspectives based on extensive experience. Please ensure transparency about the basis of your opinion, acknowledge limitations, and disclose any relevant experience or qualifications.",
    url: "#",
    items: [
      "Qualifications — State the basis of expertise and relevant qualifications",
      "Rationale — Clearly explain the reasoning behind your opinion",
      "Evidence — Reference supporting evidence where available",
      "Limitations — Acknowledge the limitations of expert opinion as evidence",
      "Disclosures — Disclose any conflicts of interest or competing perspectives"
    ]
  },
  "other": {
    name: "General Reporting Standards",
    description: "Please follow accepted reporting standards appropriate for your study type. Ensure ethical compliance, transparency, and reproducibility.",
    url: "#",
    items: [
      "Ethical approval — Confirm ethical approval or exemption",
      "Transparency — Ensure all methods, results, and analyses are clearly reported",
      "Reproducibility — Provide sufficient detail for replication",
      "Data availability — State whether data are available and how to access them"
    ]
  }
};

// Initialize Firebase only once
if (typeof firebase !== 'undefined' && !firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore ? firebase.firestore() : null;
