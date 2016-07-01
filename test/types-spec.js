
describe('types', () => {

  const myType = new domain.DomainType({ name: 'MyType' })

  const withFields = () => new domain.DomainType({
    name: 'WithFields',
    fields: {
      field1: domain.DomainString,
      field2: 'String'
    }
  })

  const withInvalidFields = () => new domain.DomainType({
    name: 'WithInvalidFields',
    fields: {
      field1: 'invalidType'
    }
  })

  it('require a name', () => {
    expect(() => myType).toNotThrow()
    expect(() => new domain.DomainType({})).toThrow(/needs a name/)
  })

  it('can have fields', () => {
    withFields()
    expect(withFields).toNotThrow()
    expect(withInvalidFields).toThrow()
  })

  it('can have relationships', () => {
  })

})
