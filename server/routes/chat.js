const express = require('express');
const auth = require('../middleware/auth');
const Channel = require('../models/Channel');
const Message = require('../models/Message');
const router = express.Router();

// Get messages in a channel
router.get('/messages/:channelId', auth, async (req, res) => {
    try {
        const channel = await Channel.findById(req.params.channelId).populate({
            path: 'messages',
            populate: { path: 'author', select: 'username' }
        });
        if (!channel) return res.status(404).json({ message: 'Channel not found' });
        res.json(channel.messages);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create message
router.post('/message', auth, async (req, res) => {
    const { channelId, content } = req.body;
    try {
        const msg = new Message({
            content,
            author: req.user.id,
            channel: channelId
        });
        await msg.save();
        // Push to channel
        const channel = await Channel.findById(channelId);
        channel.messages.push(msg._id);
        await channel.save();
        const populated = await msg.populate({ path: 'author', select: 'username' });
        res.json(populated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
