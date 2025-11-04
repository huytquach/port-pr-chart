// API Client for communicating with backend
class ApiClient {
    constructor() {
        this.baseURL = window.location.origin + '/api';
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                // Extract detailed error information
                let errorMessage = data.message || `HTTP ${response.status}: ${response.statusText}`;
                
                // If it's a Port API error, show the specific error details
                if (data.error) {
                    errorMessage = data.error;
                    if (data.message && data.message !== data.error) {
                        errorMessage += `: ${data.message}`;
                    }
                }
                
                // Add status code for context
                errorMessage = `[${response.status}] ${errorMessage}`;
                
                throw new Error(errorMessage);
            }

            return data;
        } catch (error) {
            console.error('API Request failed:', error);
            throw error;
        }
    }

    // Authentication endpoints
    async validateToken(token) {
        return this.request('/auth/validate', {
            method: 'POST',
            body: JSON.stringify({ token })
        });
    }

    async getTokenStatus() {
        return this.request('/auth/status');
    }

    async rotateToken() {
        return this.request('/auth/rotate', {
            method: 'POST'
        });
    }

    // Port API endpoints
    async getEntities(blueprint = 'github_pull_request') {
        const params = new URLSearchParams({ blueprint });
        return this.request(`/port/entities?${params}`);
    }

    async getBlueprints() {
        return this.request('/port/blueprints');
    }

    async getProperties(blueprint = 'github_pull_request') {
        const params = new URLSearchParams({ blueprint });
        return this.request(`/port/properties?${params}`);
    }

    async getPropertyValues(property, blueprint = 'github_pull_request') {
        const params = new URLSearchParams({ blueprint });
        return this.request(`/port/values/${property}?${params}`);
    }

    // Health check
    async healthCheck() {
        return this.request('/health');
    }
}

// Global API client instance
const apiClient = new ApiClient();
