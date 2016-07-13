import invariant from 'invariant'
const debug = require('debug')('u5-domain')

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
    fields = fieldsToGraphQLFields(type.fields, gql, gqlTypes)
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
  debug('graphql types:')
  Object.entries(graphQLTypes).forEach(([ key, value ]) => {
    debug('  ' + key, value)
  })
  return graphQLTypes
}
