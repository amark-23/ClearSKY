const axios = require('axios');

const ORCHESTRATOR_URL = process.env.ORCHESTRATOR_URL || 'http://orchestrator:3001/events';

async function propagateRequest(type, data) {
    try {
        const event = { type, data };
        console.log(`[EVENT] Propagating event to orchestrator:`, event);

        await axios.post(ORCHESTRATOR_URL, event);

        console.log(`[EVENT] ✅ Event "${type}" sent`);
    } catch (err) {
        console.error(`[EVENT] ❌ Failed to send event "${type}":`, err.message);
    }
}

module.exports = propagateRequest;
