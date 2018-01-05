exports.run = (client, message, args, serverConf) => {
  var glbMsg;
  switch (true) {
    case (args.length == 0):
      message.channel.send(`Wrong syntax for music command. Use ${serverConf.prefix}help music for info on how to use the command.`);
      break;

    case (args.length > 0):

      function play(connection, message) {
        try {
          client.ytdl.getInfo(serverConf.queue[0].link, function(err, info) {
            if (info.pltype == 'contentlive')
              return message.channel.send(`Sorry, live streams are not supported`).then(function() {
                serverConf.queue.shift();
                client.settings.set(message.guild.id, serverConf);
                if (serverConf.queue[0])
                  play(connection, message);
                else {
                  serverConf.voiceChannel = null;
                  serverConf.current = null;
                  connection.disconnect();
                  client.settings.set(message.guild.id, serverConf);
                }
              });
            if (serverConf.NotificationChannel != null)
              if (client.channels.get(serverConf.NotificationChannel).permissionsFor(client.user).has('SEND_MESSAGES'))
                message.guild.channels.get(serverConf.NotificationChannel).send(`Now playing: ***${info.title}***`);

            const options = {
              seek: 0,
              volume: 1,
              bitrate: "auto",
              passes: 10
            };
            const stream = client.ytdl(serverConf.queue[0].link, {
              filter: 'audioonly'
            });
            let dispatcher = connection.playStream(stream, options);
            serverConf.playCount++;
            serverConf.current = serverConf.queue.shift();
            client.settings.set(message.guild.id, serverConf);



            dispatcher.on('debug', (info) => {
              client.logger.warn(info);
            });

            dispatcher.on('error', function(err) {
              client.logger.error(err);
            });

            dispatcher.on("end", function(reason) {

              if (serverConf.queue[0])
                play(connection, message);
              else {
                serverConf.voiceChannel = null;
                serverConf.current = null;
                connection.disconnect();
                client.settings.set(message.guild.id, serverConf);
              }

            });
          });
        } catch (err) {
          client.logger.error(`${err.stack == undefined ? err:err.stack}`);
          return message.channel.send(`Sorry, something went wrong while fetching the video!`);
        }
      }

      function handleAsyncError(err) {
        if (err) {
          var handled = true;
          switch (err.message) {
            case "1":
              message.channel.send(`Couldn't find any video with that name!`);
              break;
            default:
              client.logger.error(`Unknown music error:\n${err}`);
              handled = false;
          }
          throw handled ? "handled" : err;
        }
      }

      function ProcessLink(link, m, title) {
        serverConf.queue.push({
          link: link,
          title: title
        });
        m.edit(`Your link has been added to the queue`);

        if (!message.guild.voiceConnection) {
          serverConf.voiceChannel = message.member.voiceChannel.id;
          m.edit(`Hold on while I connect to your channel...`).then((m) => {
            message.member.voiceChannel.join().then(function(connection) {
              m.delete();
              play(connection, message);
            }).catch((err) => {
              client.logger.error(`${err.stack == undefined ? err:err.stack}`);
            });
          });
        } else if (message.guild.voiceConnection.dispatcher) {
          if (message.guild.voiceConnection.dispatcher.paused)
            message.guild.voiceConnection.dispatcher.resume();
        }
        client.settings.set(message.guild.id, serverConf);
      }

      function ProcessSave(link) {
        serverConf.saves[args[2]] = link;
        client.settings.set(message.guild.id, serverConf);
        message.channel.send(`${args[2]} has been saved!`);
      }

      function ProcessAdd(link) {
        serverConf.playlists[args[1]][args[4]] = link;
        client.settings.set(message.guild.id, serverConf);
        message.channel.send(`Added ${args[4]} to playlist ${args[1]}!`);
      }


      function ask() {
        var video = serverConf.searchQueue[message.author.id].shift();
        const collector = new client.Discord.MessageCollector(message.channel, m => (m.author.id === message.author.id && ["p", "P", "play", "n", "N", "next", "s", "S","stop"].includes(m.content.toLowerCase())), {
          time: 10000
        });

        var valid = false;
        var info = `${video.shortURL}\n`;
        info += `**${video.title}**\n`;
        info += `*${video.id}*\n`;
        info += `By ${video.channel.title}\n\n`;
        message.channel.send(info + "play - `p`  |  next - `n`  |  stop - `s`")
          .then((msg) => {
            collector.on('collect', ms => {
              switch (ms.content) {
                case "stop":
                case "s":
                  valid = true;
                  break;

                case "next":
                case "n":
                  valid = true;
                  break;

                case "play":
                case "p":
                  valid = true;
                  break;
              }
              ms.delete();
              collector.stop();
            });

            collector.on('end', collected => {
              if (!valid) {
                delete serverConf.searchQueue[message.author.id];
                client.settings.set(message.guild.id, serverConf);
                return message.channel.send(`Time expired for search.`);
              }
              var choice = collected.first().content.toLowerCase();

              switch (choice) {
                case "stop":
                case "s":
                  msg.delete();
                  delete serverConf.searchQueue[message.author.id];
                  break;

                case "next":
                case "n":
                  msg.delete();
                  if (serverConf.searchQueue[message.author.id][0])
                    ask();
                  break;

                case "play":
                case "p":
                  delete serverConf.searchQueue[message.author.id];
                  if (!message.guild.connection) {
                    let voiceChannel = message.member.voiceChannel;
                    if (!voiceChannel)
                      return message.channel.send(`You need to be in a voice channel for that`);
                    var permissions = voiceChannel.permissionsFor(client.user);
                    if (!permissions.has('CONNECT'))
                      return message.channel.send(`I do not have permission to join your voice channel.`);
                    if (!permissions.has('SPEAK'))
                      return message.channel.send(`I do not have permission to speak in your voice channel. What a shame... No freedom of speech for robots?`);
                  }

                  message.channel.send(`Your link has been added to the queue`).then((m) => {
                    AddToQueue(video.shortURL, m);
                  });
                  break;

                default:
                  delete serverConf.searchQueue[message.author.id];

              }
              client.settings.set(message.guild.id, serverConf);

            });
            client.settings.set(message.guild.id, serverConf);
          });
      }

      function AddToQueue(link, m) {
        client.ytdl.getInfo(link)
          .then((info) => {
            ProcessLink(link, m, info.title);
          })
          .catch((err) => {
            if (link in serverConf.saves)
              AddToQueue(serverConf.saves[link], m); // Recursivity FTW!
            else {
              client.sya.searchVideos(args.slice(1).join(' '))
                .then((v) => {
                  if (!v[0])
                    handleAsyncError(new Error(1));
                  else
                    AddToQueue(v[0].shortURL, m);
                })
                .catch(client.logger.error);
            }
          });
      }

      switch (args[0]) { // Getting the music command

        case "play":
          if (args.length >= 2) {
            let voiceChannel = message.member.voiceChannel;
            if (voiceChannel) {
              var link;
              const permissions = voiceChannel.permissionsFor(client.user);
              if (!permissions.has('CONNECT'))
                return message.channel.send(`I do not have permission to join your voice channel.`);
              if (!permissions.has('SPEAK'))
                return message.channel.send(`I do not have permission to speak in your voice channel. What a shame... No freedom of speech for robots?`);

              message.channel.send(`Resolving link... This might take a while, see ${serverConf.prefix}help music to know why!`)
                .then((m) => {
                  AddToQueue(args[1], m);
                });

            } else {
              message.channel.send(`You need to be in a voice channel for that!`);
            }
          } else {
            if (message.guild.voiceConnection) {
              if (message.guild.voiceConnection.dispatcher) {
                if (message.guild.voiceConnection.dispatcher.paused) {
                  message.guild.voiceConnection.dispatcher.resume();
                } else {
                  message.channel.send(`Missing arguments, use ${serverConf.prefix}help music for info on how to use the command`);
                }
              } else {
                message.channel.send(`Missing arguments, use ${serverConf.prefix}help music for info on how to use the command`);
              }
            } else {
              message.channel.send(`Missing arguments, use ${serverConf.prefix}help music for info on how to use the command`);
            }
          }
          break;

        case "queue":
          if (message.guild.voiceConnection) {
            try {
              var queue = "Music Queue:\n"
              message.channel.send(`Fetching queue info...`)
                .then((m) => {
                  client.ytdl.getInfo(serverConf.current.link)
                    .then((info) => {
                      queue += `Currently playing **${info.title}**\n${serverConf.current.link}\n\n${serverConf.queue.length > 0 ? "Up next:" : ""}\n`;
                      for (var i = 0; i < serverConf.queue.length; ++i) {
                        queue += `${i + 1}. ${serverConf.queue[i].title}\n`;
                      }
                      m.edit(queue);
                    });
                });
            } catch (err) {
              client.logger.error(`${err.stack == undefined ? err:err.stack}`);
            }

          }
          break;

        case "clear":
          if (args.length == 1) {
            serverConf.queue = [];
            client.settings.set(message.guild.id, serverConf);
            if (serverConf.NotificationChannel != null)
              if (client.channels.get(serverConf.NotificationChannel).permissionsFor(client.user).has('SEND_MESSAGES'))
                message.guild.channels.get(serverConf.NotificationChannel).send(`Music queue cleared!`);
          }
          break;

        case "skip":
          if (message.guild.voiceConnection) {
            if (message.guild.voiceConnection.dispatcher) {
              if (message.guild.voiceConnection.dispatcher.paused)
                message.guild.voiceConnection.dispatcher.resume();
              message.guild.voiceConnection.dispatcher.end();
            }
          }
          break;

        case "pause":
          if (message.guild.voiceConnection) {
            if (message.guild.voiceConnection.dispatcher)
              message.guild.voiceConnection.dispatcher.pause();
          }
          break;

        case "resume":
          if (message.guild.voiceConnection) {
            if (message.guild.voiceConnection.dispatcher)
              message.guild.voiceConnection.dispatcher.resume();
          }
          break;

        case "stop":
          try {
            if (message.guild.voiceConnection) {
              serverConf.voiceChannel = null;
              serverConf.queue = [];
              serverConf.current = null;
              client.settings.set(message.guild.id, serverConf);
              message.guild.voiceConnection.disconnect();
            }
          } catch (err) {
            client.logger.error(`error at music stop command:\n${err}`);
            message.channel.send(`Something went wrong. Try using the music play command and then do the music stop command. That should technically do the the job :p`);
          }
          break;

        case "save":
          if (!args.length == 3)
            return message.channel.send(`Wrong syntax. Use ${serverConf.prefix}help music for info on the command\n${serverConf.prefix}music save <link> <name>`);
          var link = "noLink";
          client.ytdl.getInfo(args[1])
            .then((info) => {
              ProcessSave(args[1]);
            })
            .catch((err) => {
              if (args[1] == "current" && serverConf.current != null)
                ProcessSave(serverConf.current);
              else
                return message.channel.send(`Link invalid`);
            });
          break;

        case "saves":
          var saves = "Music Saves:\n"
          for (name in serverConf.saves) {
            if (serverConf.saves.hasOwnProperty(name)) {
              saves += `${name}\n`;
            }
          }
          message.channel.send(saves);
          break;

        case "unsave":
          if (args.length == 2) {
            if (serverConf.saves.hasOwnProperty(args[1])) {
              delete serverConf.saves[args[1]];
              message.channel.send(`${args[1]} has been deleted!`);
            } else {
              message.channel.send(`${args[1]} is not a saved link name...`);
            }
          }
          break;

        case "volume":
          if (message.guild.voiceConnection) {
            if (message.guild.voiceConnection.dispatcher) {
              if (args.length != 2)
                return message.channel.send(`Wrong syntax. Use ${serverConf.prefix}help music for info on how to use the command.\n${serverConf.prefix}music volume <volume>`);

              var volume = args[1];

              if (isNaN(volume))
                return message.channel.send(`Volume needs to be a number`);

              if (volume < 0 || volume > 2.5)
                return message.channel.send(`Volume needs to be between 0 and 2.5`);

              message.guild.voiceConnection.dispatcher.setVolume(volume);
            }
          }
          break;

        case "playlist":
          if (args.length == 3 || args.length == 5 || args.length == 4) {
            // Was starting to get confusing
            const command = 0;
            const playName = 1;
            const action = 2;
            const link = 3;
            const linkName = 4;

            switch (args[action]) {
              case "create":
                if (args.length == 3) {
                  if (serverConf.playlists.hasOwnProperty(args[playName]))
                    return message.channel.send(`${args[playName]} is already a playlist`);
                  serverConf.playlists[args[playName]] = {};
                  client.settings.set(message.guild.id, serverConf);
                  message.channel.send(`playlist ${args[playName]} has been created! You can now add links to it using the following:\n${serverConf.prefix}music playlist ${args[playName]} add <link> <name>`);
                }
                break;

              case "delete":
                if (args.length == 3) {
                  if (serverConf.playlists.hasOwnProperty(args[playName])) {
                    delete serverConf.playlists[args[playName]];
                    client.settings.set(message.guild.id, serverConf);
                    message.channel.send(`${args[playName]} has been deleted!`);
                  } else {
                    message.channel.send(`${args[playName]} doesn't exist!`);
                  }
                }
                break;

              case "add":
                if (args.length == 5) {
                  if (!serverConf.playlists.hasOwnProperty(args[playName]))
                    return message.channel.send(`${args[playName]} is not an existing playlist!`);

                  client.ytdl.getInfo(args[link])
                    .then((info) => {
                      ProcessAdd({
                        link: args[link],
                        title: info.title
                      });
                    })
                    .catch((err) => {
                      if (args[link] == "current" && serverConf.current != null)
                        ProcessAdd(serverConf.current);
                      else
                        return message.channel.send(`Link invalid`);
                    });

                } else {
                  return message.channel.send(`Wrong syntax. Use ${serverConf.prefix}help music for info on how to use the command.`)
                }

                break;

              case "remove":
                if (args.length == 4) {
                  if (!serverConf.playlists.hasOwnProperty(args[playName]))
                    return message.channel.send(`${args[playName]} is not an existing playlist!`);
                  if (!serverConf.playlists[args[playName]].hasOwnProperty(args[3]))
                    return message.channel.send(`${args[3]} is not a link in ${args[playName]}`);

                  delete serverConf.playlists[args[playName]][args[3]];
                  client.settings.set(message.guild.id, serverConf);
                  message.channel.send(`removed ${args[3]} from playlist ${args[playName]}!`);
                }
                break;

              case "play":
                try {
                  if (args.length == 3) { // Play entire playlist
                    if (!message.guild.connection) {
                      let voiceChannel = message.member.voiceChannel;
                      if (!voiceChannel)
                        return message.channel.send(`You need to be in a voice channel for that`);
                      var permissions = voiceChannel.permissionsFor(client.user);
                      if (!permissions.has('CONNECT'))
                        return message.channel.send(`I do not have permission to join your voice channel.`);
                      if (!permissions.has('SPEAK'))
                        return message.channel.send(`I do not have permission to speak in your voice channel. What a shame... No freedom of speech for robots?`);
                    }
                    if (!serverConf.playlists.hasOwnProperty(args[playName]))
                      return message.channel.send(`${args[playName]} is not an existing playlist`);
                    if (Object.keys(serverConf.playlists[args[playName]]).length == 0)
                      return message.channel.send(`The playlist is empty!`);

                    for (elem in serverConf.playlists[args[playName]]) {
                      if (serverConf.playlists[args[playName]].hasOwnProperty(elem)) {
                        serverConf.queue.push(serverConf.playlists[args[playName]][elem]);
                      }
                    }
                    message.channel.send(`Your links has been added to the queue`);

                    if (!message.guild.voiceConnection) {
                      serverConf.voiceChannel = message.member.voiceChannel.id;
                      message.member.voiceChannel.join().then(function(connection) {
                        play(connection, message);
                      });
                    } else if (message.guild.voiceConnection.dispatcher) {
                      if (message.guild.voiceConnection.dispatcher.paused)
                        message.guild.voiceConnection.dispatcher.resume();
                    }
                    client.settings.set(message.guild.id, serverConf);
                  } else if (args.length == 4) { // Play playlist song
                    if (!message.guild.connection) {
                      let voiceChannel = message.member.voiceChannel;
                      if (!voiceChannel)
                        return message.channel.send(`You need to be in a voice channel for that`);
                      var permissions = voiceChannel.permissionsFor(client.user);
                      if (!permissions.has('CONNECT'))
                        return message.channel.send(`I do not have permission to join your voice channel.`);
                      if (!permissions.has('SPEAK'))
                        return message.channel.send(`I do not have permission to speak in your voice channel. What a shame... No freedom of speech for robots?`);
                    }
                    if (!serverConf.playlists.hasOwnProperty(args[playName]))
                      return message.channel.send(`${args[playName]} is not an existing playlist`);
                    if (!serverConf.playlists[args[playName]].hasOwnProperty(args[3]))
                      return message.channel.send(`${args[3]} is not a link name in ${args[playName]}`);

                    serverConf.queue.push(serverConf.playlists[args[playName]][args[3]]);
                    message.channel.send(`Your link has been added to the queue`);

                    if (!message.guild.voiceConnection) {
                      serverConf.voiceChannel = message.member.voiceChannel.id;
                      message.member.voiceChannel.join().then(function(connection) {
                        play(connection, message);
                      });
                    } else if (message.guild.voiceConnection.dispatcher) {
                      if (message.guild.voiceConnection.dispatcher.paused)
                        message.guild.voiceConnection.dispatcher.resume();
                    }
                    client.settings.set(message.guild.id, serverConf);
                  }
                } catch (err) {
                  client.logger.error(`error at music playlist play command:\n${err.stack}`);
                  message.channel.send(`Something went wrong. Try using the music play command and then do the music stop command. That should technically do the the job :p`);
                }
                break;

              case "show":
                if (args.length == 3) {
                  if (!serverConf.playlists.hasOwnProperty(args[playName]))
                    return message.channel.send(`${args[playName]} is not an existing playlist`);

                  var playlist = `Links in ${args[playName]}:\n`;
                  var i = 1;
                  for (elem in serverConf.playlists[args[playName]]) {
                    if (serverConf.playlists[args[playName]].hasOwnProperty(elem)) {
                      playlist += `${i}. ${elem}\n`;
                      ++i;
                    }
                  }

                  message.channel.send(playlist);
                }
                break;

              case "shuffle":
                if (args.length == 3) {
                  if (!serverConf.playlists.hasOwnProperty(args[playName]))
                    return message.channel.send(`${args[playName]} is not an existing playlist`);

                  function shuffle(o) {
                    for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
                    return o;
                  };

                  var o = serverConf.playlists[args[playName]];
                  var tempArr = [];
                  var order = [];
                  for (name in o) {
                    if (o.hasOwnProperty(name)) {
                      obj = {};
                      obj[name] = o[name];
                      tempArr.push(obj);
                    }
                  }

                  for (var pos = 0; pos < tempArr.length; pos++) {
                    order.push(pos);
                  }

                  order = shuffle(order);

                  var playlist = {};

                  for (var pos = 0; pos < order.length; pos++) {
                    var obj = tempArr[order[pos]];
                    for (name in obj) {
                      if (obj.hasOwnProperty(name)) {
                        playlist[name] = obj[name];
                      }
                    }
                  }
                  serverConf.playlists[args[playName]] = playlist;
                  client.settings.set(message.guild.id, serverConf);

                  message.channel.send(`${args[playName]} has been shuffled!`);
                }
                break;
              default:
                message.channel.send(`${args[action]} is not a playlist action`);
            }
          } else {
            message.channel.send(`Wrong syntax. Use ${serverConf.prefix}help music for info on how to use the command`);
          }
          break;

        case "playlists":
          var playlists = `Playlists:\n`;
          var i = 1;

          for (playlist in serverConf.playlists) {
            if (serverConf.playlists.hasOwnProperty(playlist)) {
              playlists += `${i}. ${playlist}\n`;
              ++i;
            }
          }

          message.channel.send(playlists);
          break;

        case "search":
          if (args.length < 2)
            return message.channel.send(`Wrong syntax. Use ${serverConf.prefix}help music to get info on the command.`);

          var limit = 5;
          var limitSet = false;

          if (!isNaN(args[1])) {
            if (args[1] <= 20 && args[1] >= 1)
              limit = Math.floor(args[1]);
            else
              return message.channel.send(`Max seach limit is 20. (Min 1)`);

            limitSet = true;
          }

          var query;
          if (limitSet)
            query = args.slice(2).join(' ');
          else
            query = args.slice(1).join(' ');

          client.sya.searchVideos(query, limit)
            .then((v) => {
              serverConf.searchQueue[message.author.id] = v;
              ask();
            })
            .catch(client.logger.error);
          break;

        case "replay":
          if (args.length != 1)
            return message.channel.send(`Wrong syntax. Use ${serverConf.prefix}help music to get info on the command.`);
          if (!message.guild.voiceConnection)
            return message.channel.send(`There's no link playing right now!`);
          if (!serverConf.current)
            return message.channel.send(`Well that's odd, I do not know what is the current link playing... Sorry for that!`);

          serverConf.queue.push(serverConf.current);
          client.settings.set(message.guild.id, serverConf);
          message.channel.send(`Link has been added to the queue!`);
          break;

        default:
          message.channel.send(`${args[0]} is not one of the music sub-commands...`);

      }
      break;

    default:
      message.channel.send(`Wrong syntax for music command. Use ${Settings.prefix}help music for info on how to use the command.`);
      break;
  }
}
