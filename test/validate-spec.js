describe('custom validation', () => {
  const typeWithValidation = new domain.DomainType({
    name: 'withValidation',
    fields: {
      'email': {
        type: domain.DomainString,
        schema: { pattern: /\S+@\S+\.\S+/ }
      }
    }
  })
  const schemaWithValidationOnField = new domain.DomainSchema({ types: [ typeWithValidation ] })
  it('validates field with "schema"', done => {
    const type = schemaWithValidationOnField.types.withValidation
    type.validate({ email: 'bla@test.com' })
    .then(valid => {
      expect(valid.errors.length).toEqual(0)
      type.validate({ email: 'this is not an email address' })
      .then(valid => {
        expect(valid.errors.length).toEqual(3)
        console.log('error message', valid.errors[2])
        done()
      })
    })
  })
})
