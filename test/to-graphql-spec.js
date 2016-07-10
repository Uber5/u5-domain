
describe('toGraphQLSchema', () => {
  const emptySchema = new domain.DomainSchema({
    types: []
  })
  const schemaWithOneType = new domain.DomainSchema({
    types: [
      new domain.DomainType({
        name: 'SomeType',
        fields: {
          someField: domain.DomainString
        }
      })
    ]
  })

  const graphQLTypesWithCycles = () => domain.toGraphQLTypes(graphql, fixtures.schemaWithCyclicTypes())

  it('fails on invalid parameters', () => {
    expect(() => domain.toGraphQLTypes({}, [])).toThrow(/requires graphql/)
    expect(() => domain.toGraphQLTypes(graphql, {})).toThrow(/requires object with 'types'/)
    expect(() => domain.toGraphQLTypes(graphql, { types: [] })).toNotThrow()
  })

  it('produces a schema', () => {

    const emptyListOfGraphQLTypes = domain.toGraphQLTypes(graphql, emptySchema)
    expect(emptyListOfGraphQLTypes).toEqual({})

    const graphQLTypes = domain.toGraphQLTypes(graphql, schemaWithOneType)
    expect(Object.keys(graphQLTypes).length).toEqual(1)
    expect(Object.values(graphQLTypes)[0]).toBeA(graphql.GraphQLObjectType)

  })

  it('allows cyclic types', () => {
    const graphQLTypes = graphQLTypesWithCycles()
    const graphQLSchema = new graphql.GraphQLSchema({
      query: new graphql.GraphQLObjectType({
        name: 'query',
        fields: {
          t1: { type: graphQLTypes.t1 },
          t2: { type: graphQLTypes.t2 }
        }
      })
    })
  })
})
