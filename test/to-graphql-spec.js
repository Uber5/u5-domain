
describe('toGraphQLSchema', () => {
  const emptySchema = new domain.DomainSchema({
    types: []
  })
  const schemaWithOneType = new domain.DomainSchema({
    types: [
      new domain.DomainType({
        name: 'EmptyType'
      })
    ]
  })
  it('produces a schema', () => {

    const emptyListOfGraphQLTypes = domain.toGraphQLTypes(graphql, emptySchema)
    expect(emptyListOfGraphQLTypes).toEqual([])

    const listOfOneGraphQLType = domain.toGraphQLTypes(graphql, schemaWithOneType)
    expect(listOfOneGraphQLType.length).toEqual(1)
    expect(listOfOneGraphQLType[0]).toBeA(graphql.GraphQLObjectType)

  })
})
