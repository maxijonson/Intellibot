exports.run = (client, message, args, serverConf) => {
  switch (args.length) {
    case 0:
      message.channel.send(`Current notification channel: ${client.channels.get(serverConf.NotificationChannel)}`);
      break;

    case 1:
      if (client.isAdmin(message.member, serverConf)) {
        var ChannelID = args[0];
        // Check if channel was mentionned
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
          if(client.channels.get(ChannelID).type != "text")
            return message.channel.send(`Sorry, but the notification channel must be a text channel!`);
          serverConf.NotificationChannel = ChannelID;
          if(!client.channels.get(ChannelID).permissionsFor(client.user).has('SEND_MESSAGES'))
            return message.channel.send(`Sorry, it seems I don't have permission to talk in that channel.`);

          serverConf.NotificationChannel = ChannelID;
          client.settings.set(message.guild.id, serverConf);
          message.channel.send(`Notifications channel changed to ${client.channels.get(ChannelID)}!`);
        } else {
          message.channel.send(`The channel ${args[0]} does not exist!`);
        }
      } else {
        message.channel.send(`Sorry, you do not have the admin permissions to change the notification channel...`);
      }
      break;
    default:
      message.channel.send(`Wrong syntax. Use \`${serverConf.prefix}help notifications\` for information on how to use it.`);
  }
}
