const { introspectSchema, makeRemoteExecutableSchema, mergeSchemas } = require('graphql-tools');
const { createHttpLink } = require('apollo-link-http');
const { setContext } = require('apollo-link-context');
const fetch = require('node-fetch');

const remoteSchema = async (uri) => {
  let link = createHttpLink({
    uri,
    fetch,
  });

  link = setContext((request, previousContext) => {
    console.log(JSON.stringify({ previousContext }));
    return Object.assign({}, previousContext, {
      headers: {
        Authorization: (
          previousContext
          && previousContext.graphqlContext
          && previousContext.graphqlContext.headers.Authorization
        ),
      },
    });
  }).concat(link);

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
