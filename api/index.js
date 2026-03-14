/**
 * Vercel serverless entry (repo root).
 * Forwards to the built backend Express app.
 */
module.exports = require('../backend/dist/app').default;
