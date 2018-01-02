exports.run = (client, message, args, serverConf) => {
  switch (args.length) {
    case 0:
      var Admins = "";
      for (admin in serverConf.Admins) {
        Admins += client.users.get(serverConf.Admins[admin]).username + '\n';
      }
      message.channel.send(`Current admins:\n${Admins}`);
      break;

    case 1:

      if (client.isAdmin(message.member, serverConf)) {
        // Get the mention
        var UserID = message.mentions.users.first() ? message.mentions.users.first().id : message.mentions.roles.first() ? message.mentions.roles.first().id : args[0]; // In case an actual ID is used

        if (message.guild.members.has(UserID) || message.guild.roles.has(UserID)) {
          if (!serverConf.Admins.includes(UserID)) {
            serverConf.Admins.push(UserID);
            client.settings.set(message.guild.id, serverConf);
            message.channel.send(`${client.users.get(UserID) ? client.users.get(UserID) : message.guild.roles.get(UserID)} has been added to this bot's admins!`);
          } else {
            message.channel.send(`${client.users.get(UserID) ? client.users.get(UserID) : message.guild.roles.get(UserID)} is already one of the bot's admin!`);
          }
        } else {
          message.channel.send(`Sorry, the user or role ${args[0]} couldn't be found! Are you sure you mentioned someone/role on the server who's in the same channel as me (where you sent the command)?`);
        }
      } else {
        message.channel.send(`Sorry, this command is available to bot (not server) admins only! Other bot admins can add a bot admin using the command\n
      \`${serverConf.prefix}addAdmin <mention or ID>\``);
      }
      break;

    default:
      message.channel.send(`Wrong syntax. Use \`${serverConf.prefix}help addadmin\` for information on how to use it.`);
      break;
  }
}
