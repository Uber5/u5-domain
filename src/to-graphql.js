import invariant from 'invariant'

const typeToGraphQLScalar = (type, gql) => type.toGraphQLType(gql)

const fieldToGraphQLField = (field, gql, gqlTypes) => {
  if (field.type.isScalar) {
    return typeToGraphQLScalar(field.type, gql)
  } else {
    return typeToGraphQLType(field.type, gql, gqlTypes)
  }
}

const fieldsToGraphQLFields = (fields, gql, gqlTypes) => (fields || []).
  map(f => ({ name: f.name, type: fieldToGraphQLField(f, gql, gqlTypes) })).
  reduce((memo, f) => { memo[f.name] = { type: f.type }; return memo }, {})

const typeToGraphQLType = (type, gql, gqlTypes) => {
  if (!gqlTypes[type.name]) {
    let fields
    gqlTypes[type.name] = new gql.GraphQLObjectType({
      name: type.name,
      fields: () => fields // break recursion
    })
    console.log('fieldsToGraphQLFields, type.fields', type.fields.map(f => f.toString()).join(', '))
    fields = fieldsToGraphQLFields(type.fields, gql, gqlTypes)
    console.log('fieldsToGraphQLFields, fields', fields)
  }
  // console.log('typeToGraphQLType', type.name, gqlTypes)
  return gqlTypes[type.name]
}

export default (gql, schema) => {
  invariant(gql && gql.GraphQLSchema, "requires graphql instance as first argument")
  invariant(schema && schema.types, "requires object with 'types' as second argument")
  const graphQLTypes = {};
  (schema && Object.values(schema.types) || []).map(t => {
    return typeToGraphQLType(t, gql, graphQLTypes)
  })
  return graphQLTypes
}
