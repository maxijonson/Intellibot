exports.run = (client, message, args, serverConf) => {
  try {
    switch (args[0]) {
      case "forget":
        if (args.length == 1)
          return message.channel.send(`Must specify the meme to forget`);
        var memeName = args.slice(1).join(' ');
        if (!serverConf.memes.hasOwnProperty(memeName))
          return message.channel.send(`${memeName} is not an existing meme`);

        client.fs.unlink(`memes/${message.guild.id}/${serverConf.memes[memeName]}`, (error) => {
          if (error) client.logger.error(`${error.stack == undefined ? error:error.stack}`);
        });
        delete serverConf.memes[memeName];
        serverConf.memeCount = Object.keys(serverConf.memes).length;
        client.settings.set(message.guild.id, serverConf);
        return message.channel.send(`${memeName} has been forgotten from my memory, but will forever live in our hearts!`);
        break;
      case "list":
        if (args.length != 1)
          return message.channel.send(`Wrong syntax! Refer to ${serverConf.prefix}help meme for information on the command`);
        if (serverConf.memeCount <= 0)
          return message.channel.send(`You do not have any memes right now! Use ${serverConf.prefix}help meme to see how to make one right now!`);

        var msg = `All the dank memes in this server:\n`
        for (var meme in serverConf.memes) {
          if (serverConf.memes.hasOwnProperty(meme)) {
            msg += `${meme}\n`;
          }
        }
        message.channel.send(msg);
        break;
      case "new":
        if (serverConf.memeCount >= client.conf.memeLImit)
          return message.channel.send(`Sorry, you've reached the maximum amount of memes allowed (${memeLimit}). You can delete some with the 'meme forget' command!`);
        if (!message.attachments.first())
          return message.channel.send(`You must provide an image!`);

        const attachment = message.attachments.first();
        var memeName = args.slice(1).join(' ');
        if (!(attachment.filename.endsWith(".jpg") || attachment.filename.endsWith(".png") || attachment.filename.endsWith(".JPG") || attachment.filename.endsWith(".PNG")))
          return message.channel.send(`I only take .jpg, .png, .JPG, .PNG images! If they are, check to make sure they match one of the mentionned file types (caps or none)`);
        if (!attachment.height || !attachment.width)
          return message.channel.send(`One does not simply try to fool Intellibot with invalid images! Just changing the extension doesn't make it an image!`);
        if (attachment.filesize > 7750000)
          return message.channel.send(`Woah! That image is too big for me to keep!`);
        if (attachment.height > 2160 || attachment.width > 3840)
          return message.channel.send(`For good reasons, the max resolution of an image I can take is 3840x2160`);
        if (client.fs.existsSync(`memes/${message.guild.id}/${attachment.filename}`))
          return message.channel.send(`I don't always get files with the same file name as other memes, but when I do,  I don't create that meme!`);
        if (memeName in serverConf.memes)
          return message.channel.send(`One does not simply enter a meme name that is already used... Your meme was not created.`);
        if (!memeName)
          return message.channel.send(`Y UN NO PROVIDE MEME NAME!`);
        if (memeName.includes(';'))
          return message.channel.send(`Sorry, but semi-colons are not allowed to be included in meme names!`);

        if (client.download(attachment.url, client.fs, `memes/${message.guild.id}/${attachment.filename}`, function() {
            return true
          }))
          return message.channel.send(`Sorry, something wrong happened when I tried downloading the image...`);

        serverConf.memes[memeName] = attachment.filename;
        serverConf.memeCount = Object.keys(serverConf.memes).length;
        client.settings.set(message.guild.id, serverConf);
        message.channel.send(`Dank meme created!`);
        break;

      default:
        const makeMeme = (client, message, args, serverConf) => {
          let err = '';
          const fork = client.childProcess.fork;

          var params = {
            serverConf: serverConf,
            message: {
              guild: {
                id: message.guild.id
              },
              author: {
                id: message.author.id
              }
            }
          }

          client.fs.writeFile(`tmp/${message.author.id}-meme.json`, [JSON.stringify(params, null, '\t')], function(err) {
            if (err) throw err;
            message.channel.send(`Processing...`).then((m) => {
              const j = fork('childProcesses/child_meme.js', [`../tmp/${message.author.id}-meme.json`, args.join(' ')]);

              j.on('message', (content) => {

                if (typeof(content) == "string")
                  m.edit(content);
                else
                  message.channel.send(content).then((msg) => {
                    serverConf.memesTotalCount++;
                    client.settings.set(message.guild.id, serverConf);
                  });

              });

              j.on('exit', (code) => {
                if (code == 1) message.channel.send(`There was a problem making your meme...`); // Processing
                if (code == 3) message.channel.send(`This is very odd. There was a problem with in the code which should never happen...`); // Args length invalid
                if (code != 2) // User fucked up
                  m.delete();
                if (code == 0 || code == 4) // 0: Success 4: Couldn't send processed file
                  client.fs.unlink(`./tmp/${message.author.id}.png`, (err) => {
                    if (err) client.logger.error(err.stack + `\nMeme Child Process Exit Code: ${code}`);
                  });

                client.fs.unlink(`./tmp/${message.author.id}-meme.json`, (err) => {
                  if (err) client.logger.error(err.stack + `\nMeme Child Process Exit Code: ${code}`);
                });
              });


            });
          });



        }
        makeMeme(client, message, args, serverConf);
    }
  } catch (err) {
    client.logger.error(`${err.stack == undefined ? err:err.stack}`);
  }
}
