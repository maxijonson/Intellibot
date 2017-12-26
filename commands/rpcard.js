exports.run = (client, message, args, serverConf) => {
  try {
    if (!client.robotpieces.has(message.author.id))
      return message.channel.send(`You do not own any robotpieces! See ${serverConf.prefix}help robotpiece to see how to get started!`);
    var usr = client.robotpieces.get(message.author.id);
    async function wait(cb) {
      let temp = await new Promise(resolve => setTimeout(resolve, 600));
      cb();
    }

    if (args.length == 0) {
      var URL = message.author.avatarURL != null ? message.author.avatarURL : "https://cdn.discordapp.com/embed/avatars/0.png";
      client.download(URL, client.fs, `tmp/${message.author.id}avatar.png`, function() {
        const makeCard = (client, message, args, serverConf) => {
          let err = '';
          const fork = client.childProcess.fork;

          var params = {
            message: {
              guild: {
                id: message.guild.id
              },
              author: {
                id: message.author.id,
                username: message.author.username,
                discriminator: message.author.discriminator
              }
            },
            robotpieces: {},
            usr: client.robotpieces.get(message.author.id)
          }

          for (var [id, collector] of client.robotpieces)
            params.robotpieces[id] = collector;

          client.fs.writeFile(`tmp/${message.author.id}-rpcard.json`, [JSON.stringify(params, null, '\t')], function(err) {
            if (err) throw err;
            message.channel.send(`Processing...`).then((m) => {
              const j = fork('childProcesses/child_rpcard.js', [`../tmp/${message.author.id}-rpcard.json`]);

              j.on('message', (content) => {

                if (typeof(content) == "string")
                  m.edit(content);
                else
                  message.channel.send(content);

              });

              j.on('exit', (code) => {
                if(code == 0)
                  m.delete();
                client.fs.unlink(`./tmp/${message.author.id}avatar.png`, (err) => {
                  if (err) client.logger.error(err.stack + `\nMeme Child Process Exit Code: ${code}`);
                });

                client.fs.unlink(`./tmp/${message.author.id}.jpg`, function(err) {
                  if (err) client.logger.error(err.stack + `\nRPCard Child Process Exit Code: ${code}`);
                })

                client.fs.unlink(`./tmp/${message.author.id}-rpcard.json`, (err) => {
                  if (err) client.logger.error(err.stack + `\nRPCard Child Process Exit Code: ${code}`);
                });
              });


            });
          });



        }
        makeCard(client, message, args, serverConf);
      });
    } else {
      switch (args[0]) {
        case "color":
          if (args.length != 2)
            return message.channel.send(`Wrong syntax. Use ${serverConf.prefix}help rpcards to get info on how to use the command.`);
          if (!["blue", "cyan", "green", "magenta", "orange", "pink", "purple", "red", "yellow"].includes(args[1]))
            return message.channel.send(`Invalid color. Colors: blue, green, cyan, magenta, orange, pink, purple, red or yellow`);

          usr.color = args[1];
          client.robotpieces.set(message.author.id, usr);
          message.channel.send(`RPCard color changed to ${args[1]}`);
          break;

        case "background":
          if (!message.attachments.first())
            return message.channel.send(`You must provide an image!`);
          var attachment = message.attachments.first();
          if (!(attachment.filename.endsWith(".jpg") || attachment.filename.endsWith(".png") || attachment.filename.endsWith(".JPG") || attachment.filename.endsWith(".PNG")))
            return message.channel.send(`I only take .jpg, .png, .JPG, .PNG images! If they are, check to make sure they match one of the mentionned file types (caps or none)`);
          if (!attachment.height || !attachment.width)
            return message.channel.send(`Just changing the extension doesn't make it an image!`);
          if (attachment.filesize > 7750000)
            return message.channel.send(`Woah! That image is too big for me to keep!`);
          if (client.download(attachment.url, client.fs, `RPCards/${message.author.id}.jpg`, function() {
              return true
            }))
            return message.channel.send(`Sorry, something wrong happened when I tried downloading the image...`);

          usr.background = `RPCards/${message.author.id}.jpg`;
          client.robotpieces.set(message.author.id, usr);
          message.channel.send(`RPCard background changed!`);
          break;
      }
    }

  } catch (err) {
    client.logger.error(`${err.stack == undefined ? err:err.stack}`);
  }
}
