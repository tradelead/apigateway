const { ApolloServer } = require('apollo-server-lambda');
const mergeSchemas = require('./mergeSchemas');

const serverHandlerPromise = (async () => {
  console.log('Create Schema');
  const schema = await mergeSchemas(JSON.parse(process.env.GRAPHQL_URIS));
  const server = new ApolloServer({ schema });
  return server.createHandler();
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
