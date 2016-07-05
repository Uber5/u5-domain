import { MongoClient } from 'mongodb'

describe('to mongo', () => {

  const [ t1, t2 ] = fixtures.twoCyclicTypes()

  const schema = new domain.DomainSchema({ types: [ t1, t2] })
  const connected = domain.connectToMongo(mongo, schema)
  const t2Type = connected().t2

  it('allows to connect a schema to mongo, insert and find', (done) => {

    const newT2 = { someIntField: 42 }
    schema.validate('t2', newT2)
    .then(() => t2Type.insert(newT2))
    .then(result => t2Type.find({ someIntField: 42 }).fetch())
    .then(t2s => { console.log('t2s in mongo', t2s); expect(t2s.length).toEqual(1); done() })
    .catch(err => console.log(err))

  })

  it('allows updating documents', (done) => {
    const newT2 = { someIntField: 43 }
    t2Type.insert(newT2)
    .then(insertResult => t2Type.update({ _id: newT2._id }, { $set: { someScalarField: 'some text' } }))
    .then(updateResult => { expect(updateResult.result.nModified).toEqual(1) })
    .then(() => t2Type.find(newT2._id).fetch())
    .then(t2s => { console.log('t2, found after update', t2s); expect(t2s.length).toEqual(1); done()})
    .catch(err => console.log(err))
  })

})
