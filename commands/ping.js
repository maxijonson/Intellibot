exports.run = (client, message, args) => {
    message.channel.send(`Pong! \`${Math.floor(client.ping)}ms\``).catch(client.logger.error);
}
