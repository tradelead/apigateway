const { ApolloServer } = require('apollo-server-lambda');
const mergeSchemas = require('./mergeSchemas');

const serverHandlerPromise = (async () => {
  console.log('Create Schema');
  const schema = await mergeSchemas(JSON.parse(process.env.GRAPHQL_URIS));
  const server = new ApolloServer({ schema });
  const handlerArgs = {};

  if (process.env.CORS_ORIGIN) {
    handlerArgs.cors = {
      origin: process.env.CORS_ORIGIN,
      methods: 'POST',
      allowedHeaders: [
        'Content-Type',
        'Origin',
        'Accept',
        'Authorization',
      ],
    };
    console.log(process.env.CORS_ORIGIN, handlerArgs);
  }

  return server.createHandler(handlerArgs);
})();

exports.handler = (...args) => {
  (async () => {
    try {
      const serverHandler = await serverHandlerPromise;
      console.log('Retrieved Apollo Server Handler');
      serverHandler(...args);
    } catch (e) {
      console.error(e);
    }
  })();
};
