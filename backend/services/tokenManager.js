const axios = require('axios');

class TokenManager {
    constructor() {
        this.tokens = {
            primary: process.env.PORT_API_TOKEN_PRIMARY,
            secondary: process.env.PORT_API_TOKEN_SECONDARY,
            service: process.env.PORT_SERVICE_TOKEN
        };
        
        // Client credentials for programmatic token generation
        this.clientCredentials = {
            clientId: process.env.PORT_CLIENT_ID,
            clientSecret: process.env.PORT_CLIENT_SECRET
        };
        
        this.currentToken = this.tokens.primary;
        this.lastRotation = Date.now();
        this.rotationInterval = 2.5 * 60 * 60 * 1000; // 2.5 hours
        this.isRotating = false;
        
        // Log token status on startup
        console.log('🔑 Token Manager initialized:');
        console.log(`   Primary Token: ${this.tokens.primary ? 'Set' : 'Not Set'}`);
        console.log(`   Secondary Token: ${this.tokens.secondary ? 'Set' : 'Not Set'}`);
        console.log(`   Service Token: ${this.tokens.service ? 'Set' : 'Not Set'}`);
        console.log(`   Client ID: ${this.clientCredentials.clientId ? 'Set' : 'Not Set'}`);
        console.log(`   Client Secret: ${this.clientCredentials.clientSecret ? 'Set' : 'Not Set'}`);
        
        if (!this.tokens.primary && !this.clientCredentials.clientId) {
            console.warn('⚠️  WARNING: No token or client credentials set!');
            console.warn('   Set token: export PORT_API_TOKEN_PRIMARY="your_token_here"');
            console.warn('   Or set credentials: export PORT_CLIENT_ID="your_id" PORT_CLIENT_SECRET="your_secret"');
        }
        
        // If only client credentials are available (no primary token), generate initial token
        if (!this.tokens.primary && this.clientCredentials.clientId && this.clientCredentials.clientSecret) {
            console.log('🔄 No primary token found, generating initial token from client credentials...');
            // Call async function without await (will complete in background)
            this.initializeTokenFromCredentials().catch(err => {
                console.error('❌ Initial token generation failed:', err.message);
            });
        }
        
        // Start automatic rotation
        this.startAutoRotation();
    }
    
    async initializeTokenFromCredentials() {
        try {
            const newToken = await this.generateNewToken();
            this.currentToken = newToken;
            this.lastRotation = Date.now();
            console.log('✅ Initial token generated successfully from client credentials');
        } catch (error) {
            console.error('❌ Failed to generate initial token from client credentials:', error.message);
            console.error('   Please check that PORT_CLIENT_ID and PORT_CLIENT_SECRET are correct');
            if (error.response) {
                console.error('   API Response:', error.response.status, error.response.data);
            }
            throw error;
        }
    }

    startAutoRotation() {
        setInterval(() => {
            this.rotateToken();
        }, this.rotationInterval);
    }

