require('babel-polyfill')

import invariant from 'invariant'
import toGraphQLTypes from './to-graphql'
import { connectToMongo } from './to-mongo'
import { Spec } from './common'
import { mapHasManyFromSpec } from './associations'
import { getValidatorForType, filterValidateResult } from './validate'

const mapFieldsFromSpec = spec => Object.keys(spec.fields || {}).map(name => new DomainField(name, spec.fields[name]))

export class ScalarType {
  constructor(name, mapGraphQLToType, jsonType) {
    this[Spec] = {
      name,
      mapGraphQLToType,
      jsonType
    }
  }
  get name() { return this[Spec].name }
  get [Symbol.getStringTag]() {
    return 'Scalar ' + this.name
  }
  isScalar() { return true }
  toGraphQLType(gql) { return this[Spec].mapGraphQLToType(gql) }
  createPropertyValidator() { return { type: this[Spec].jsonType } }
}

export const DomainString = new ScalarType('String', gql => gql.GraphQLString, 'string')
export const DomainInt = new ScalarType('Int', gql => gql.GraphQLInt, 'int')
export const DomainID = new ScalarType('ID', gql => gql.GraphQLID, 'any')

export const domainScalarTypes = [ DomainString, DomainInt, DomainID ]

const mapStringToType = domainScalarTypes.reduce((memo, t) => { memo[t.name] = t; return memo }, {})

export const isScalarType = t => domainScalarTypes.includes(t)

// higher order function
const doesNotAppearIn = (whiteList) => o => Object.keys(o).
  map(prop => whiteList.includes(prop) ? null : prop).
  filter(prop => prop)

const invalidTypeProperties = doesNotAppearIn([ 'name', 'fields', 'hasMany' ])

export class DomainField {
  constructor(name, spec) {
    invariant(name && spec, 'DomainField needs a name and a spec')
    const normalized = this[Spec] = {}
    normalized.name = name
    if (isScalarType(spec) || spec instanceof DomainType || typeof spec === 'function') {
      normalized.type = spec
    } else if (mapStringToType[spec]) {
      normalized.type = mapStringToType[spec]
    } else if (mapStringToType[spec.type]) {
      normalized.type = mapStringToType[spec.type]
    } else if (spec.type instanceof ScalarType || spec.type instanceof DomainType) {
      normalized.type = spec.type
    } else if (typeof spec.type === 'function') {
      normalized.type = spec.type
    } else {
      throw new Error(`Unable to determine type for field ${ name }`)
    }
    if (spec.schema) {
      normalized.schema = spec.schema
    }
  }
  toString() { return `DomainField[${ this.name }, type=${ this.type }]`}
  get name() { return this[Spec].name }
  get type() { const t = this[Spec].type; return typeof t === 'function' ? t() : t }
  createPropertyValidator() {
    invariant(
      typeof this.type.createPropertyValidator === 'function',
      `type ${ this.name } has no createPropertyValidator function.`
    )
    let validator = this.type.createPropertyValidator()
    const spec = this[Spec]
    if (spec.schema) {
      validator = {
        allOf: [
          validator,
          spec.schema
        ]
      }
    }
    return validator
  }
}

export class DomainType {
  constructor(spec) {

    invariant(spec && spec.name, 'a domain type needs a name')
    this[Spec] = { name: spec.name }

    const invalidProps = invalidTypeProperties(spec)
    invariant(!invalidProps.length, `DomainType ${ spec.name } has invalid properties: ${ invalidProps }`)
    this[Spec].fields = mapFieldsFromSpec(spec)
    this[Spec].fields.push(new DomainField("_id", DomainID))

    this[Spec].rawHasMany = spec.hasMany
  }
  get fields() { return this[Spec].fields }
  get name() { return this[Spec].name }
  createPropertyValidator() {
    return { '$ref': `/domain/${ this[Spec].name }` }
  }
  validate(instance) {
    if (!this.validator) {
      this.validator = getValidatorForType(this.schema, this)
    }
    const validator = this.validator
    console.log('validator', validator.schemas.u5Domain)
    Object.entries(validator.schemas).forEach(([ name, schema ]) => console.log(`  schema ${ name }:`, schema))
    console.log('VALIDATING', instance)
    const result = validator.validate(instance, validator.schemas.u5Domain)
    return Promise.resolve(filterValidateResult(result))

  }
}

const initialiseAssociations = type => {
  type[Spec].hasMany = mapHasManyFromSpec(type[Spec].name, type[Spec].rawHasMany)
}

export class DomainSchema {
  constructor(spec) {
    this[Spec] = { types: spec.types || [] }
    this[Spec].types.forEach(type => initialiseAssociations(type))
    this[Spec].types.forEach(type => {
      invariant(!type.schema, `Type ${ type.name } is used in a schema already`)
      type.schema = this
    })
  }
  get types() {
    return this[Spec].types.reduce((memo, t) => { memo[t.name] = t; return memo }, {})
  }
  // TODO: we probably don't want this, validate
  // via MongoTypeWrapper#validate rather
  validate(typeName, object) {
    const t = this[Spec].types[typeName]
    return Promise.resolve() // TODO: fake
  }
}

export { toGraphQLTypes, connectToMongo }
