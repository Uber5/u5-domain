import { MongoClient } from 'mongodb'

describe('to mongo', () => {

  const [ t1, t2, t1Detail ] = fixtures.twoCyclicTypes()

  const schema = new domain.DomainSchema({ types: [ t1, t2, t1Detail ] })
  const connected = domain.connectToMongo(mongo, schema)
  const t2Type = connected().t2
  const t1Type = connected().t1
  const t1DetailType = connected().t1Detail

  it('allows to connect a schema to mongo, insert and find', (done) => {

    const newT2 = { someIntField: 42 }
    t2Type.validate(newT2)
    .then(valid => expect(valid.errors.length).toEqual(0))
    .then(() => t2Type.insert(newT2))
    .then(result => t2Type.find({ someIntField: 42 }).fetch())
    .then(t2s => { /* console.log('t2s in mongo', t2s); */ expect(t2s.length).toEqual(1); done() })
    .catch(err => console.log(err))

  })

  it('allows updating documents', (done) => {
    const newT2 = { someIntField: 43 }
    t2Type.insert(newT2)
    .then(insertResult => t2Type.update({ _id: newT2._id }, { $set: { someScalarField: 'some text' } }))
    .then(updateResult => { expect(updateResult.result.nModified).toEqual(1) })
    .then(() => t2Type.find(newT2._id).fetch())
    .then(t2s => { /* console.log('t2, found after update', t2s); */ expect(t2s.length).toEqual(1); done()})
    .catch(err => console.log(err))
  })

  it('allows deleting documents', (done) => {
    const newT2 = { someIntField: 44 }
    t2Type.insert(newT2)
    .then(() => t2Type.find(newT2._id).fetch())
    .then(t2s => { expect(t2s.length).toEqual(1) })
    .then(() => t2Type.remove({ _id: newT2._id }))
    .then(deleteResult => { /*console.log('deleteResult', deleteResult); */ expect(deleteResult.result.n).toEqual(1) })
    .then(() => t2Type.find(newT2._id).fetch())
    .then(t2s => { /* console.log('t2, found after delete', t2s); */ expect(t2s.length).toEqual(0); done()})
    .catch(err => console.log(err))
  })

  describe('validation on nested type', () => {
    it('succeeds when nested type correctly mentioned', done => {
      const newT2 = { someIntField: 45, someT1: { someScalarField: 'some value' }}
      t2Type.validate(newT2)
      .then(valid => {
        console.log('with nested t2, validation result', valid)
        expect(valid.errors.length).toEqual(0)
        done()
      })
    })
    it('fails when referring to incorrect type / other value', done => {
      const newT2 = { someIntField: 47, someT1: 'not a t1'}
      t2Type.validate(newT2)
      .then(valid => {
        console.log('with nested t2, validation result', valid)
        expect(valid.errors.length).toEqual(2)
        done()
      })
    })
  })

  describe('"hasMany", "belongsTo", "hasOne"', () => {
    /**
     * Weird: We can do this without implementing anything specific for the 'hasMany' specifiction of t1
     * We may want to check though that t1Detail.t1Id is a valid property.
     * But how? The way we wrap the insert() function is generic. We could filter properties
     * in fetch() in to-mongo.js?
    */
    const t1 = { someScalarField: 99 }
    const t1Detail = { description: 'Some details...'}
    beforeEach(done => {
      t1Type.insert(t1).then(() => {
        t1Detail.t1Id = t1._id
        return t1DetailType.validate(t1Detail)
      })
      .then(validationResults => console.log('validationResults', validationResults))
      .then(() => t1DetailType.insert(t1Detail))
      .then(() => done())
      .catch(err => console.log('err', err))
    })
    it('allows to query via "hasMany"', done => {
      t1DetailType.find({ t1Id: t1._id }).fetch().then(details => {
        expect(details.length).toEqual(1)
        expect(details[0].description).toEqual('Some details...')
        done()
      })
    })
    it('allows hasOne (and maybe belongsTo)')
  })
})
