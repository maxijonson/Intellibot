exports.run = (client, message, args, serverConf) => {
  if(!client.isAdmin(message.member, serverConf))
    return message.channel.send(`Sorry, only admins can purge messages`);
  const c = parseInt(args[0], 10);
  if(!c || c < 2 || c > 50)
    return message.channel.send(`Please specify a number between 2 and 50 `);

  var channel;

  if(args.length > 1) { // Other channel
    var ChannelID = args[1];
    if (
      client.channels.some(function(channel, i) {
        if (message.isMentioned(channel.id)) {
          ChannelID = channel.id;
          return true;
        } else if (ChannelID == channel.id) {
          return true;
        }
      })
    ) {
      if(client.channels.get(ChannelID).guild.id != message.guild.id)
        return message.channel.send(`That channel is not in your server!`);
      channel = client.channels.get(ChannelID);
    } else {
      return message.channel.send(`${ChannelID} is not a valid channel`);
    }
  } else { // Current channel
    channel = message.channel;
  }

  channel.fetchMessages({limit: c}).then((messages) => {
    channel.bulkDelete(messages, true).then(() => {
      message.channel.send(`Messages deleted.`).then((m) => {
        setTimeout(function() {
          m.delete();
        }, 2500);
      });
    }).catch((error) => {
          return message.channel.send(`I couldn't delete some messages.. I cannot delete messages older than 2 weeks.`);
    });
  }).catch((err) => {
    message.channel.send(`Could not fetch messages...`);
  });
}
