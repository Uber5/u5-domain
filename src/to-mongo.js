import invariant from 'invariant'
import camelcase from 'camelcase'
import pluralize from 'pluralize'

function collectionNameOf(domainType) {
  return pluralize(camelcase(domainType.name))
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

const wrapMongoCollectionFunction = function(domainType, functionName) {
  return function() {
    const args = arguments
    return this.mongo.then(db => {
      const collName = collectionNameOf(domainType)
      const collection = db.collection(collName)
      return collection[functionName].apply(collection, args)
    })
  }
}

class MongoTypeWrapper {
  constructor(mongo, schema, domainType) {
    this.mongo = mongo
    this.domainType = domainType
    this.schema = schema

    const functionsToBeWrapped = [ 'insert', 'update', 'remove' ]
    functionsToBeWrapped
    .map(fn => this[fn] = wrapMongoCollectionFunction(this.domainType, fn))

  }
  find() {
    const [ mongo, domainType ] = [ this.mongo, this.domainType ]
    return new MongoCursorWrapper({ mongo, domainType, findArguments: arguments })
  }
  validate(instance) {
    return this.domainType.validate(instance)
  }
}

export const connectToMongo = (mongo, schema) => () => new Proxy({}, {
  get: function(target, name) {
    invariant(mongo && mongo.then, '"mongo" must be a promise')
    invariant(schema.types[name], `invalid domain type ${ name }`)
    return new MongoTypeWrapper(mongo, schema, schema.types[name])
  }
})
