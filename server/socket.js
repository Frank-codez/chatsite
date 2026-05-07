const Message = require('./models/Message');
const Channel = require('./models/Channel');
function setupSocket(io) {
  io.on('connection', (socket) => {
    socket.on('joinChannel', ({ channelId }) => {
      socket.join(channelId);
    });

    socket.on('sendMessage', async ({ channelId, content, user }) => {
      // Save message
      const msg = new Message({ content, author: user.id, channel: channelId });
      await msg.save();
      const channel = await Channel.findById(channelId);
      channel.messages.push(msg._id);
      await channel.save();
      io.to(channelId).emit('receiveMessage', {
        _id: msg._id,
        content: msg.content,
        author: user,
        channel: channelId,
        createdAt: msg.createdAt,
      });
    });
  });
}
module.exports = { setupSocket };
