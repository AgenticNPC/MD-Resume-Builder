// ===== DOM ELEMENTS =====
const editor = document.getElementById('editor');
const preview = document.getElementById('preview');
const charCount = document.getElementById('char-count');
const themeSelect = document.getElementById('theme-select');
const btnLoadSample = document.getElementById('btn-load-sample');
const btnClear = document.getElementById('btn-clear');
const btnExportPdf = document.getElementById('btn-export-pdf');
const resizeHandle = document.getElementById('resize-handle');
const editorPane = document.getElementById('editor-pane');
const previewPane = document.getElementById('preview-pane');

// ===== SAMPLE RESUME =====
const SAMPLE_RESUME = `# Alexandra Chen
## Senior Full-Stack Engineer · San Francisco, CA

[alex@chen.dev](mailto:alex@chen.dev) · [linkedin.com/in/alexchen](https://linkedin.com) · [github.com/alexchen](https://github.com)

---

### Summary

Passionate full-stack engineer with 7+ years of experience building scalable web applications. Expertise in React, Node.js, and cloud architecture. Led teams of 5-12 engineers shipping products used by millions.

---

### Experience

#### Senior Software Engineer — Stripe
*Jan 2022 – Present*

- Architected a real-time payment analytics dashboard serving 50K+ merchants
- Reduced API response times by 40% through query optimization and caching strategies
- Mentored 4 junior engineers, establishing code review best practices

#### Software Engineer — Airbnb
*Mar 2019 – Dec 2021*

- Built the guest messaging system handling 2M+ messages/day using React and GraphQL
- Implemented A/B testing framework that increased booking conversion by 12%
- Led migration from legacy REST APIs to GraphQL, reducing frontend data fetching by 60%

#### Junior Developer — Startup Co
*Jun 2017 – Feb 2019*

- Developed full-stack features using React, Express, and PostgreSQL
- Built CI/CD pipelines reducing deployment time from 2 hours to 15 minutes

---

### Skills

**Languages:** JavaScript, TypeScript, Python, Go, SQL
**Frontend:** React, Next.js, Vue.js, Tailwind CSS
**Backend:** Node.js, Express, FastAPI, GraphQL
**Cloud:** AWS (Lambda, DynamoDB, S3), GCP, Docker, Kubernetes
**Tools:** Git, GitHub Actions, Terraform, Datadog

---

### Education

#### B.S. Computer Science — UC Berkeley
*Class of 2017 · GPA: 3.8*

---

### Projects

#### **Open Source Contribution — React Query**
Core contributor with 15+ merged PRs improving caching and mutation handling

#### **DevTools CLI**
Built a developer productivity CLI tool with 2K+ GitHub stars
`;

// ===== MARKDOWN RENDERING =====
marked.setOptions({
    breaks: true,
    gfm: true,
});

function renderPreview() {
    const text = editor.value;
    if (!text.trim()) {
        preview.innerHTML = `
            <div class="preview-placeholder">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5">
                    <rect x="8" y="4" width="32" height="40" rx="3"/>
                    <line x1="14" y1="14" x2="34" y2="14"/>
                    <line x1="14" y1="20" x2="30" y2="20"/>
                    <line x1="14" y1="26" x2="34" y2="26"/>
                    <line x1="14" y1="32" x2="26" y2="32"/>
                </svg>
                <p>Your resume preview will appear here</p>
            </div>
        `;
        return;
    }
    preview.innerHTML = marked.parse(text);
    charCount.textContent = `${text.length} chars`;
}

// ===== DEBOUNCE =====
let renderTimeout;
editor.addEventListener('input', () => {
    clearTimeout(renderTimeout);
    renderTimeout = setTimeout(renderPreview, 80);
    charCount.textContent = `${editor.value.length} chars`;
});

// ===== THEME SWITCHING =====
themeSelect.addEventListener('change', () => {
    const theme = themeSelect.value;
    preview.className = `resume-theme-${theme}`;
    renderPreview();
});

// ===== SAMPLE LOAD =====
btnLoadSample.addEventListener('click', () => {
    editor.value = SAMPLE_RESUME;
    renderPreview();
    editor.focus();
});

// ===== CLEAR =====
btnClear.addEventListener('click', () => {
    if (editor.value && !confirm('Clear all content?')) return;
    editor.value = '';
    renderPreview();
    charCount.textContent = '0 chars';
    editor.focus();
});

// ===== PDF EXPORT =====
btnExportPdf.addEventListener('click', () => {
    if (typeof html2pdf === 'undefined') {
        window.print();
        return;
    }
    
    const element = document.getElementById('preview');
    // Ensure the preview content isn't empty
    if (!editor.value.trim()) {
        alert('Please write something in the editor before exporting.');
        return;
    }

    const opt = {
        margin:       [0, 0, 0, 0], // CSS padding handles margins
        filename:     'my-resume.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, letterRendering: true },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    
    const originalText = btnExportPdf.innerHTML;
    btnExportPdf.innerHTML = 'Exporting...';
    btnExportPdf.style.pointerEvents = 'none';
    
    html2pdf().set(opt).from(element).save().then(() => {
        btnExportPdf.innerHTML = originalText;
        btnExportPdf.style.pointerEvents = 'auto';
    }).catch(err => {
        console.error('PDF generation error:', err);
        btnExportPdf.innerHTML = originalText;
        btnExportPdf.style.pointerEvents = 'auto';
        alert('There was an error generating the PDF. Falling back to print dialog.');
        window.print();
    });
});

// ===== RESIZE HANDLE =====
let isResizing = false;

resizeHandle.addEventListener('mousedown', (e) => {
    isResizing = true;
    resizeHandle.classList.add('active');
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    e.preventDefault();
});

document.addEventListener('mousemove', (e) => {
    if (!isResizing) return;
    const container = document.getElementById('main-content');
    const containerRect = container.getBoundingClientRect();
    const percentage = ((e.clientX - containerRect.left) / containerRect.width) * 100;
    const clamped = Math.max(20, Math.min(80, percentage));
    editorPane.style.flex = `0 0 ${clamped}%`;
    previewPane.style.flex = `0 0 ${100 - clamped}%`;
});

document.addEventListener('mouseup', () => {
    if (isResizing) {
        isResizing = false;
        resizeHandle.classList.remove('active');
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
    }
});

// ===== TAB KEY SUPPORT =====
editor.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
        e.preventDefault();
        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        editor.value = editor.value.substring(0, start) + '  ' + editor.value.substring(end);
        editor.selectionStart = editor.selectionEnd = start + 2;
        renderPreview();
    }
});

// ===== LOCAL STORAGE =====
const STORAGE_KEY = 'md-resume-content';
const THEME_KEY = 'md-resume-theme';

// Load saved content
const savedContent = localStorage.getItem(STORAGE_KEY);
const savedTheme = localStorage.getItem(THEME_KEY);

if (savedContent) {
    editor.value = savedContent;
} else {
    editor.value = SAMPLE_RESUME;
}

if (savedTheme) {
    themeSelect.value = savedTheme;
    preview.className = `resume-theme-${savedTheme}`;
}

renderPreview();

// Auto-save
editor.addEventListener('input', () => {
    localStorage.setItem(STORAGE_KEY, editor.value);
});

themeSelect.addEventListener('change', () => {
    localStorage.setItem(THEME_KEY, themeSelect.value);
});
