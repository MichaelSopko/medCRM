import ApolloClient from 'apollo-client';

const createApolloClient = (networkInterface) => {
  const params = {
    dataIdFromObject: (result) => {
      if (result.id && result.__typename) { // eslint-disable-line no-underscore-dangle
        return result.__typename + result.id; // eslint-disable-line no-underscore-dangle
      }
      return null;
    },
    networkInterface,
  };

  return new ApolloClient(params);
};

export default createApolloClient;
