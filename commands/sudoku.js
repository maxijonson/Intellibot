exports.run = (client, message, args, serverConf) => {
  if (!message.attachments.first())
    return message.channel.send(`Must give a .txt file`);
  var attachment = message.attachments.first();
  if (!attachment.filename.endsWith(".txt"))
    return message.channel.send(`You must send a .txt file`);

  client.download(attachment.url, client.fs, `tmp/${message.author.id}-sudoku.txt`, function() {
    client.fs.readFile(`tmp/${message.author.id}-sudoku.txt`, 'utf8', (err, text) => {
      if (err) return message.channel.send(`Something went wrong when reading the file. Are you sure it is the right format?`).then((msg) => {
        client.fs.unlink(`tmp/${message.author.id}-sudoku.txt`, (err) => {
          if (err) throw err;
        });
      });

      var lines = text.split('\n');
      if (lines.length != 9)
        return message.channel.send(`Invalid format. Must have 9 lines.`).then((msg) => {
          client.fs.unlink(`tmp/${message.author.id}-sudoku.txt`, (err) => {
            if (err) throw err;
          });
        });

      var matrix = [];
      for (var i = 0; i < lines.length; ++i) {
        var line = lines[i].replace('\r', "");
        if (line.length != 9)
          return message.channel.send(`Invalid format. Lines must have 9 characters.`).then((msg) => {
            client.fs.unlink(`tmp/${message.author.id}-sudoku.txt`, (err) => {
              if (err) throw err;
            });
          });
        var l = line.split("", 9);
        if (l.some(isNaN))
          return message.channel.send(`Each character must be a number`).then((msg) => {
            client.fs.unlink(`tmp/${message.author.id}-sudoku.txt`, (err) => {
              if (err) throw err;
            });
          });
        var arr = [];
        l.forEach((c) => {
          arr.push(Number(c));
        })
        matrix.push(arr);
      }

      /// All processing should be done. The matrix should be legit from here.

      function normalise(o) {
        if (o.l < 9 && o.c < 9)
          return true;
        if (o.c >= 9) {
          o.l++;
          o.c = 0;
        }
        if (o.l < 9)
          return true;
        return false;
      }

      function checkCompletion(o) {
        for (o.l = 0; o.l < 9; o.l++)
          for (o.c = 0; o.c < 9; o.c++)
            if (matrix[o.l][o.c] == 0)
              return false;
        return true;
      }

      function checkBlock(n, l, c) {
        l = l - l % 3;
        c = c - c % 3;
        for (var L = 0; L < 3; ++L)
          for (var C = 0; C < 3; ++C)
            if (matrix[L + l][C + c] == n)
              return false;
        return true;
      }

      function checkH(n, l) {
        for (var C = 0; C < 9; ++C)
          if (matrix[l][C] == n)
            return false;
        return true;
      }

      function checkV(n, c) {
        for (var L = 0; L < 9; ++L)
          if (matrix[L][c] == n)
            return false;
        return true;
      }

      function isValid(n, l, c) {
        return (checkBlock(n, l, c) && checkH(n, l) && checkV(n, c));
      }


      function placeDigit(l, c) {
        var tmp = {
          l: l,
          c: c
        }
        if (checkCompletion(tmp))
          return true;

        l = tmp.l;
        c = tmp.c;

        if (normalise(tmp)) {
          l = tmp.l;
          c = tmp.c;
          for (var n = 1; n <= 9; ++n) {
            if (isValid(n, l, c)) {
              matrix[l][c] = n;
              if (placeDigit(l, c))
                return true;
              matrix[l][c] = 0;
            }
          }
        }
        return false;
      }

      var start = new Date();
      placeDigit(0, 0);
      var end = new Date();
      var time = end.getMilliseconds() - start.getMilliseconds();
      var msg = ``;
      var i = 0;
      var j = 0;
      matrix.forEach((line) => {
        line.forEach((c) => {
          msg += ` ${c} `;
          if (i == 2 || i == 5) {
            msg += '\t|\t';
            ++i;
          } else
            ++i;
        });
        msg += '\n';
        i = 0;
        if (j == 2 || j == 5) {
          msg += `-------------------------------------\n`;
          ++j;
        } else {
          ++j;
        }
      });

      if (checkCompletion({
          l: 0,
          c: 0
        }))
        message.channel.send(`${msg}\nTime: \`${time}ms\``).then((m) => {
          serverConf.sudokuCount++;
          client.settings.set(message.guild.id, serverConf);
        });
      else
        message.channel.send(`Unsolvable.`);

      client.fs.unlink(`tmp/${message.author.id}-sudoku.txt`, (err) => {
        if (err) throw err;
      });
    })
  });
}
