exports.run = (client, message, args, serverConf) => {
  var glbMsg;
  switch (true) {
    case (args.length == 0):
      message.channel.send({
        embed: new client.Discord.RichEmbed()
          .setColor([255, 0, 0])
          .setDescription(`:x: Missing arguments! Use ${serverConf.prefix}help music for info on how to use the command.`)
      }).then((m) => {
        setTimeout(() => {
          m.delete();
        }, 10000);
      });
      break;

    case (args.length > 0):

      function play(connection, message) {
        try {
          client.ytdl.getInfo(serverConf.queue[0].link, function(err, info) {
            if (info.pltype == 'contentlive')
              return message.channel.send({
                embed: new client.Discord.RichEmbed()
                  .setColor([255, 0, 0])
                  .setDescription(`:x: Live streams are not supported`)
              }).then((m) => {
                setTimeout(() => {
                  m.delete();
                }, 2500);
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
              client.logger.info(JSON.stringify(info, null, '\t'));
            if (serverConf.NotificationChannel != null)
              if (client.channels.get(serverConf.NotificationChannel).permissionsFor(client.user).has('SEND_MESSAGES')) {
                try {
                  message.guild.channels.get(serverConf.NotificationChannel).send({
                    embed: new client.Discord.RichEmbed()
                      .setColor([255, 255, 255])
                      .setTitle(':musical_note: Now Playing')
                      .setDescription(`${info.title}`)
                      .setURL(info.video_url)
                      .setImage(info.player_response.videoDetails.thumbnail.thumbnails[3].url)
                  }).then((m) => {
                    setTimeout(() => {
                      m.delete();
                    }, 360000);
                  });
                } catch(err) {
                  message.guild.channels.get(serverConf.NotificationChannel).send({
                    embed: new client.Discord.RichEmbed()
                      .setColor([255, 255, 255])
                      .setTitle(':musical_note: Now Playing')
                      .setDescription(`${info.title}`)
                      .setURL(info.video_url)
                  }).then((m) => {
                    setTimeout(() => {
                      m.delete();
                    }, 360000);
                  });
                }
              }

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
          return message.channel.send({
            embed: new client.Discord.RichEmbed()
              .setColor('ORANGE')
              .setDescription(`:warning: Something went wrong while fetching the video!`)
          }).then((m) => {
            setTimeout(() => {
              m.delete();
            }, 10000);
          });
        }
      }

      function handleAsyncError(err) {
        if (err) {
          var handled = true;
          switch (err.message) {
            case "1":
              message.channel.send({
                embed: new client.Discord.RichEmbed()
                  .setColor('ORANGE')
                  .setDescription(`:warning: No video with that name was found!`)
              }).then((m) => {
                setTimeout(() => {
                  m.delete();
                }, 10000);
              });
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
        m.edit({
          embed: new client.Discord.RichEmbed()
            .setColor([255, 255, 255])
            .setDescription(`:link: Your link has been added to the queue`)
        }).then((m) => {
          setTimeout(() => {
            m.delete();
          }, 2000);
        });

        if (!message.guild.voiceConnection) {
          serverConf.voiceChannel = message.member.voiceChannel.id;
          m.edit({
            embed: new client.Discord.RichEmbed()
              .setColor([255, 255, 255])
              .setDescription(`:loud_sound: Hold on while I connect to your voice channel...`)
          }).then((m) => {
            message.member.voiceChannel.join().then(function(connection) {
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
        message.channel.send({
          embed: new client.Discord.RichEmbed()
            .setColor([255, 255, 255])
            .setDescription(`:white_check_mark: ${args[2]} has been saved!`)
        }).then((m) => {
          setTimeout(() => {
            m.delete();
          }, 5000);
        });
      }

      function ProcessAdd(link) {
        serverConf.playlists[args[1]][args[4]] = link;
        client.settings.set(message.guild.id, serverConf);
        message.channel.send({
          embed: new client.Discord.RichEmbed()
            .setColor([255, 255, 255])
            .setDescription(`:white_check_mark: Added ${args[4]} to playlist ${args[1]}!`)
        }).then((m) => {
          setTimeout(() => {
            m.delete();
          }, 5000);
        });
      }


      function ask() {
        var video = serverConf.searchQueue[message.author.id].shift();
        const collector = new client.Discord.MessageCollector(message.channel, m => (m.author.id === message.author.id && ["p", "P", "play", "n", "N", "next", "s", "S", "stop"].includes(m.content.toLowerCase())), {
          time: 10000
        });

        var valid = false;
        message.channel.send({
          embed: new client.Discord.RichEmbed()
            .setColor([255, 255, 255])
            .setTitle(video.title)
            .setDescription(`By ${video.channel.title}`)
            .setFooter(`play - p | next - n | stop - s`)
            .setImage(video.thumbnails.medium.url)
            .setURL(video.shortURL)
        }).then((msg) => {
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
            msg.delete();
            collector.stop();
          });

          collector.on('end', collected => {
            if (!valid) {
              delete serverConf.searchQueue[message.author.id];
              client.settings.set(message.guild.id, serverConf);
              return msg.edit({
                embed: new client.Discord.RichEmbed()
                  .setColor('ORANGE')
                  .setDescription(':alarm_clock: Time expired for search.')
              }).then((m) => {
                setTimeout(() => {
                  m.delete();
                }, 3500);
              });
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
                    return message.channel.send({
                      embed: new client.Discord.RichEmbed()
                        .setColor('ORANGE')
                        .setDescription(`:warning: You need to be in a voice channel.`)
                    }).then((m) => {
                      setTimeout(function() {
                        m.delete();
                      }, 10000);
                    });
                  var permissions = voiceChannel.permissionsFor(client.user);
                  if (!permissions.has('CONNECT'))
                    return message.channel.send({
                      embed: new client.Discord.RichEmbed()
                        .setColor('ORANGE')
                        .setDescription(`:warning: I do not have permission to join your voice channel.`)
                    }).then((m) => {
                      setTimeout(function() {
                        m.delete();
                      }, 10000);
                    });
                  if (!permissions.has('SPEAK'))
                    return message.channel.send({
                      embed: new client.Discord.RichEmbed()
                        .setColor('ORANGE')
                        .setDescription(`:warning: I do not have permission to speak in your voice channel`)
                    }).then((m) => {
                      setTimeout(function() {
                        m.delete();
                      }, 10000);
                    });
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
              AddToQueue(serverConf.saves[link].link, m); // Recursivity FTW!
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
                return message.channel.send({
                  embed: new client.Discord.RichEmbed()
                    .setColor('ORANGE')
                    .setDescription(`:warning: I do not have permission to join your voice channel.`)
                }).then((m) => {
                  setTimeout(function() {
                    m.delete();
                  }, 5000);
                });
              if (!permissions.has('SPEAK'))
                return message.channel.send({
                  embed: new client.Discord.RichEmbed()
                    .setColor('ORANGE')
                    .setDescription(`:warning: I do not have permission to speak in your voice channel`)
                }).then((m) => {
                  setTimeout(function() {
                    m.delete();
                  }, 5000);
                });

              message.channel.send({
                  embed: new client.Discord.RichEmbed()
                    .setColor([255, 255, 255])
                    .setDescription(`:gear: Resolving link...`)
                })
                .then((m) => {
                  AddToQueue(args[1], m);
                });

            } else {
              message.channel.send({
                embed: new client.Discord.RichEmbed()
                  .setColor('ORANGE')
                  .setDescription(`:warning: You need to be in a voice channel.`)
              }).then((m) => {
                setTimeout(function() {
                  m.delete();
                }, 5000);
              });
            }
          } else {
            if (message.guild.voiceConnection) {
              if (message.guild.voiceConnection.dispatcher) {
                if (message.guild.voiceConnection.dispatcher.paused) {
                  message.guild.voiceConnection.dispatcher.resume();
                } else {
                  message.channel.send({
                    embed: new client.Discord.RichEmbed()
                      .setColor([255, 0, 0])
                      .setDescription(`:x: Missing arguments! Use ${serverConf.prefix}help music for info on how to use the command.`)
                  }).then((m) => {
                    setTimeout(() => {
                      m.delete();
                    }, 10000);
                  });
                }
              } else {
                message.channel.send({
                  embed: new client.Discord.RichEmbed()
                    .setColor([255, 0, 0])
                    .setDescription(`:x: Missing arguments! Use ${serverConf.prefix}help music for info on how to use the command.`)
                }).then((m) => {
                  setTimeout(() => {
                    m.delete();
                  }, 10000);
                });
              }
            } else {
              message.channel.send({
                embed: new client.Discord.RichEmbed()
                  .setColor([255, 0, 0])
                  .setDescription(`:x: Missing arguments! Use ${serverConf.prefix}help music for info on how to use the command.`)
              }).then((m) => {
                setTimeout(() => {
                  m.delete();
                }, 10000);
              });
            }
          }
          break;

        case "queue":
          if (message.guild.voiceConnection) {
            try {
              var queue = "Music Queue:\n"
              message.channel.send({
                  embed: new client.Discord.RichEmbed()
                    .setColor([255, 255, 255])
                    .setDescription(`:speech_balloon: Fetching queue info...`)
                })
                .then((m) => {
                  client.ytdl.getInfo(serverConf.current.link)
                    .then((info) => {
                      var next = '';
                      for (var i = 0; i < serverConf.queue.length && i < 10; ++i) {
                        next += `${i + 1}. ${serverConf.queue[i].title}\n`;
                      }
                      if (serverConf.queue.length > 10)
                        next += `\n(${serverConf.queue.length - 10} other songs queued)`;

                      m.edit({
                        embed: new client.Discord.RichEmbed()
                          .setColor([255, 255, 255])
                          .setTitle(`:musical_note: Currently Playing :musical_note:`)
                          .setURL(serverConf.current.link)
                          .setDescription(`${serverConf.current.title}`)
                          .setImage(info.player_response.videoDetails.thumbnail.thumbnails[3].url)
                          .addField('Next Up', serverConf.queue.length == 0 ? "No other links queued" : next)
                      }).then((m) => {
                        setTimeout(function() {
                          m.delete();
                        }, 120000);
                      });
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
                message.guild.channels.get(serverConf.NotificationChannel).send({
                  embed: new client.Discord.RichEmbed()
                    .setColor([255, 255, 255])
                    .setDescription(`:eight_pointed_black_star: Music queue cleared!`)
                }).then((m) => {
                  setTimeout(function() {
                    m.delete();
                  }, 2500);
                });
          }
          break;

        case "skip":
          if (message.guild.voiceConnection) {
            if (message.guild.voiceConnection.dispatcher) {
              if (message.guild.voiceConnection.dispatcher.paused)
                message.guild.voiceConnection.dispatcher.resume();
              message.channel.send({
                embed: new client.Discord.RichEmbed()
                  .setColor([255, 255, 255])
                  .setDescription(`:track_next: Skipping`)
              }).then((m) => {
                setTimeout(function() {
                  m.delete();
                }, 2500);
              });
              message.guild.voiceConnection.dispatcher.end();
            }
          }
          break;

        case "pause":
          if (message.guild.voiceConnection) {
            if (message.guild.voiceConnection.dispatcher)
              message.channel.send({
                embed: new client.Discord.RichEmbed()
                  .setColor([255, 255, 255])
                  .setDescription(`:pause_button: Pausing...`)
              }).then((m) => {
                message.guild.voiceConnection.dispatcher.pause()
                setTimeout(function() {
                  m.delete();
                }, 2500);
              });
          }
          break;

        case "resume":
          if (message.guild.voiceConnection) {
            if (message.guild.voiceConnection.dispatcher)
              message.channel.send({
                embed: new client.Discord.RichEmbed()
                  .setColor([255, 255, 255])
                  .setDescription(`:arrow_forward: Resuming...`)
              }).then((m) => {
                message.guild.voiceConnection.dispatcher.resume()
                setTimeout(function() {
                  m.delete();
                }, 2500);
              });
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
              message.channel.send({
                embed: new client.Discord.RichEmbed()
                  .setColor([255, 255, 255])
                  .setDescription(`:stop_button: Stopped`)
              }).then((m) => {
                setTimeout(function() {
                  m.delete();
                }, 2500);
              })
            }
          } catch (err) {
            client.logger.error(`error at music stop command:\n${err}`);
            message.channel.send({
              embed: new client.Discord.RichEmbed()
                .setColor('ORANGE')
                .setDescription(`:warning: Something went wrong. Try using the music play command and then do the music stop command. That should technically do the the job :p`)
            }).then((m) => {
              setTimeout(function() {
                m.delete();
              }, 10000);
            });
          }
          break;

        case "save":
          if (!args.length == 3)
            return message.channel.send({
              embed: new client.Discord.RichEmbed()
                .setColor([255, 0, 0])
                .setDescription(`:x: Missing arguments! Use ${serverConf.prefix}help music for info on how to use the command.`)
            }).then((m) => {
              setTimeout(() => {
                m.delete();
              }, 10000);
            });
          var link = "noLink";
          client.ytdl.getInfo(args[1])
            .then((info) => {
              ProcessSave({
                link: args[1],
                title: info.title
              });
            })
            .catch((err) => {
              if (args[1] == "current" && serverConf.current != null)
                ProcessSave(serverConf.current);
              else
                return message.channel.send({
                  embed: new client.Discord.RichEmbed()
                    .setColor([255, 0, 0])
                    .setDescription(`:x: Invalid Link`)
                }).then((m) => {
                  setTimeout(function() {
                    m.delete();
                  }, 10000);
                });
            });
          break;

        case "saves":
          if (args[1]) {
            if (args[1] == "all") {
              var saves = "Music saves\n";
              var i = 1;
              for (var name in serverConf.saves) {
                if (serverConf.saves.hasOwnProperty(name)) {
                  saves += `${i}. ${name}\n`;
                  ++i;
                }
              }
              client.fs.writeFile(`tmp/${message.author.id}-saves.txt`, saves, (err) => {
                if (err) {
                  client.logger.error(err.stack);
                  return message.channel.send({
                    embed: new client.Discord.RichEmbed()
                      .setColor('ORANGE')
                      .setDescription(':warning: An error occured while trying to fetch all your saves. This error has been logged and will be addressed.')
                  }).then((m) => {
                    setTimeout(function() {
                      m.delete();
                    }, 10000);
                  });
                }
                var file = new client.Discord.Attachment(`tmp/${message.author.id}-saves.txt`, 'Music Saves.txt');
                message.channel.send(file).then((m) => {
                  client.fs.unlink(`tmp/${message.author.id}-saves.txt`, (err) => {
                    if (err) client.logger.error(err.stack);
                  });
                });
              });
            }
          } else {
            var saves = "";
            var i = 1;
            for (name in serverConf.saves) {
              if (i > 10) {
                saves += `\n(${Object.keys(serverConf.saves).length - 10} more saves. \`${serverConf.prefix}music saves all\` to show all)`;
                break;
              }
              if (serverConf.saves.hasOwnProperty(name)) {
                saves += `${i}. ${name}\n`;
                ++i;
              }
            }
            message.channel.send({
              embed: new client.Discord.RichEmbed()
                .setColor([255, 255, 255])
                .setTitle(`:musical_note: Saves`)
                .setDescription(saves)
            });
          }
          break;

        case "unsave":
          if (args.length == 2) {
            if (serverConf.saves.hasOwnProperty(args[1])) {
              delete serverConf.saves[args[1]];
              message.channel.send({
                embed: new client.Discord.RichEmbed()
                  .setColor([255, 255, 255])
                  .setDescription(`:white_check_mark: ${args[1]} has been unsaved!`)
              }).then((m) => {
                setTimeout(function() {
                  m.delete();
                }, 2500);
              });
            } else {
              message.channel.send({
                embed: new client.Discord.RichEmbed()
                  .setColor([255, 0, 0])
                  .setDescription(`:x: ${args[1]} is not a saved link name...`)
              }).then((m) => {
                setTimeout(function() {
                  m.delete();
                }, 10000);
              });
            }
          }
          break;

        case "volume":
          if (message.guild.voiceConnection) {
            if (message.guild.voiceConnection.dispatcher) {
              if (args.length != 2)
                return message.channel.send({
                  embed: new client.Discord.RichEmbed()
                    .setColor([255, 0, 0])
                    .setDescription(`:x: Missing arguments! Use ${serverConf.prefix}help music for info on how to use the command.`)
                }).then((m) => {
                  setTimeout(() => {
                    m.delete();
                  }, 10000);
                });
              var volume = args[1];

              if (isNaN(volume))
                return message.channel.send({
                  embed: new client.Discord.RichEmbed()
                    .setColor([255, 0, 0])
                    .setDescription(`:x: Volume must be a number`)
                }).then((m) => {
                  setTimeout(() => {
                    m.delete();
                  }, 10000);
                });

              if (volume < 0 || volume > 2.5)
                return message.channel.send({
                  embed: new client.Discord.RichEmbed()
                    .setColor([255, 0, 0])
                    .setDescription(`:x: Volume must be between 0 and 2.5`)
                }).then((m) => {
                  setTimeout(() => {
                    m.delete();
                  }, 10000);
                });

              message.guild.voiceConnection.dispatcher.setVolume(volume);
              message.channel.send({
                embed: new client.Discord.RichEmbed()
                  .setColor([255, 255, 255])
                  .setDescription(`:loud_sound: Volume set to ${volume}`)
              }).then((m) => {
                setTimeout(function() {
                  m.delete();
                }, 2500);
              });
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
                    return message.channel.send({
                      embed: new client.Discord.RichEmbed()
                        .setColor([255, 0, 0])
                        .setDescription(`:x: ${args[playName]} is already a playlist`)
                    }).then((m) => {
                      setTimeout(function() {
                        m.delete();
                      }, 5000);
                    });
                  serverConf.playlists[args[playName]] = {};
                  client.settings.set(message.guild.id, serverConf);
                  message.channel.send({
                    embed: new client.Discord.RichEmbed()
                      .setColor([255, 255, 255])
                      .setDescription(`:white_check_mark: playlist ${args[playName]} has been created! You can now add links to it using the following:\n${serverConf.prefix}music playlist ${args[playName]} add <link> <name>`)
                  }).then((m) => {
                    setTimeout(function() {
                      m.delete();
                    }, 20000);
                  });
                }
                break;

              case "delete":
                if (args.length == 3) {
                  if (serverConf.playlists.hasOwnProperty(args[playName])) {
                    delete serverConf.playlists[args[playName]];
                    client.settings.set(message.guild.id, serverConf);
                    message.channel.send({
                      embed: new client.Discord.RichEmbed()
                        .setColor([255, 255, 255])
                        .setDescription(`:white_check_mark: ${args[playName]} has been deleted!`)
                    }).then((m) => {
                      setTimeout(function() {
                        m.delete();
                      }, 2500);
                    });
                  } else {
                    message.channel.send({
                      embed: new client.Discord.RichEmbed()
                        .setColor([255, 0, 0])
                        .setDescription(`:x: ${args[playName]} doesn't exist!`)
                    }).then((m) => {
                      setTimeout(function() {
                        m.delete();
                      }, 5000);
                    });
                  }
                }
                break;

              case "add":
                if (args.length == 5) {
                  if (!serverConf.playlists.hasOwnProperty(args[playName]))
                    return message.channel.send({
                      embed: new client.Discord.RichEmbed()
                        .setColor([255, 0, 0])
                        .setDescription(`:x: ${args[playName]} is not an existing playlist!`)
                    }).then((m) => {
                      setTimeout(function() {
                        m.delete();
                      }, 5000);
                    });

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
                        return message.channel.send({
                          embed: new client.Discord.RichEmbed()
                            .setColor([255, 0, 0])
                            .setDescription(`:x: Invalid link`)
                        }).then((m) => {
                          setTimeout(function() {
                            m.delete();
                          }, 5000);
                        });
                    });

                } else {
                  return message.channel.send({
                    embed: new client.Discord.RichEmbed()
                      .setColor([255, 0, 0])
                      .setDescription(`:x: Wrong syntax. Use ${serverConf.prefix}help music for info on how to use the command.`)
                  }).then((m) => {
                    setTimeout(function() {
                      m.delete();
                    }, 10000);
                  });
                }

                break;

              case "remove":
                if (args.length == 4) {
                  if (!serverConf.playlists.hasOwnProperty(args[playName]))
                    return message.channel.send({
                      embed: new client.Discord.RichEmbed()
                        .setColor([255, 0, 0])
                        .setDescription(`:x: ${args[playName]} is not an existing playlist!`)
                    }).then((m) => {
                      setTimeout(function() {
                        m.delete();
                      }, 5000);
                    });
                  if (!serverConf.playlists[args[playName]].hasOwnProperty(args[3]))
                    return message.channel.send({
                      embed: new client.Discord.RichEmbed()
                        .setColor([255, 0, 0])
                        .setDescription(`:x: ${args[3]} is not a link in ${args[playName]}`)
                    });

                  delete serverConf.playlists[args[playName]][args[3]];
                  client.settings.set(message.guild.id, serverConf);
                  message.channel.send({
                    embed: new client.Discord.RichEmbed()
                      .setColor([255, 255, 255])
                      .setDescription(`:white_check_mark: removed ${args[3]} from playlist ${args[playName]}!`)
                  });
                }
                break;

              case "play":
                try {
                  if (args.length == 3) { // Play entire playlist
                    if (!message.guild.connection) {
                      let voiceChannel = message.member.voiceChannel;
                      if (!voiceChannel)
                        return message.channel.send({
                          embed: new client.Discord.RichEmbed()
                            .setColor('ORANGE')
                            .setDescription(`:warning: You need to be in a voice channel for that`)
                        }).then((m) => {
                          setTimeout(function() {
                            m.delete();
                          }, 5000);
                        });
                      var permissions = voiceChannel.permissionsFor(client.user);
                      if (!permissions.has('CONNECT'))
                        return message.channel.send({
                          embed: new client.Discord.RichEmbed()
                            .setColor('ORANGE')
                            .setDescription(`:warning: I do not have permission to join your voice channel.`)
                        }).then((m) => {
                          setTimeout(function() {
                            m.delete();
                          }, 5000);
                        });
                      if (!permissions.has('SPEAK'))
                        return message.channel.send({
                          embed: new client.Discord.RichEmbed()
                            .setColor('ORANGE')
                            .setDescription(`:warning: I do not have permission to speak in your voice channel`)
                        }).then((m) => {
                          setTimeout(function() {
                            m.delete();
                          }, 5000);
                        });
                    }
                    if (!serverConf.playlists.hasOwnProperty(args[playName]))
                      return message.channel.send({
                        embed: new client.Discord.RichEmbed()
                          .setColor([255, 0, 0])
                          .setDescription(`:x: ${args[playName]} is not an existing playlist`)
                      }).then((m) => {
                        setTimeout(function() {
                          m.delete();
                        }, 5000);
                      });
                    if (Object.keys(serverConf.playlists[args[playName]]).length == 0)
                      return message.channel.send({
                        embed: new client.Discord.RichEmbed()
                          .setColor('ORANGE')
                          .setDescription(`:warning: The playlist is empty!`)
                      }).then((m) => {
                        setTimeout(function() {
                          m.delete();
                        }, 5000);
                      });

                    for (elem in serverConf.playlists[args[playName]]) {
                      if (serverConf.playlists[args[playName]].hasOwnProperty(elem)) {
                        serverConf.queue.push(serverConf.playlists[args[playName]][elem]);
                      }
                    }
                    message.channel.send({
                      embed: new client.Discord.RichEmbed()
                        .setColor([255, 255, 255])
                        .setDescription(`:link: Your links has been added to the queue!`)
                    }).then((m) => {
                      setTimeout(function() {
                        m.delete();
                      }, 2500);
                    });

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
                        return message.channel.send({
                          embed: new client.Discord.RichEmbed()
                            .setColor('ORANGE')
                            .setDescription(`:warning: You need to be in a voice channel for that`)
                        }).then((m) => {
                          setTimeout(function() {
                            m.delete();
                          }, 5000);
                        });
                      var permissions = voiceChannel.permissionsFor(client.user);
                      if (!permissions.has('CONNECT'))
                        return message.channel.send({
                          embed: new client.Discord.RichEmbed()
                            .setColor('ORANGE')
                            .setDescription(`:warning: I do not have permission to join your voice channel.`)
                        }).then((m) => {
                          setTimeout(function() {
                            m.delete();
                          }, 5000);
                        });
                      if (!permissions.has('SPEAK'))
                        return message.channel.send({
                          embed: new client.Discord.RichEmbed()
                            .setColor('ORANGE')
                            .setDescription(`:warning: I do not have permission to speak in your voice channel`)
                        }).then((m) => {
                          setTimeout(function() {
                            m.delete();
                          }, 5000);
                        });
                    }
                    if (!serverConf.playlists.hasOwnProperty(args[playName]))
                      return message.channel.send({
                        embed: new client.Discord.RichEmbed()
                          .setColor([255, 0, 0])
                          .setDescription(`:x: ${args[playName]} is not an existing playlist`)
                      }).then((m) => {
                        setTimeout(function() {
                          m.delete();
                        }, 5000);
                      });
                    if (!serverConf.playlists[args[playName]].hasOwnProperty(args[3]))
                      return message.channel.send({
                        embed: new client.Discord.RichEmbed()
                          .setColor([255, 0, 0])
                          .setDescription(`:x: ${args[3]} is not a link name in ${args[playName]}`)
                      }).then((m) => {
                        setTimeout(function() {
                          m.delete();
                        }, 5000);
                      });

                    serverConf.queue.push(serverConf.playlists[args[playName]][args[3]]);
                    message.channel.send({
                      embed: new client.Discord.RichEmbed()
                        .setColor([255, 255, 255])
                        .setDescription(`:link: Your link has been added to the queue`)
                    }).then((m) => {
                      setTimeout(function() {
                        m.delete();
                      }, 2500);
                    });

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
                  message.channel.send({
                    embed: new client.Discord.RichEmbed()
                      .setColor('ORANGE')
                      .setDescription(`:warning: Something went wrong. Try using the music play command and then do the music stop command. That should technically do the the job :p`)
                  }).then((m) => {
                    setTimeout(function() {
                      m.delete();
                    }, 10000);
                  });
                }
                break;

              case "show":
                if (args.length == 3) {
                  if (!serverConf.playlists.hasOwnProperty(args[playName]))
                    return message.channel.send({
                      embed: new client.Discord.RichEmbed()
                        .setColor([255, 0, 0])
                        .setDescription(`:x: ${args[playName]} is not an existing playlist`)
                    });

                  var playlist = Object.keys(serverConf.playlists[args[playName]]).length == 0 ? `No links in ${args[playName]}` : ``;
                  var i = 1;
                  for (elem in serverConf.playlists[args[playName]]) {
                    if (i > 10) {
                      playlist += `\n(${Object.keys(serverConf.playlists[args[playName]]).length - 10} more links in the playlist. \`${serverConf.prefix}music playlist ${args[playName]} show all\` to show all of them)`;
                      break;
                    }

                    if (serverConf.playlists[args[playName]].hasOwnProperty(elem)) {
                      playlist += `${i}. ${elem}\n`;
                      ++i;
                    }
                  }

                  message.channel.send({
                    embed: new client.Discord.RichEmbed()
                      .setColor([255, 255, 255])
                      .setTitle(`:musical_note: Links in ${args[playName]}`)
                      .setDescription(playlist)
                  });
                } else if (args.length == 4) {
                  if (!serverConf.playlists.hasOwnProperty(args[playName]))
                    return message.channel.send({
                      embed: new client.Discord.RichEmbed()
                        .setColor([255, 0, 0])
                        .setDescription(`:x: ${args[playName]} is not an existing playlist`)
                    });

                  if (args[3] == 'all') {
                    var saves = `Links in ${args[playName]} playlist\n`;
                    var i = 1;
                    for (var name in serverConf.playlists[args[playName]]) {
                      saves += `${i}. ${name}\n`;
                      ++i;
                    }
                    client.fs.writeFile(`tmp/${message.author.id}-playlist.txt`, saves, (err) => {
                      if (err) {
                        client.logger.error(err.stack);
                        return message.channel.send({
                          embed: new client.Discord.RichEmbed()
                            .setColor('ORANGE')
                            .setDescription(`:warning: An error occured while trying to fetch the links in the playlist. This error has been logged and will be addressed`)
                        }).then((m) => {
                          setTimeout(function() {
                            m.delete();
                          }, 10000);
                        });
                      }
                      var file = new client.Discord.Attachment(`tmp/${message.author.id}-playlist.txt`, `${args[playName]}.txt`);
                      message.channel.send(file).then((m) => {
                        client.fs.unlink(`tmp/${message.author.id}-playlist.txt`, (err) => {
                          if (err) client.logger.error(err.stack);
                        });
                      });
                    });
                  }
                }
                break;

              case "shuffle":
                if (args.length == 3) {
                  if (!serverConf.playlists.hasOwnProperty(args[playName]))
                    return message.channel.send({
                      embed: new client.Discord.RichEmbed()
                        .setColor([255, 0, 0])
                        .setDescription(`:x: ${args[playName]} is not an existing playlist`)
                    });

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

                  message.channel.send({
                    embed: new client.Discord.RichEmbed()
                      .setColor([255, 255, 255])
                      .setDescription(`:twisted_rightwards_arrows: ${args[playName]} has been shuffled!`)
                  }).then((m) => {
                    setTimeout(function() {
                      m.delete();
                    }, 2500);
                  });
                }
                break;
              default:
                message.channel.send({
                  embed: new client.Discord.RichEmbed()
                    .setColor([255, 0, 0])
                    .setDescription(`:x: ${args[action]} is not a playlist action`)
                }).then((m) => {
                  setTimeout(function() {
                    m.delete();
                  }, 5000);
                });
            }
          } else {
            message.channel.send({
              embed: new client.Discord.RichEmbed()
                .setColor([255, 0, 0])
                .setDescription(`:x: Wrong syntax. Use ${serverConf.prefix}help music for info on how to use the command`)
            }).then((m) => {
              setTimeout(function() {
                m.delete();
              }, 10000);
            });
          }
          break;

        case "playlists":

          if(args[1]) {
            if(args[1] == 'all') {
              var playlists = `Saved Playlists\n`;
              var i = 1;
              for(var p in serverConf.playlists) {
                playlists += `${i}. ${p}\n`;
                ++i;
              }
              client.fs.writeFile(`tmp/${message.author.id}-playlists.txt`, playlists, (err) => {
                if(err) {
                  client.logger.error(err.stack);
                  message.channel.send({
                    embed: new client.Discord.RichEmbed()
                    .setColor('ORANGE')
                    .setDescription(`:warning: There was an error trying to fetch your playlists. This error has been logged and will be addressed`)
                  }).then((m) => {
                    setTimeout(function() {
                      m.delete();
                    }, 10000);
                  });
                }
                var file = new client.Discord.Attachment(`tmp/${message.author.id}-playlists.txt`, 'Playlists.txt');
                return message.channel.send(file).then((m) => {
                  client.fs.unlink(`tmp/${message.author.id}-playlists.txt`, (err) => {
                    if(err) client.logger.error(err.stack);
                  });
                });
              });
            }
          }
          var playlists = Object.keys(serverConf.playlists).length == 0 ? `No playlists saved` : ``;
          var i = 1;

          for (playlist in serverConf.playlists) {
            if (i > 10) {
              playlists += `\n(${Object.keys(serverConf.playlists).length - 10} more playlists. \`${serverConf.prefix}music playlists all\` to show them all)`;
              break;
            }
            if (serverConf.playlists.hasOwnProperty(playlist)) {
              playlists += `${i}. ${playlist}\n`;
              ++i;
            }
          }

          message.channel.send({
            embed: new client.Discord.RichEmbed()
              .setColor([255, 255, 255])
              .setTitle(`:musical_note: Saved Playlists`)
              .setDescription(playlists)
          });
          break;

        case "search":
          if (args.length < 2)
            return message.channel.send({
              embed: new client.Discord.RichEmbed()
              .setColor([255, 0, 0])
              .setDescription(`:x: Wrong syntax. Use ${serverConf.prefix}help music to get info on the command.`)
            }).then((m) => {
              setTimeout(function() {
                m.delete();
              }, 10000);
            });

          var limit = 5;
          var limitSet = false;

          if (!isNaN(args[1])) {
            if (args[1] <= 20 && args[1] >= 1)
              limit = Math.floor(args[1]);
            else
              return message.channel.send({
                embed: new client.Discord.RichEmbed()
                .setColor([255, 0, 0])
                .setDescription(`:x: Max seach limit is 20. (Min 1)`)
              }).then((m) => {
                setTimeout(function() {
                  m.delete();
                }, 5000);
              });

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
            return message.channel.send({
              embed: new client.Discord.RichEmbed()
              .setColor([255, 0, 0])
              .setDescription(`:x: Wrong syntax. Use ${serverConf.prefix}help music to get info on the command.`)
            }).then((m) => {
              setTimeout(function() {
                m.delete();
              }, 10000);
            });
          if (!message.guild.voiceConnection)
            return message.channel.send({
              embed: new client.Discord.RichEmbed()
              .setColor('ORANGE')
              .setDescription(`:warning: There's no link playing right now!`)
            }).then((m) => {
              setTimeout(function() {
                m.delete();
              }, 5000);
            });
          if (!serverConf.current)
            return message.channel.send({
              embed: new client.Discord.RichEmbed()
              .setColor('ORANGE')
              .setDescription(`:warning: Well that's odd, I do not know what is the current link playing... Sorry for that!`)
            }).then((m) => {
              setTimeout(function() {
                m.delete();
              }, 10000);
            });

          serverConf.queue.push(serverConf.current);
          client.settings.set(message.guild.id, serverConf);
          message.channel.send({
            embed: new client.Discord.RichEmbed()
            .setColor([255, 255, 255])
            .setDescription(`:repeat: Link has been added to the queue!`)
          }).then((m)=> {
            setTimeout(function() {
              m.delete();
            }, 2500);
          });
          break;

        default:
          message.channel.send({
            embed: new client.Discord.RichEmbed()
            .setColor([255, 0, 0])
            .setDescription(`:x: ${args[0]} is not one of the music sub-commands...`)
          }).then((m) => {
            setTimeout(function() {
              m.delete();
            }, 5000);
          });

      }
      break;

    default:
      message.channel.send({
        embed: new client.Discord.RichEmbed()
        .setColor([255, 0, 0])
        .setDescription(`:x: Wrong syntax for music command. Use ${Settings.prefix}help music for info on how to use the command.`)
      }).then((m) => {
        setTimeout(function() {
          m.delete();
        }, 10000);
      });
      break;
  }
}
