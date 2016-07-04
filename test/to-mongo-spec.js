import { MongoClient } from 'mongodb'

describe('to mongo', () => {

  const [ t1, t2 ] = fixtures.twoCyclicTypes()

  const schema = new domain.DomainSchema({ types: [ t1, t2] })

  it('allows to connect a schema to mongo', (done) => {

    const mongo = new Promise((resolve, reject) => {
      const url = process.env.MONGO_URL || 'mongodb://localhost/u5-domain-test'
      console.log('should connect to', url)
      MongoClient.connect(url, (err, database) => {
        console.log('connected to mongo', url, err)
        if (err) { 
          console.log('error while connecting to ' + url, err)
          return reject(err)
        }
        console.log('connected to ' + url)
        return resolve(database)
      })
    })

    class MongoCursorWrapper {
      constructor(params) {
        this.params = params
      }
      fetch() {
        return new Promise((resolve, reject) => {
          this.params.mongo.then(db => {
            const collName = this.params.domainType.name
            const coll = db.collection(collName)
            coll.find.apply(coll, this.params.findArguments).toArray((err, docs) => {
              console.log('should have done query', collName, this.params.findArguments, docs)
              if (err) return reject(err);
              resolve(docs)
            })
          })
        })
      }
    }

    class MongoTypeWrapper {
      constructor(mongo, domainType) {
        this.mongo = mongo
        this.domainType = domainType
      }
      find() {
        const [ mongo, domainType ] = [ this.mongo, this.domainType ]
        return new MongoCursorWrapper({ mongo, domainType, findArguments: arguments })
      }
      insert() {
        const args = Array.from(arguments)
        return this.mongo.then(db => {
          const collName = this.domainType.name
          const coll = db.collection(collName)
          /* args.push((err, result) => {
            console.log('MongoTypeWrapper insert', err, result)
            if (err) return reject(err);
            resolve(result)
          }) */
          return coll.insert.apply(coll, args)
        }).then(result => {
          console.log('MongoTypeWrapper insert', result)
          return result
        }) 
      }
    }

    const connectToMongo = (mongo, schema) => () => new Proxy({}, {
      get: function(target, name) {
        console.log('connectToMongo, get', target, name, schema)
        return new MongoTypeWrapper(mongo, schema.types[name])
      }
    })

    const connected = /* domain. */connectToMongo(mongo, schema)
    const newT2 = { someIntField: 42 }
    connected().t2.insert(newT2).then(result => {
      console.log('inserted t2', newT2)
      console.log('inserted t2, result', result)
      connected().t2.find({}).fetch().
        then(t2s => { console.log(t2s); done() }).
        catch(e => console.log(e))
    })
  })

})
