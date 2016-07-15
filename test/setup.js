require('babel-polyfill')
import expect from 'expect'
import * as domain from '../src'
import * as graphql from 'graphql'

global.expect = expect
global.domain = domain
global.graphql = graphql

const withCyclicTypes = () => {
  const [ t1, t2, t1Detail ] = [
    new domain.DomainType({
      name: 't1',
      fields: {
        'someT2': () => t2,
        'someScalarField': domain.DomainString,
        'someIntField': domain.DomainInt,
        'someIDField': domain.DomainID
      },
      hasMany: {
        details: () => t1Detail,
        specialDetails: () => ({
          type: () => t1Detail,
          foreignKey: 'specialT1Id'
        })
      }
    }),
    new domain.DomainType({
      name: 't2',
      fields: {
        'someT1': () => t1,
        someIntField: domain.DomainInt
      }
    }),
    new domain.DomainType({
      name: 't1Detail',
      fields: {
        description: domain.DomainString
      },
    })
  ]
  return [ t1, t2, t1Detail ]
}

const schemaWithCyclicTypes = () => new domain.DomainSchema({ types: withCyclicTypes() })

global.fixtures = { withCyclicTypes, schemaWithCyclicTypes }

import { MongoClient } from 'mongodb'

const defaultMongoUrl = 'mongodb://localhost/u5-domain-test'

global.mongo = new Promise((resolve, reject) => {
  const url = process.env.MONGO_URL || defaultMongoUrl
  MongoClient.connect(url, (err, database) => {
    if (err) {
      console.log('error while connecting to ' + url, err)
      return reject(err)
    }
    console.log('connected to ' + url)
    return resolve(database)
  })
})

import { connect } from 'pow-mongodb-fixtures'

const t2S = [
  { }
]

connect(process.env.MONGO_URL || defaultMongoUrl).clearAllAndLoad({ t2S }, (err) => {
  if (err) throw err;
  mongo
  .then(() => run())
  .catch(err => { console.log(err); throw err })
})
