
describe('toGraphQLSchema', () => {
  const domainSchema = new domain.DomainSchema({ types: [] })
  it('produces a schema', () => {
    const graphqlSchema = domain.toGraphQLSchema(graphql, domainSchema)
    expect(graphqlSchema).toBeA(graphql.GraphQLSchema)
  })
})
