require('babel-polyfill')
import expect from 'expect'
import * as domain from '../src'
import * as graphql from 'graphql'

global.expect = expect
global.domain = domain
global.graphql = graphql
