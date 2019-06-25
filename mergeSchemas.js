const { introspectSchema, makeRemoteExecutableSchema, mergeSchemas } = require('graphql-tools');
const { createHttpLink } = require('apollo-link-http');
const fetch = require('node-fetch');

const remoteSchema = async (uri) => {
  const link = createHttpLink({
    uri,
    fetch,
  });

  const schema = await introspectSchema(link);

  return makeRemoteExecutableSchema({
    schema,
    link,
  });
};

module.exports = async (graphQLAPIUrls) => {
  const schemas = await Promise.all(graphQLAPIUrls.map(uri => remoteSchema(uri)));
  return mergeSchemas({ schemas });
};
