
describe('types', () => {
  const myDomain = new domain.DomainType({ name: 'MyDomain' })
  it('require a name', () => {
    expect(() => myDomain).toNotThrow()
    expect(() => new domain.DomainType({})).toThrow(/needs a name/)
  })
})
