exports.run = (client, message, args, serverConf) => {
  if(args.length < 2)
    return message.channel.send(`Must specify at least two choices`);
  message.channel.send(`I choose: ${args[Math.floor(Math.random()*args.length)]}`);
}
