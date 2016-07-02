
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

  it('produces a schema', () => {

    const emptyListOfGraphQLTypes = domain.toGraphQLTypes(graphql, emptySchema)
    expect(emptyListOfGraphQLTypes).toEqual([])

    const listOfOneGraphQLType = domain.toGraphQLTypes(graphql, schemaWithOneType)
    expect(listOfOneGraphQLType.length).toEqual(1)
    expect(listOfOneGraphQLType[0]).toBeA(graphql.GraphQLObjectType)

  })

  it('allows cyclic types', () => {
    const graphQLTypes = graphQLTypesWithCycles()
    const graphQLSchema = new graphql.GraphQLSchema({
      query: new graphql.GraphQLObjectType({
        name: 'query',
        fields: {
          t1: { type: graphQLTypes[0] },
          t2: { type: graphQLTypes[1] }
        }
      })
    })
  })
})
