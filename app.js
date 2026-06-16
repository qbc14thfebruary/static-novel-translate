class DataProcessor {
    constructor() {
        this.isProcessing = false;
        this.currentEndpoint = '';
        this.chapterCounter = 0;
        
        // Load config từ localStorage thay vì fetch API
        this.config = JSON.parse(localStorage.getItem('extractor_config')) || {
            title_selector: "h1",
            content_selectors: [".content p", "#content p"],
            blacklist: ["script", "style"]
        };

        this.initElements();
        this.initEventListeners();
    }

    initElements() {
        this.urlInput = document.getElementById('urlInput');
        this.processBtn = document.getElementById('processBtn');
        this.progressFill = document.getElementById('progressFill');
        this.translatedContent = document.getElementById('translatedContent');
        this.contentTitle = document.getElementById('contentTitle');
        this.configEditor = document.getElementById('configEditor');
        this.configOverlay = document.getElementById('configOverlay');
    }

    initEventListeners() {
        this.processBtn.addEventListener('click', () => this.fetchAndProcess());
        document.getElementById('saveConfigBtn').addEventListener('click', () => this.saveConfig());
        document.getElementById('toggleConfigBtn').addEventListener('click', () => this.configOverlay.classList.toggle('active'));
    }

    // Xử lý fetch nội dung qua Proxy
    async fetchAndProcess() {
        const url = this.urlInput.value.trim();
        if (!url) return;

        this.setProcessing(true);
        // Sử dụng CORS Proxy để bypass lỗi CORS
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
        
        try {
            const response = await fetch(proxyUrl);
            const html = await response.text();
            const doc = new DOMParser().parseFromString(html, 'text/html');

            const title = doc.querySelector(this.config.title_selector)?.innerText || "Không tiêu đề";
            this.contentTitle.textContent = title;

            let paragraphs = [];
            for (let sel of this.config.content_selectors) {
                const els = doc.querySelectorAll(sel);
                if (els.length > 0) {
                    paragraphs = Array.from(els).map(p => p.innerText.trim()).filter(t => t);
                    break;
                }
            }

            const translated = await this.translateText(paragraphs.join('\n\n'));
            this.translatedContent.innerHTML = translated.split('\n\n').map(p => `<p>${p}</p>`).join('');
        } catch (e) {
            this.showToast('Lỗi: ' + e.message, 'error');
        } finally {
            this.setProcessing(false);
        }
    }

    // Dịch bằng Google Translate API (client-side)
    async translateText(text) {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=vi&dt=t&q=${encodeURIComponent(text)}`;
        const res = await fetch(url);
        const data = await res.json();
        return data[0].map(item => item[0]).join('');
    }

    saveConfig() {
        const newConfig = JSON.parse(this.configEditor.value);
        localStorage.setItem('extractor_config', JSON.stringify(newConfig));
        this.config = newConfig;
        this.showToast('Đã lưu cấu hình!', 'success');
    }

    setProcessing(p) {
        this.isProcessing = p;
        this.processBtn.disabled = p;
    }

    showToast(msg, type) {
        const toast = document.getElementById('toast');
        toast.textContent = msg;
        toast.className = `toast ${type} show`;
        setTimeout(() => toast.classList.remove('show'), 3000);
    }
}

document.addEventListener('DOMContentLoaded', () => new DataProcessor());