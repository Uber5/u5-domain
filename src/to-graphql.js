export const typeToGraphQLType = (type, gql, schema) => {
  console.log('type.fields', type.fields)
  return new gql.GraphQLObjectType({
    name: type.name,
    fields: { bla: { type: gql.GraphQLString } } // TODO: fake
  })
}

export default (gql, schema) => {
  return (schema && schema.types || []).map(t => {
    return typeToGraphQLType(t, gql, schema)
  })
}
