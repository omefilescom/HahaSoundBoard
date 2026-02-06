// OState Library - Modern System Monitoring Dashboard
// Real Data Only Version
class OState {
    constructor() {
        // Smart detection for development/debug mode
        this.isDevEnvironment = this._detectDevEnvironment();
        this.shouldRender = this.isDevEnvironment || this._hasDebugParam();
        
        if (!this.shouldRender) {
            console.log('OState: Running in production mode. Dashboard disabled.');
            return; // Stop execution for production
        }
        
        console.log('OState: Running in development/debug mode. Dashboard enabled.');
        
        this.modal = null;
        this.isOpen = false;
        this.data = {};
        this.analyticsData = [];
        this.initStyles();
        this.createButton();
    }

    // Smart environment detection
    _detectDevEnvironment() {
        const hostname = window.location.hostname;
        const protocol = window.location.protocol;
        
        // Check for localhost/127.0.0.1
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return true;
        }
        
        // Check for file protocol (opening from folder)
        if (protocol === 'file:') {
            return true;
        }
        
        // Check for common dev ports
        const port = window.location.port;
        const devPorts = ['3000', '3001', '4200', '8080', '8000', '9000'];
        if (devPorts.includes(port)) {
            return true;
        }
        
        // Check for local network (192.168.x.x, 10.x.x.x)
        const ipPattern = /^(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/;
        if (ipPattern.test(hostname)) {
            return true;
        }
        
        return false;
    }

