exports.run = (client, message, args, serverConf) => {
  switch (args.length) {
    case 0:
      var Admins = "";
      for (admin in serverConf.Admins) {
        Admins += `${client.users.get(serverConf.Admins[admin]) ? client.users.get(serverConf.Admins[admin]).username : message.guild.roles.get(serverConf.Admins[admin]).name}\n`;
      }
      message.channel.send(`Current admins:\n${Admins}`);
      break;

    case 1:

      if (message.author.id == message.guild.owner.id) {
        // Check if the user exists in the channel first
        var UserID = message.mentions.users.first() ? message.mentions.users.first().id : message.mentions.roles.first() ? message.mentions.roles.first().id : args[0]; // In case an actual ID is used
        if (serverConf.Admins.includes(UserID)) {
          if (UserID == message.guild.ownerID)
            return message.channel.send(`Sorry, but the owner ID must remain a bot admin.`);
          serverConf.Admins.splice(serverConf.Admins.indexOf(UserID), 1);
          client.settings.set(message.guild.id, serverConf);
          return message.channel.send(`${client.users.get(UserID) ? client.users.get(UserID) : message.guild.roles.get(UserID)} has been removed from the bot admins!`);
        } else if (UserID == "all") {
          serverConf.Admins = [message.guild.ownerID];
          client.settings.set(message.guild.id, serverConf);
          message.channel.send(`All bot admins were removed. Only the server owner has power!`);
        } else {
          return message.channel.send(`Sorry, but ${args[0]} is not a bot admin`);
        }
        
      } else {
        message.channel.send(`Sorry, this command is available to the server owner only!`);
      }
      break;

    default:
      message.channel.send(`Wrong syntax. Use \`${serverConf.prefix}help rmadmin\` for information on how to use it.`);
      break;
  }
}
