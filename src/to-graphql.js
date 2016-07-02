export const typeToGraphQLType = (type, gql, schema) => {
  return new gql.GraphQLObjectType({
    name: type.name
  })
}

export default (gql, schema) => {
  return (schema && schema.types || []).map(t => {
    return typeToGraphQLType(t, gql, schema)
  })
}
