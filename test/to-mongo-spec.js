import { MongoClient } from 'mongodb'

describe('to mongo', () => {

  const [ t1, t2 ] = fixtures.twoCyclicTypes()

  const schema = new domain.DomainSchema({ types: [ t1, t2] })

  it('allows to connect a schema to mongo', (done) => {

    const connected = domain.connectToMongo(mongo, schema)
    const newT2 = { someIntField: 42 }
    schema.validate('t2', newT2).then(() => {
      console.log('validated t2', newT2)
      connected().t2.insert(newT2).then(result => {
        console.log('inserted t2', newT2)
        console.log('inserted t2, result', result)
        connected().t2.find({}).fetch().
          then(t2s => { console.log(t2s); done() }).
          catch(e => console.log(e))
      }).catch(err => console.log(err))
    })
  })

})
