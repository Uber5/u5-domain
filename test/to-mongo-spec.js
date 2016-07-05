import { MongoClient } from 'mongodb'

describe('to mongo', () => {

  const [ t1, t2 ] = fixtures.twoCyclicTypes()

  const schema = new domain.DomainSchema({ types: [ t1, t2] })

  it('allows to connect a schema to mongo', (done) => {

    const connected = domain.connectToMongo(mongo, schema)
    const t2Type = connected().t2
    const newT2 = { someIntField: 42 }
    schema.validate('t2', newT2)
    .then(() => t2Type.insert(newT2))
    .then(result => t2Type.find({}).fetch())
    .then(t2s => { console.log('t2s in mongo', t2s); done() })
    .catch(err => console.log(err))

  })

})
