// MindEase Configuration
const CONFIG = {
    isLocal: window.location.hostname === 'localhost' || 
             window.location.hostname === '127.0.0.1',
    
    get apiUrl() {
        if (this.isLocal) {
            return 'http://localhost/MINDEASE/backend';
        } else {
            return 'https://yourdomain.com/mindease-backend'; // UPDATE WHEN DEPLOYING
        }
    },
    
    getApiEndpoint(path) {
        return this.apiUrl + path;
    }
};