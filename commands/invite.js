exports.run = (client, message, args, serverConf) => {
    message.channel.send(`Invite link: https://discordapp.com/oauth2/authorize?client_id=356619840649428993&scope=bot&permissions=271707143`).catch(client.logger.error);
}
