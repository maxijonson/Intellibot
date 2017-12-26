exports.run = (client, Functions, Requires) => {
    try {
      Functions.InitClient(client);
    } catch (err) {
      client.logger.error(`${err.stack == undefined ? err:err.stack}`);
    }
  }
