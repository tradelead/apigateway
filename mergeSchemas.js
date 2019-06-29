const { introspectSchema, makeRemoteExecutableSchema, mergeSchemas } = require('graphql-tools');
const { createHttpLink } = require('apollo-link-http');
const { setContext } = require('apollo-link-context');
const { onError } = require('apollo-link-error');
const { ApolloLink } = require('apollo-link');
const fetch = require('node-fetch');

const remoteSchema = async (uri) => {
  const contextLink = setContext((request, previousContext) => (
    Object.assign({}, previousContext, {
      headers: {
        Authorization: (
          previousContext
          && previousContext.graphqlContext
          && previousContext.graphqlContext.headers.Authorization
        ),
      },
    })
  ));

  const remoteErrorLink = onError(({ graphQLErrors }) => {
    if (graphQLErrors) {
      graphQLErrors.forEach((val) => {
        Object.setPrototypeOf(val, Error.prototype);
      });
    }
  });

  const httpLink = createHttpLink({
    uri,
    fetch,
  });

  const link = ApolloLink.from([
    contextLink,
    remoteErrorLink,
    httpLink,
  ]);

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
