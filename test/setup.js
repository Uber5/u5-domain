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
      fields: { 'someT2': () => t2 }
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
