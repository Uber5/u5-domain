require('babel-polyfill')
import expect from 'expect'
import * as domain from '../src'
import * as graphql from 'graphql'

global.expect = expect
global.domain = domain
global.graphql = graphql

const twoCyclicTypes = () => {
  const [ t1, t2 ] = [
    new domain.DomainType({
      name: 't1',
      fields: {
        'someT2': () => t2,
        'someScalarField': domain.DomainString,
        'someIntField': domain.DomainInt,
        'someIDField': domain.DomainID
      }
    }),
    new domain.DomainType({
      name: 't2',
      fields: { 'someT1': () => t1 }
    }),
  ]
  return [ t1, t2 ]
}

const schemaWithCyclicTypes = () => new domain.DomainSchema({ types: twoCyclicTypes() })

global.fixtures = { twoCyclicTypes, schemaWithCyclicTypes }

import { MongoClient } from 'mongodb'

const defaultMongoUrl = 'mongodb://localhost/u5-domain-test'

global.mongo = new Promise((resolve, reject) => {
  const url = process.env.MONGO_URL || defaultMongoUrl
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