    async validateToken(token) {
        try {
            // Use the same region as PortService
            const portService = require('./portService');
            const baseURL = portService.baseURL;
            
            const response = await axios.get(`${baseURL}/v1/blueprints`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            });
            
            return response.status === 200;
        } catch (error) {
            console.error('Token validation failed:', error.response?.status);
            return false;
        }
    }

    async generateNewToken() {
        if (!this.clientCredentials.clientId || !this.clientCredentials.clientSecret) {
            const errorMsg = 'Client credentials not configured. Set PORT_CLIENT_ID and PORT_CLIENT_SECRET.';
            console.error(`❌ ${errorMsg}`);
            console.error(`   PORT_CLIENT_ID: ${this.clientCredentials.clientId ? 'Set' : 'NOT SET'}`);
            console.error(`   PORT_CLIENT_SECRET: ${this.clientCredentials.clientSecret ? 'Set' : 'NOT SET'}`);
            throw new Error(errorMsg);
        }

        try {
            const portService = require('./portService');
            const baseURL = portService.baseURL;
            
            console.log(`🔄 Generating new token from ${baseURL}/v1/auth/access_token...`);
            console.log(`   Using Client ID: ${this.clientCredentials.clientId.substring(0, 8)}...`);
            
            const response = await axios.post(`${baseURL}/v1/auth/access_token`, {
                clientId: this.clientCredentials.clientId,
                clientSecret: this.clientCredentials.clientSecret
            }, {
                timeout: 10000,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 200) {
                const { accessToken, expiresIn, tokenType } = response.data;
                console.log(`✅ Generated new token (expires in ${expiresIn} seconds)`);
                return accessToken;
            } else {
                throw new Error(`Failed to generate token: ${response.status}`);
            }
        } catch (error) {
            console.error('❌ Token generation failed:');
            if (error.response) {
                console.error(`   Status: ${error.response.status}`);
                console.error(`   Data:`, error.response.data);
            } else if (error.request) {
                console.error(`   Request made but no response received`);
                console.error(`   URL: ${error.config?.url}`);
            } else {
                console.error(`   Error: ${error.message}`);
            }
            throw error;
        }
    }

    async rotateToken() {
        if (this.isRotating) return;
        
        this.isRotating = true;
        
        try {
            // If no current token exists, try to generate one from client credentials first
            if (!this.currentToken && this.clientCredentials.clientId && this.clientCredentials.clientSecret) {
                console.log('🔄 No current token, generating from client credentials...');
                try {
                    const newToken = await this.generateNewToken();
                    this.currentToken = newToken;
                    this.lastRotation = Date.now();
                    console.log('✅ Token generated successfully from client credentials');
                    return;
                } catch (error) {
                    console.warn('⚠️ Failed to generate token from client credentials:', error.message);
                }
            }
            
            // Test current token if it exists
            if (this.currentToken) {
                const isValid = await this.validateToken(this.currentToken);
                
                if (!isValid) {
                    console.log('🔄 Current token invalid, attempting rotation...');
                    
                    // Try to generate a new token if client credentials are available
                    if (this.clientCredentials.clientId && this.clientCredentials.clientSecret) {
                        try {
                            const newToken = await this.generateNewToken();
                            this.currentToken = newToken;
                            this.lastRotation = Date.now();
                            console.log('✅ Token rotated successfully (programmatically generated)');
                            return;
                        } catch (error) {
                            console.warn('⚠️ Programmatic token generation failed, trying backup tokens');
                        }
                    }
                    
                    // Fallback to backup token rotation
                    const newToken = this.currentToken === this.tokens.primary 
                        ? this.tokens.secondary 
                        : this.tokens.primary;
                    
                    if (newToken && await this.validateToken(newToken)) {
                        this.currentToken = newToken;
                        this.lastRotation = Date.now();
                        console.log('✅ Token rotated successfully (backup token)');
                    } else {
                        console.warn('⚠️ All tokens appear to be invalid');
                    }
                }
            } else {
                // No token and no client credentials - try backup tokens
                if (this.tokens.primary && await this.validateToken(this.tokens.primary)) {
                    this.currentToken = this.tokens.primary;
                    this.lastRotation = Date.now();
                    console.log('✅ Using primary token');
                } else if (this.tokens.secondary && await this.validateToken(this.tokens.secondary)) {
                    this.currentToken = this.tokens.secondary;
                    this.lastRotation = Date.now();
                    console.log('✅ Using secondary token');
                } else {
                    console.warn('⚠️ No valid tokens available');
                }
            }
        } catch (error) {
            console.error('Token rotation error:', error.message);
        } finally {
            this.isRotating = false;
        }
    }

    getCurrentToken() {
        return this.currentToken;
    }

    getStatus() {
        return {
            currentToken: this.currentToken ? 'Set' : 'Not Set',
            primaryToken: this.tokens.primary ? 'Set' : 'Not Set',
            secondaryToken: this.tokens.secondary ? 'Set' : 'Not Set',
            serviceToken: this.tokens.service ? 'Set' : 'Not Set',
            clientId: this.clientCredentials.clientId ? 'Set' : 'Not Set',
            clientSecret: this.clientCredentials.clientSecret ? 'Set' : 'Not Set',
            lastRotation: new Date(this.lastRotation).toISOString(),
            nextRotation: new Date(this.lastRotation + this.rotationInterval).toISOString(),
            isRotating: this.isRotating
        };
    }

    // Manual rotation for API endpoint
    manualRotate() {
        this.rotateToken();
    }
}

module.exports = new TokenManager();