    // Check for debug parameter
    _hasDebugParam() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.has('debug') || urlParams.get('debug') === 'true';
    }

    initStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* Modern Minimalist Design - No Gradients */
            .ostate-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(15, 23, 42, 0.98);
                backdrop-filter: blur(20px);
                display: none;
                justify-content: center;
                align-items: center;
                z-index: 9999;
                animation: ostateFadeIn 0.3s ease;
            }

            @keyframes ostateFadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }

            .ostate-modal {
                background: #0f172a;
                border-radius: 20px;
                width: 90%;
                max-width: 1400px;
                max-height: 90vh;
                overflow: hidden;
                border: 1px solid #334155;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            }

            .ostate-header {
                padding: 24px 32px;
                background: #1e293b;
                border-bottom: 1px solid #334155;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .ostate-title {
                font-size: 1.8rem;
                font-weight: 700;
                color: #f1f5f9;
                display: flex;
                align-items: center;
                gap: 12px;
            }

            .ostate-close {
                background: #334155;
                border: none;
                color: #94a3b8;
                width: 40px;
                height: 40px;
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.2s ease;
                font-size: 1.2rem;
            }

            .ostate-close:hover {
                background: #475569;
                color: #e2e8f0;
            }

            .ostate-content {
                padding: 32px;
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
                gap: 24px;
                overflow-y: auto;
                max-height: calc(90vh - 100px);
            }

            .ostate-card {
                background: #1e293b;
                border-radius: 16px;
                padding: 24px;
                border: 1px solid #334155;
                transition: all 0.3s ease;
            }

            .ostate-card:hover {
                transform: translateY(-2px);
                border-color: #475569;
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
            }

            .ostate-card-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 20px;
            }

            .ostate-card-title {
                font-size: 1.1rem;
                font-weight: 600;
                color: #f1f5f9;
                display: flex;
                align-items: center;
                gap: 10px;
            }

            .ostate-card-icon {
                width: 36px;
                height: 36px;
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: #334155;
                color: #60a5fa;
            }

            .ostate-card-value {
                font-size: 2.2rem;
                font-weight: 700;
                color: #f1f5f9;
                margin-bottom: 8px;
                font-family: 'JetBrains Mono', 'SF Mono', monospace;
            }

            .ostate-card-unit {
                font-size: 1rem;
                color: #94a3b8;
                margin-left: 4px;
                font-weight: 400;
            }

            .ostate-card-desc {
                color: #94a3b8;
                font-size: 0.9rem;
                line-height: 1.5;
                margin-bottom: 16px;
            }

            .ostate-progress {
                height: 6px;
                background: #334155;
                border-radius: 3px;
                margin: 16px 0;
                overflow: hidden;
            }

            .ostate-progress-bar {
                height: 100%;
                background: #3b82f6;
                border-radius: 3px;
                transition: width 0.5s ease;
            }

            .ostate-progress-bar.warning {
                background: #f59e0b;
            }

            .ostate-progress-bar.danger {
                background: #ef4444;
            }

            .ostate-stats {
                display: flex;
                justify-content: space-between;
                color: #94a3b8;
                font-size: 0.9rem;
                margin-top: 12px;
            }

            .ostate-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 12px;
                margin-top: 16px;
            }

            .ostate-grid-item {
                background: #0f172a;
                padding: 12px;
                border-radius: 8px;
                border: 1px solid #334155;
            }

            .ostate-grid-label {
                font-size: 0.8rem;
                color: #94a3b8;
                margin-bottom: 4px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            .ostate-grid-value {
                font-size: 1.1rem;
                color: #f1f5f9;
                font-weight: 600;
                font-family: 'JetBrains Mono', 'SF Mono', monospace;
            }

            .ostate-button {
                position: fixed;
                bottom: 30px;
                right: 30px;
                background: #1e293b;
                color: #f1f5f9;
                border: 1px solid #334155;
                padding: 14px 24px;
                font-size: 1rem;
                border-radius: 12px;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 10px;
                transition: all 0.3s ease;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
                z-index: 9998;
                font-weight: 500;
                font-family: 'Inter', sans-serif;
            }

            .ostate-button:hover {
                background: #334155;
                transform: translateY(-2px);
                box-shadow: 0 6px 25px rgba(0, 0, 0, 0.3);
            }

            .ostate-button:active {
                transform: translateY(0);
            }

            .ostate-button-icon {
                font-size: 1.2rem;
            }

            .ostate-status {
                display: inline-block;
                width: 8px;
                height: 8px;
                border-radius: 50%;
                margin-right: 6px;
            }

            .ostate-status-online {
                background: #10b981;
            }

            .ostate-status-offline {
                background: #ef4444;
            }

            .ostate-status-warning {
                background: #f59e0b;
            }

            .ostate-analytics {
                grid-column: 1 / -1;
                background: #1e293b;
                border-radius: 16px;
                padding: 24px;
                border: 1px solid #334155;
            }

            .ostate-analytics-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 20px;
            }

            .ostate-analytics-title {
                font-size: 1.3rem;
                font-weight: 700;
                color: #f1f5f9;
                display: flex;
                align-items: center;
                gap: 10px;
            }

            .ostate-analytics-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 16px;
                margin-top: 20px;
            }

            .ostate-metric {
                background: #0f172a;
                padding: 20px;
                border-radius: 12px;
                border: 1px solid #334155;
            }

            .ostate-metric-value {
                font-size: 1.8rem;
                font-weight: 700;
                color: #f1f5f9;
                margin-bottom: 6px;
                font-family: 'JetBrains Mono', 'SF Mono', monospace;
            }

            .ostate-metric-label {
                font-size: 0.85rem;
                color: #94a3b8;
                text-transform: uppercase;
                letter-spacing: 1px;
            }

            .ostate-metric-change {
                font-size: 0.8rem;
                margin-top: 8px;
                display: flex;
                align-items: center;
                gap: 4px;
            }

            .ostate-change-up {
                color: #10b981;
            }

            .ostate-change-down {
                color: #ef4444;
            }

            .ostate-change-neutral {
                color: #94a3b8;
            }

            .ostate-badge {
                display: inline-block;
                padding: 4px 8px;
                background: #334155;
                color: #94a3b8;
                border-radius: 4px;
                font-size: 0.75rem;
                margin-left: 8px;
            }

            .ostate-table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 16px;
            }

            .ostate-table th {
                text-align: left;
                padding: 12px;
                border-bottom: 1px solid #334155;
                color: #94a3b8;
                font-weight: 600;
                font-size: 0.85rem;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            .ostate-table td {
                padding: 12px;
                border-bottom: 1px solid #334155;
                color: #f1f5f9;
                font-size: 0.9rem;
            }

            .ostate-table tr:hover {
                background: #0f172a;
            }

            @media (max-width: 768px) {
                .ostate-content {
                    grid-template-columns: 1fr;
                    padding: 20px;
                    gap: 16px;
                }
                
                .ostate-modal {
                    width: 95%;
                    border-radius: 16px;
                }
                
                .ostate-button {
                    bottom: 20px;
                    right: 20px;
                    padding: 12px 18px;
                    font-size: 0.9rem;
                }
                
                .ostate-header {
                    padding: 20px;
                }
            }

            /* Scrollbar Styling */
            ::-webkit-scrollbar {
                width: 8px;
            }

            ::-webkit-scrollbar-track {
                background: #1e293b;
                border-radius: 4px;
            }

            ::-webkit-scrollbar-thumb {
                background: #334155;
                border-radius: 4px;
            }

            ::-webkit-scrollbar-thumb:hover {
                background: #475569;
            }

            /* Animation for real-time updates */
            .ostate-update {
                animation: ostateUpdate 0.5s ease;
            }

            @keyframes ostateUpdate {
                0% { opacity: 0.7; }
                50% { opacity: 1; }
                100% { opacity: 0.7; }
            }
        `;
        document.head.appendChild(style);
    }

    createButton() {
        if (!this.shouldRender) return;
        
        this.button = document.createElement('button');
        this.button.className = 'ostate-button';
        this.button.innerHTML = `
            <span class="ostate-button-icon">📊</span>
            System Monitor
        `;
        this.button.onclick = () => this.open();
        document.body.appendChild(this.button);
    }

    createModal() {
        this.modal = document.createElement('div');
        this.modal.className = 'ostate-overlay';
        
        const modalContent = `
            <div class="ostate-modal">
                <div class="ostate-header">
                    <div class="ostate-title">
                        <span>📊</span>
                        OState Dashboard
                        <span class="ostate-badge">Development Mode</span>
                    </div>
                    <button class="ostate-close" onclick="window.OState.close()">✕</button>
                </div>
                <div class="ostate-content" id="ostate-content">
                    <!-- Content will be dynamically generated -->
                </div>
            </div>
        `;
        
        this.modal.innerHTML = modalContent;
        document.body.appendChild(this.modal);
    }

    async collectSystemData() {
        // Clear previous data
        this.data = {};

        // 1. MEMORY USAGE (Real)
        if (performance.memory) {
            const used = performance.memory.usedJSHeapSize;
            const total = performance.memory.totalJSHeapSize;
            const limit = performance.memory.jsHeapSizeLimit;
            
            this.data.memory = {
                usedMB: Math.round(used / 1048576),
                totalMB: Math.round(total / 1048576),
                limitMB: Math.round(limit / 1048576),
                percent: Math.round((used / total) * 100),
                isLow: (used / total) > 0.9
            };
        } else {
            // Fallback: Estimate based on performance timing
            const entries = performance.getEntriesByType("resource");
            const totalSize = entries.reduce((sum, entry) => {
                return sum + (entry.transferSize || 0);
            }, 0);
            
            this.data.memory = {
                usedMB: Math.round(totalSize / 1048576),
                totalMB: 1024, // Assume 1GB
                limitMB: 2048, // Assume 2GB limit
                percent: Math.round((totalSize / 1048576) / 10), // Estimate percentage
                isLow: false
            };
        }

        // 2. NETWORK INFORMATION (Real)
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        if (connection) {
            this.data.network = {
                type: connection.effectiveType,
                downlink: connection.downlink,
                rtt: connection.rtt,
                saveData: connection.saveData,
                online: navigator.onLine,
                downlinkMax: connection.downlinkMax || 10
            };
        } else {
            this.data.network = {
                type: 'unknown',
                downlink: 1,
                rtt: 100,
                saveData: false,
                online: navigator.onLine,
                downlinkMax: 10
            };
        }

        // 3. PERFORMANCE METRICS (Real)
        const perfEntries = performance.getEntriesByType("navigation");
        const paintEntries = performance.getEntriesByType("paint");
        
        let loadTime = 0;
        let domReady = 0;
        let ttfb = 0;
        
        if (perfEntries.length > 0) {
            const navTiming = perfEntries[0];
            loadTime = navTiming.loadEventEnd - navTiming.startTime;
            domReady = navTiming.domContentLoadedEventEnd - navTiming.startTime;
            ttfb = navTiming.responseStart - navTiming.requestStart;
        }

        // First Contentful Paint
        let fcp = 0;
        if (paintEntries.length > 0) {
            const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
            if (fcpEntry) fcp = fcpEntry.startTime;
        }

        this.data.performance = {
            loadTime: Math.round(loadTime),
            domReady: Math.round(domReady),
            ttfb: Math.round(ttfb),
            fcp: Math.round(fcp),
            now: Math.round(performance.now()),
            memorySupported: !!performance.memory,
            entriesCount: performance.getEntries().length
        };

        // 4. SCREEN INFORMATION (Real)
        this.data.screen = {
            width: screen.width,
            height: screen.height,
            availWidth: screen.availWidth,
            availHeight: screen.availHeight,
            colorDepth: screen.colorDepth,
            pixelRatio: window.devicePixelRatio,
            orientation: screen.orientation ? screen.orientation.type : 'unknown'
        };

        // 5. DEVICE INFORMATION (Real)
        this.data.device = {
            platform: navigator.platform,
            userAgent: navigator.userAgent,
            language: navigator.language,
            languages: navigator.languages,
            cookies: navigator.cookieEnabled,
            doNotTrack: navigator.doNotTrack || 'unspecified',
            maxTouchPoints: navigator.maxTouchPoints || 0,
            vendor: navigator.vendor,
            product: navigator.product,
            appVersion: navigator.appVersion
        };

        // 6. STORAGE INFORMATION (Real)
        if (navigator.storage && navigator.storage.estimate) {
            try {
                const estimate = await navigator.storage.estimate();
                this.data.storage = {
                    usedMB: Math.round(estimate.usage / 1048576),
                    quotaMB: Math.round(estimate.quota / 1048576),
                    percent: Math.round((estimate.usage / estimate.quota) * 100),
                    isPersisted: await navigator.storage.persisted ? 'Yes' : 'No'
                };
            } catch (e) {
                this.data.storage = {
                    usedMB: 0,
                    quotaMB: 0,
                    percent: 0,
                    isPersisted: 'Unknown',
                    error: e.message
                };
            }
        } else {
            this.data.storage = {
                usedMB: 0,
                quotaMB: 0,
                percent: 0,
                isPersisted: 'Not Supported'
            };
        }

        // 7. BATTERY STATUS (Real)
        if (navigator.getBattery) {
            try {
                const battery = await navigator.getBattery();
                this.data.battery = {
                    level: Math.round(battery.level * 100),
                    charging: battery.charging,
                    chargingTime: battery.chargingTime,
                    dischargingTime: battery.dischargingTime,
                    supported: true
                };
            } catch (e) {
                this.data.battery = {
                    level: 0,
                    charging: false,
                    chargingTime: Infinity,
                    dischargingTime: Infinity,
                    supported: false,
                    error: e.message
                };
            }
        } else {
            this.data.battery = {
                level: 0,
                charging: false,
                chargingTime: Infinity,
                dischargingTime: Infinity,
                supported: false
            };
        }

        // 8. CPU INFORMATION (Real)
        this.data.cpu = {
            cores: navigator.hardwareConcurrency || 'unknown',
            platform: navigator.platform.includes('Win') ? 'Windows' : 
                     navigator.platform.includes('Mac') ? 'MacOS' :
                     navigator.platform.includes('Linux') ? 'Linux' : 'Other'
        };

        // 9. CONNECTION QUALITY (Calculated)
        let quality = 'excellent';
        if (this.data.network.rtt > 300) quality = 'poor';
        else if (this.data.network.rtt > 100) quality = 'average';
        else if (this.data.network.rtt > 50) quality = 'good';
        
        this.data.connectionQuality = quality;

        // 10. SYSTEM LOAD (Calculated based on memory and performance)
        const memoryLoad = this.data.memory.percent;
        const networkLoad = (this.data.network.rtt > 100) ? 30 : 0;
        const totalLoad = Math.min(memoryLoad + networkLoad, 100);
        
        this.data.systemLoad = {
            total: totalLoad,
            memory: memoryLoad,
            network: networkLoad,
            status: totalLoad > 80 ? 'high' : totalLoad > 50 ? 'medium' : 'low'
        };

        // 11. BROWSER CAPABILITIES (Real)
        this.data.capabilities = {
            serviceWorker: 'serviceWorker' in navigator,
            webWorker: typeof Worker !== 'undefined',
            webGL: (() => {
                try {
                    const canvas = document.createElement('canvas');
                    return !!(window.WebGLRenderingContext && 
                             (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
                } catch (e) {
                    return false;
                }
            })(),
            webRTC: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
            geolocation: 'geolocation' in navigator,
            notifications: 'Notification' in window,
            pushManager: 'PushManager' in window,
            indexedDB: 'indexedDB' in window,
            localStorage: 'localStorage' in window,
            sessionStorage: 'sessionStorage' in window
        };

        // 12. ANALYTICS DATA (Historical)
        this.analyticsData.push({
            timestamp: Date.now(),
            memory: this.data.memory.percent,
            loadTime: this.data.performance.loadTime,
            rtt: this.data.network.rtt,
            downlink: this.data.network.downlink
        });

        // Keep last 50 analytics entries
        if (this.analyticsData.length > 50) {
            this.analyticsData.shift();
        }
    }

    createMemoryCard() {
        const mem = this.data.memory;
        const progressClass = mem.isLow ? 'danger' : mem.percent > 70 ? 'warning' : '';
        
        return `
            <div class="ostate-card">
                <div class="ostate-card-header">
                    <div class="ostate-card-title">
                        <div class="ostate-card-icon">💾</div>
                        Memory Usage
                    </div>
                    <span class="ostate-status ostate-status-${mem.isLow ? 'offline' : mem.percent > 70 ? 'warning' : 'online'}"></span>
                </div>
                <div class="ostate-card-value">${mem.usedMB}<span class="ostate-card-unit">MB</span></div>
                <div class="ostate-card-desc">
                    ${mem.percent}% of ${mem.totalMB}MB used
                    ${mem.isLow ? '⚠️ Low memory' : ''}
                </div>
                <div class="ostate-progress">
                    <div class="ostate-progress-bar ${progressClass}" style="width: ${mem.percent}%"></div>
                </div>
                <div class="ostate-stats">
                    <span>Limit: ${mem.limitMB}MB</span>
                    <span>Free: ${mem.totalMB - mem.usedMB}MB</span>
                </div>
            </div>
        `;
    }

    createNetworkCard() {
        const net = this.data.network;
        
        return `
            <div class="ostate-card">
                <div class="ostate-card-header">
                    <div class="ostate-card-title">
                        <div class="ostate-card-icon">🌐</div>
                        Network
                    </div>
                    <span class="ostate-status ostate-status-${net.online ? 'online' : 'offline'}"></span>
                </div>
                <div class="ostate-card-value">${net.type.toUpperCase()}</div>
                <div class="ostate-card-desc">
                    ${net.online ? 'Connected' : 'Offline'} • ${net.saveData ? 'Data saver on' : 'Data saver off'}
                </div>
                <div class="ostate-grid">
                    <div class="ostate-grid-item">
                        <div class="ostate-grid-label">Downlink</div>
                        <div class="ostate-grid-value">${net.downlink} Mbps</div>
                    </div>
                    <div class="ostate-grid-item">
                        <div class="ostate-grid-label">Latency</div>
                        <div class="ostate-grid-value">${net.rtt} ms</div>
                    </div>
                    <div class="ostate-grid-item">
                        <div class="ostate-grid-label">Max Speed</div>
                        <div class="ostate-grid-value">${net.downlinkMax} Mbps</div>
                    </div>
                    <div class="ostate-grid-item">
                        <div class="ostate-grid-label">Quality</div>
                        <div class="ostate-grid-value">${this.data.connectionQuality}</div>
                    </div>
                </div>
            </div>
        `;
    }

    createPerformanceCard() {
        const perf = this.data.performance;
        
        return `
            <div class="ostate-card">
                <div class="ostate-card-header">
                    <div class="ostate-card-title">
                        <div class="ostate-card-icon">⚡</div>
                        Performance
                    </div>
                </div>
                <div class="ostate-card-value">${perf.loadTime}<span class="ostate-card-unit">ms</span></div>
                <div class="ostate-card-desc">
                    Total load time • ${perf.memorySupported ? 'Memory API: ✓' : 'Memory API: ✗'}
                </div>
                <div class="ostate-grid">
                    <div class="ostate-grid-item">
                        <div class="ostate-grid-label">DOM Ready</div>
                        <div class="ostate-grid-value">${perf.domReady}ms</div>
                    </div>
                    <div class="ostate-grid-item">
                        <div class="ostate-grid-label">TTFB</div>
                        <div class="ostate-grid-value">${perf.ttfb}ms</div>
                    </div>
                    <div class="ostate-grid-item">
                        <div class="ostate-grid-label">FCP</div>
                        <div class="ostate-grid-value">${perf.fcp}ms</div>
                    </div>
                    <div class="ostate-grid-item">
                        <div class="ostate-grid-label">Now</div>
                        <div class="ostate-grid-value">${perf.now}ms</div>
                    </div>
                </div>
                <div class="ostate-stats">
                    <span>Entries: ${perf.entriesCount}</span>
                    <span>Memory API: ${perf.memorySupported ? '✓' : '✗'}</span>
                </div>
            </div>
        `;
    }

    createDeviceCard() {
        const dev = this.data.device;
        
        return `
            <div class="ostate-card">
                <div class="ostate-card-header">
                    <div class="ostate-card-title">
                        <div class="ostate-card-icon">📱</div>
                        Device & Browser
                    </div>
                </div>
                <table class="ostate-table">
                    <tr>
                        <th>Property</th>
                        <th>Value</th>
                    </tr>
                    <tr>
                        <td>Platform</td>
                        <td>${dev.platform}</td>
                    </tr>
                    <tr>
                        <td>Language</td>
                        <td>${dev.language}</td>
                    </tr>
                    <tr>
                        <td>Vendor</td>
                        <td>${dev.vendor || 'Unknown'}</td>
                    </tr>
                    <tr>
                        <td>Cookies</td>
                        <td>${dev.cookies ? 'Enabled' : 'Disabled'}</td>
                    </tr>
                    <tr>
                        <td>Do Not Track</td>
                        <td>${dev.doNotTrack}</td>
                    </tr>
                    <tr>
                        <td>Touch Points</td>
                        <td>${dev.maxTouchPoints}</td>
                    </tr>
                </table>
            </div>
        `;
    }

    createScreenCard() {
        const screen = this.data.screen;
        
        return `
            <div class="ostate-card">
                <div class="ostate-card-header">
                    <div class="ostate-card-title">
                        <div class="ostate-card-icon">🖥️</div>
                        Screen
                    </div>
                </div>
                <div class="ostate-card-value">${screen.width}×${screen.height}</div>
                <div class="ostate-card-desc">
                    ${screen.orientation} • ${screen.colorDepth} bit • ${screen.pixelRatio}x
                </div>
                <div class="ostate-grid">
                    <div class="ostate-grid-item">
                        <div class="ostate-grid-label">Available</div>
                        <div class="ostate-grid-value">${screen.availWidth}×${screen.availHeight}</div>
                    </div>
                    <div class="ostate-grid-item">
                        <div class="ostate-grid-label">Color Depth</div>
                        <div class="ostate-grid-value">${screen.colorDepth} bit</div>
                    </div>
                    <div class="ostate-grid-item">
                        <div class="ostate-grid-label">Pixel Ratio</div>
                        <div class="ostate-grid-value">${screen.pixelRatio}</div>
                    </div>
                    <div class="ostate-grid-item">
                        <div class="ostate-grid-label">Orientation</div>
                        <div class="ostate-grid-value">${screen.orientation}</div>
                    </div>
                </div>
            </div>
        `;
    }

    createStorageCard() {
        const storage = this.data.storage;
        
        return `
            <div class="ostate-card">
                <div class="ostate-card-header">
                    <div class="ostate-card-title">
                        <div class="ostate-card-icon">💿</div>
                        Storage
                    </div>
                </div>
                <div class="ostate-card-value">${storage.usedMB}<span class="ostate-card-unit">MB</span></div>
                <div class="ostate-card-desc">
                    ${storage.percent}% of ${storage.quotaMB}MB used
                    ${storage.error ? '⚠️ ' + storage.error : ''}
                </div>
                <div class="ostate-progress">
                    <div class="ostate-progress-bar" style="width: ${storage.percent}%"></div>
                </div>
                <div class="ostate-stats">
                    <span>Persisted: ${storage.isPersisted}</span>
                    <span>Free: ${storage.quotaMB - storage.usedMB}MB</span>
                </div>
            </div>
        `;
    }

    createBatteryCard() {
        const battery = this.data.battery;
        
        if (!battery.supported) {
            return `
                <div class="ostate-card">
                    <div class="ostate-card-header">
                        <div class="ostate-card-title">
                            <div class="ostate-card-icon">🔋</div>
                            Battery
                        </div>
                    </div>
                    <div class="ostate-card-value">N/A</div>
                    <div class="ostate-card-desc">
                        Battery API not supported in this browser
                    </div>
                </div>
            `;
        }
        
        return `
            <div class="ostate-card">
                <div class="ostate-card-header">
                    <div class="ostate-card-title">
                        <div class="ostate-card-icon">🔋</div>
                        Battery
                    </div>
                    <span class="ostate-status ostate-status-${battery.level > 20 ? 'online' : 'offline'}"></span>
                </div>
                <div class="ostate-card-value">${battery.level}<span class="ostate-card-unit">%</span></div>
                <div class="ostate-card-desc">
                    ${battery.charging ? '⚡ Charging' : '🔋 Discharging'}
                    ${battery.chargingTime < Infinity ? `• ${Math.round(battery.chargingTime / 60)}min to full` : ''}
                </div>
                <div class="ostate-progress">
                    <div class="ostate-progress-bar ${battery.level < 20 ? 'danger' : ''}" style="width: ${battery.level}%"></div>
                </div>
                <div class="ostate-stats">
                    <span>Status: ${battery.charging ? 'Charging' : 'Discharging'}</span>
                    <span>Time remaining: ${battery.dischargingTime < Infinity ? Math.round(battery.dischargingTime / 60) + 'min' : '∞'}</span>
                </div>
            </div>
        `;
    }

    createCPUCard() {
        const cpu = this.data.cpu;
        
        return `
            <div class="ostate-card">
                <div class="ostate-card-header">
                    <div class="ostate-card-title">
                        <div class="ostate-card-icon">🔧</div>
                        System
                    </div>
                </div>
                <div class="ostate-card-value">${cpu.cores}<span class="ostate-card-unit">cores</span></div>
                <div class="ostate-card-desc">
                    ${cpu.platform} • Hardware concurrency
                </div>
                <div class="ostate-grid">
                    <div class="ostate-grid-item">
                        <div class="ostate-grid-label">Cores</div>
                        <div class="ostate-grid-value">${cpu.cores}</div>
                    </div>
                    <div class="ostate-grid-item">
                        <div class="ostate-grid-label">Platform</div>
                        <div class="ostate-grid-value">${cpu.platform}</div>
                    </div>
                    <div class="ostate-grid-item">
                        <div class="ostate-grid-label">System Load</div>
                        <div class="ostate-grid-value">${this.data.systemLoad.status}</div>
                    </div>
                    <div class="ostate-grid-item">
                        <div class="ostate-grid-label">Total Load</div>
                        <div class="ostate-grid-value">${this.data.systemLoad.total}%</div>
                    </div>
                </div>
            </div>
        `;
    }

    createCapabilitiesCard() {
        const caps = this.data.capabilities;
        const enabled = Object.values(caps).filter(v => v).length;
        const total = Object.keys(caps).length;
        
        return `
            <div class="ostate-card">
                <div class="ostate-card-header">
                    <div class="ostate-card-title">
                        <div class="ostate-card-icon">🔌</div>
                        Capabilities
                    </div>
                </div>
                <div class="ostate-card-value">${enabled}/${total}</div>
                <div class="ostate-card-desc">
                    ${Math.round((enabled/total)*100)}% of APIs supported
                </div>
                <table class="ostate-table">
                    <tr>
                        <th>Feature</th>
                        <th>Status</th>
                    </tr>
                    ${Object.entries(caps).map(([key, value]) => `
                        <tr>
                            <td>${key}</td>
                            <td>${value ? '✓' : '✗'}</td>
                        </tr>
                    `).join('')}
                </table>
            </div>
        `;
    }

    createAnalyticsCard() {
        if (this.analyticsData.length < 2) {
            return `
                <div class="ostate-analytics">
                    <div class="ostate-analytics-header">
                        <div class="ostate-analytics-title">
                            <span>📈</span>
                            Analytics
                        </div>
                        <div style="color: #94a3b8; font-size: 0.9rem;">Collecting data...</div>
                    </div>
                    <div style="color: #94a3b8; text-align: center; padding: 20px;">
                        Collecting historical data... (${this.analyticsData.length}/50 samples)
                    </div>
                </div>
            `;
        }
        
        const avgMemory = Math.round(this.analyticsData.reduce((sum, data) => sum + data.memory, 0) / this.analyticsData.length);
        const avgLoadTime = Math.round(this.analyticsData.reduce((sum, data) => sum + data.loadTime, 0) / this.analyticsData.length);
        const avgRTT = Math.round(this.analyticsData.reduce((sum, data) => sum + data.rtt, 0) / this.analyticsData.length);
        const avgDownlink = Math.round(this.analyticsData.reduce((sum, data) => sum + data.downlink, 0) / this.analyticsData.length);
        
        // Calculate trends
        const recentMemory = this.analyticsData.slice(-10);
        const oldMemory = this.analyticsData.slice(0, 10);
        const memoryTrend = recentMemory.length && oldMemory.length ? 
            (recentMemory.reduce((s, d) => s + d.memory, 0)/recentMemory.length) - 
            (oldMemory.reduce((s, d) => s + d.memory, 0)/oldMemory.length) : 0;
        
        return `
            <div class="ostate-analytics">
                <div class="ostate-analytics-header">
                    <div class="ostate-analytics-title">
                        <span>📈</span>
                        Analytics
                    </div>
                    <div style="color: #94a3b8; font-size: 0.9rem;">Last ${this.analyticsData.length} samples</div>
                </div>
                <div class="ostate-analytics-grid">
                    <div class="ostate-metric">
                        <div class="ostate-metric-value">${avgMemory}%</div>
                        <div class="ostate-metric-label">Avg Memory</div>
                        <div class="ostate-metric-change ostate-change-${memoryTrend > 0 ? 'up' : memoryTrend < 0 ? 'down' : 'neutral'}">
                            ${memoryTrend > 0 ? '↑' : memoryTrend < 0 ? '↓' : '→'} ${Math.abs(Math.round(memoryTrend))}%
                        </div>
                    </div>
                    <div class="ostate-metric">
                        <div class="ostate-metric-value">${avgLoadTime}ms</div>
                        <div class="ostate-metric-label">Avg Load Time</div>
                        <div class="ostate-metric-change ostate-change-neutral">
                            → Historical
                        </div>
                    </div>
                    <div class="ostate-metric">
                        <div class="ostate-metric-value">${avgRTT}ms</div>
                        <div class="ostate-metric-label">Avg Latency</div>
                        <div class="ostate-metric-change ostate-change-${avgRTT > 100 ? 'down' : 'up'}">
                            ${avgRTT > 100 ? '↓' : '↑'} ${avgRTT > 100 ? 'High' : 'Good'}
                        </div>
                    </div>
                    <div class="ostate-metric">
                        <div class="ostate-metric-value">${avgDownlink}</div>
                        <div class="ostate-metric-label">Avg Downlink</div>
                        <div class="ostate-metric-change ostate-change-${avgDownlink > 5 ? 'up' : 'down'}">
                            ${avgDownlink > 5 ? '↑' : '↓'} ${avgDownlink > 5 ? 'Fast' : 'Slow'}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    updateModalContent() {
        const content = document.getElementById('ostate-content');
        if (!content) return;

        content.innerHTML = `
            ${this.createMemoryCard()}
            ${this.createNetworkCard()}
            ${this.createPerformanceCard()}
            ${this.createScreenCard()}
            ${this.createStorageCard()}
            ${this.createBatteryCard()}
            ${this.createDeviceCard()}
            ${this.createCPUCard()}
            ${this.createCapabilitiesCard()}
            ${this.createAnalyticsCard()}
        `;
    }

    async open() {
        if (!this.shouldRender) return;
        
        if (!this.modal) {
            this.createModal();
        }
        
        await this.collectSystemData();
        this.updateModalContent();
        
        this.modal.style.display = 'flex';
        this.isOpen = true;
        
        // Auto-refresh data every 2 seconds while open
        this.refreshInterval = setInterval(async () => {
            if (this.isOpen) {
                await this.collectSystemData();
                this.updateModalContent();
            }
        }, 2000);
    }

    close() {
        if (this.modal) {
            this.modal.style.display = 'none';
            this.isOpen = false;
            
            if (this.refreshInterval) {
                clearInterval(this.refreshInterval);
            }
        }
    }

    // Public method to check if OState is active
    isActive() {
        return this.shouldRender;
    }

    // Public method to manually enable/disable
    setEnabled(enabled) {
        this.shouldRender = enabled;
        if (!enabled && this.button) {
            this.button.remove();
        } else if (enabled && !this.button) {
            this.createButton();
        }
    }
}

// Initialize OState only in dev/debug mode
window.addEventListener('DOMContentLoaded', () => {
    window.OState = new OState();
    
    // Export debug info
    if (window.OState.isActive()) {
        console.log('🔧 OState Dashboard: Active (Development/Debug Mode)');
    }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OState;
}