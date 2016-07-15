import invariant from 'invariant'
import camelcase from 'camelcase'
import { Spec } from './common'

export const mapHasManyFromSpec = (typeName, spec) => {
  const result = {}
  Object.entries(spec || {}).forEach(([ k, v ]) => {
    if (typeof v === 'function') {
      v = v()
    }
    const name = k
    invariant(name, `no name for 'hasMany' entry in ${ typeName }`)

    invariant(v, `no value for hasMany.${ name } in ${ typeName }`)
    let type = v.type ? v.type : v
    if (typeof type === 'function') {
      type = type()
    }
    const foreignKey = v.foreignKey || `${ camelcase(typeName) }Id`
    invariant(type, `invalid type for foreign key ${ foreignKey } in type ${ typeName }`)
    result[name] = { type: type, foreignKey }
  })
  console.log('mapHasManyFromSpec, result', result)
  return result
}

export const hasManyToGraphQLFields = (domainType, graphql, gqlTypes) => {
  const result = Object.entries(domainType[Spec].hasMany || {}).map(([name, spec]) => {
    const referencedType = spec.type
    console.log('referencedType.name', name, spec, referencedType.name)
    invariant(gqlTypes[referencedType.name], `referenced type ${ referencedType.name } not found for "hasMany" ${ name }.`)
    const graphQLSpec = { type: new graphql.GraphQLList(gqlTypes[referencedType.name]) }
    return { name: name, spec: graphQLSpec }
  }).reduce((memo, e) => { memo[e.name] = e.spec; return memo }, {})
  return result
}
