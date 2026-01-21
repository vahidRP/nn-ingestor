import { Express } from 'express';
import * as fs from 'node:fs';
import spdy, { ServerOptions } from 'spdy';

const port: string = process.env.PORT ?? '9001';

const createServer = (app: Express) => {
  const options: ServerOptions = {
    cert: fs.readFileSync('certs/localhost.crt'),
    key: fs.readFileSync('certs/localhost.key'),
  };

  const server = spdy.createServer(options, app);

  server.listen(port, () => {
    console.log('Listening on port: ' + port + '.');
  });

  process.on('SIGTERM', () => {
    server.close(() => process.exit(0));
  });
};

export default createServer;
