const express = require('express');
const router = express.Router();
const portService = require('../services/portService');

// GET /api/port/entities - Fetch entities from Port
router.get('/entities', async (req, res) => {
    try {
        const { blueprint = 'github_pull_request' } = req.query;
        
        const entities = await portService.getEntities(blueprint);
        
        res.json({
            success: true,
            data: entities,
            count: entities.length,
            blueprint: blueprint
        });
        
        } catch (error) {
            console.error('Error fetching entities:', error);
            
            if (error.response) {
                // Port API error - pass through the detailed error
                const portError = error.response.data;
                res.status(error.response.status).json({
                    error: portError.error || 'Port API Error',
                    message: portError.message || error.message,
                    status: error.response.status,
                    details: portError.details || null
                });
            } else {
                // Internal error
                res.status(500).json({
                    error: 'Internal Server Error',
                    message: error.message
                });
            }
        }
});

// GET /api/port/blueprints - List available blueprints
router.get('/blueprints', async (req, res) => {
    try {
        const blueprints = await portService.getBlueprints();
        
        res.json({
            success: true,
            data: blueprints,
            count: blueprints.length
        });
        
        } catch (error) {
            console.error('Error fetching blueprints:', error);
            
            if (error.response) {
                // Port API error - pass through the detailed error
                const portError = error.response.data;
                res.status(error.response.status).json({
                    error: portError.error || 'Port API Error',
                    message: portError.message || error.message,
                    status: error.response.status,
                    details: portError.details || null
                });
            } else {
                // Internal error
                res.status(500).json({
                    error: 'Internal Server Error',
                    message: error.message
                });
            }
        }
});

// GET /api/port/properties - Extract properties from entities
router.get('/properties', async (req, res) => {
    try {
        const { blueprint = 'github_pull_request' } = req.query;
        
        const entities = await portService.getEntities(blueprint);
        const properties = portService.extractProperties(entities);
        
        res.json({
            success: true,
            data: properties,
            count: properties.length,
            blueprint: blueprint
        });
        
        } catch (error) {
            console.error('Error extracting properties:', error);
            
            if (error.response) {
                // Port API error - pass through the detailed error
                const portError = error.response.data;
                res.status(error.response.status).json({
                    error: portError.error || 'Port API Error',
                    message: portError.message || error.message,
                    status: error.response.status,
                    details: portError.details || null
                });
            } else {
                // Internal error
                res.status(500).json({
                    error: 'Internal Server Error',
                    message: error.message
                });
            }
        }
});

// GET /api/port/values/:property - Get unique values for a property
router.get('/values/:property', async (req, res) => {
    try {
        const { property } = req.params;
        const { blueprint = 'github_pull_request' } = req.query;
        
        const entities = await portService.getEntities(blueprint);
        const values = portService.getPropertyValues(entities, property);
        
        res.json({
            success: true,
            data: values,
            count: values.length,
            property: property,
            blueprint: blueprint
        });
        
        } catch (error) {
            console.error('Error getting property values:', error);
            
            if (error.response) {
                // Port API error - pass through the detailed error
                const portError = error.response.data;
                res.status(error.response.status).json({
                    error: portError.error || 'Port API Error',
                    message: portError.message || error.message,
                    status: error.response.status,
                    details: portError.details || null
                });
            } else {
                // Internal error
                res.status(500).json({
                    error: 'Internal Server Error',
                    message: error.message
                });
            }
        }
});

module.exports = router;
