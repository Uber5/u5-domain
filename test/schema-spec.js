describe('schema', () => {
  it('can have cyclic type references', () => {
    const schema = new domain.DomainSchema({ types: fixtures.twoCyclicTypes() })
    schema.types.forEach(t => expect(t instanceof domain.DomainType).toBeTruthy())
  })

})
