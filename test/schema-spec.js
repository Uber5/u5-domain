describe('schema', () => {
  it('can have cyclic type references', () => {
    const schema = new domain.DomainSchema({ types: fixtures.twoCyclicTypes() })
    console.log('schema.types', schema.types)
    Object.values(schema.types).forEach(t => expect(t instanceof domain.DomainType).toBeTruthy())
  })

})
