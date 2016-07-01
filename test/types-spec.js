
describe('types', () => {

  const myType = new domain.DomainType({ name: 'MyType' })

  const withUnknownPropertyInSpec = () => new domain.DomainType({
    name: 'WithUnknownProp',
    x: 42
  })

  const withFields = () => new domain.DomainType({
    name: 'WithFields',
    fields: {
      field1: domain.DomainString,
      field2: 'String',
      field3: { type: domain.DomainString },
      field4: { type: 'String' }
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
    expect(withFields).toNotThrow()
    expect(withInvalidFields).toThrow()
  })

  it('can have relationships', () => {
  })

  it('rejects unknown properties in the spec', () => {
    expect(withUnknownPropertyInSpec).toThrow(/invalid properties: x/)
  })

})
