const express = require('express');
const auth = require('../middleware/auth');
const Server = require('../models/Server');
const Channel = require('../models/Channel');
const router = express.Router();

// Create a new serverouter.post('/create', auth, async (req, res) => {
    const { name } = req.body;
    try {
        const server = new Server({
            name,
            owner: req.user.id,
            members: [req.user.id],
            channels: []
        });
        await server.save();
        // Create default general channel
        const channel = new Channel({ name: 'general', server: server._id, messages: [] });
        await channel.save();
        server.channels.push(channel._id);
        await server.save();
        res.json(server);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Join server
router.post('/join/:serverId', auth, async (req, res) => {
    try {
        const server = await Server.findById(req.params.serverId);
        if (!server) return res.status(404).json({ message: 'Server not found' });
        if (!server.members.includes(req.user.id)) {
            server.members.push(req.user.id);
            await server.save();
        }
        res.json(server);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// List servers for user
router.get('/my', auth, async (req, res) => {
    try {
        const servers = await Server.find({ members: req.user.id }).populate('channels');
        res.json(servers);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
