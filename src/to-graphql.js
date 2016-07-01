export default (gql, schema) => {
  return new gql.GraphQLSchema({
    query: new gql.GraphQLObjectType({
      name: 'query',
      fields: {
        dummy: {
          type: gql.GraphQLInt
        }
      }
    })
  })
}
