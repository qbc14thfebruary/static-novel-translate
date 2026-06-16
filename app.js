class DataProcessor {
    constructor() {
        // Load cấu hình từ localStorage thay vì fetch API
        this.config = JSON.parse(localStorage.getItem('extractor_config')) || {
            title_selector: "h1",
            content_selectors: [".content p", "#content p"],
            blacklist: ["script", "style"]
        };
        this.initElements();
        // Không gọi this.loadConfig() nữa
    }

    // Thay thế fetch('/api/fetch') bằng DOMParser tại client
    async fetchAndProcess() {
        const url = this.urlInput.value.trim();
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
        
        try {
            const response = await fetch(proxyUrl);
            const html = await response.text();
            const doc = new DOMParser().parseFromString(html, 'text/html');
            // ... (xử lý logic bóc tách nội dung tại đây)
        } catch (e) {
            console.error(e);
        }
    }

    // Lưu config vào localStorage thay vì fetch API POST
    saveConfig() {
        localStorage.setItem('extractor_config', this.configEditor.value);
        this.showToast('✅ Đã lưu cấu hình vào trình duyệt');
    }
}
