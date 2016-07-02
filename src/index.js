import invariant from 'invariant'
import toGraphQLTypes from './to-graphql'

const mapFieldsFromSpec = spec => Object.keys(spec.fields || {}).map(name => new DomainField(name, spec.fields[name]))

const Spec = Symbol('Spec')

export class ScalarType {
  constructor(name) {
    this[Spec] = {
      name
    }
  }
  get name() { return this[Spec].name }
  get [Symbol.getStringTag]() {
    return 'Scalar ' + this.name
  }
}

export const DomainString = new ScalarType('String')
export const DomainInt = new ScalarType('Int')
export const DomainID = new ScalarType('ID')

export const domainScalarTypes = [ DomainString, DomainInt, DomainID ]

const mapStringToType = domainScalarTypes.reduce((memo, t) => { memo[t.name] = t; return memo }, {})

export const isScalarType = t => domainScalarTypes.includes(t)

// higher order function
const doesNotAppearIn = (whiteList) => o => Object.keys(o).
  map(prop => whiteList.includes(prop) ? null : prop).
  filter(prop => prop)

const invalidTypeProperties = doesNotAppearIn([ 'name', 'fields' ])

export class DomainField {
  constructor(name, spec) {
    invariant(name && spec, 'DomainField needs a name and a spec')
    const normalized = this[Spec] = {}
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
  }
}

export class DomainType {
  constructor(spec) {

    invariant(spec && spec.name, 'a domain type needs a name')
    this[Spec] = { name: spec.name }

    const invalidProps = invalidTypeProperties(spec)
    invariant(!invalidProps.length, `DomainType ${ spec.name } has invalid properties: ${ invalidProps }`)
    this[Spec].fields = mapFieldsFromSpec(spec)

  }
  get name() { return this[Spec].name }
}

export class DomainSchema {
  constructor(spec) {
    this.types = spec.types || []
  }
}

export { toGraphQLTypes }
