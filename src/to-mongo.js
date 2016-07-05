import pluralize from 'pluralize'

function collectionNameOf(domainType) {
  return pluralize(domainType.name)
}

class MongoCursorWrapper {
  constructor(params) {
    this.params = params
  }
  fetch() {
    return new Promise((resolve, reject) => {
      this.params.mongo.then(db => {
        const collName = collectionNameOf(this.params.domainType)
        const coll = db.collection(collName)
        coll.find.apply(coll, this.params.findArguments).toArray((err, docs) => {
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
      const collName = collectionNameOf(this.domainType)
      const coll = db.collection(collName)
      return coll.insert.apply(coll, args)
    }).then(result => {
      return result
    })
  }
}

export const connectToMongo = (mongo, schema) => () => new Proxy({}, {
  get: function(target, name) {
    return new MongoTypeWrapper(mongo, schema.types[name])
  }
})
