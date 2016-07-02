describe('schema', () => {
  const cyclicTypes = () => {
    const [ t1, t2 ] = [
      new domain.DomainType({
        name: 't1',
        fields: { 't2': () => t2 }
      }),
      new domain.DomainType({
        name: 't2',
        fields: { 't1': () => t1 }
      }),
    ]
  }

  it('can have cyclic type references', () => {
    const schema = new domain.DomainSchema({ types: cyclicTypes() })
    console.log('types', schema.types)
    schema.types.forEach(t => expect(t instanceof domain.DomainType).toBeTruthy())
  })

})
