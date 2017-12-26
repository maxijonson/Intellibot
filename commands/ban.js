exports.run = (client, message, args, serverConf) => {
  if(!client.isAdmin(message.member, serverConf))
    return message.channel.send(`Sorry, this is a command for bot admins only`);
  if(args.length < 2)
    return message.channel.send(`Wrong syntax. ${serverConf.prefix}help ban for info on the command.`);

    let member = message.mentions.members.first();
    if(!member)
      return message.reply("You need to mention a valid member of this server");
    if(!member.bannable)
      return message.reply("I cannot ban this user! Either their role is higher than mine in roles hierarchy or I do not have ban permissions.");

    let reason = args.slice(1).join(' ');
    if(!reason)
      return message.reply("Please indicate a reason for the ban!");

    member.ban(reason)
      .then(function() {
        return message.channel.send(`${member.user.username} has been banned. Reason: ${reason}`);
      })
      .catch((error) => {
        return message.channel.send(`I was unable to ban ${member.user.username}... Please make sure I have permissions for that and that my role is higher than his!`);
      });
}
