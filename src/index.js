import invariant from 'invariant'

const mapFieldsFromSpec = spec => Object.keys(spec.fields || {}).map(name => new DomainField(name, spec.fields[name]))

export const DomainString = 'String'
export const DomainInt = 'Int'
export const DomainID = 'ID'

export const domainScalarTypes = [ DomainString, DomainInt, DomainID ]

const mapStringToType = domainScalarTypes.reduce((memo, t) => { memo[t] = t; return memo }, {})

export const isScalarType = t => domainScalarTypes.includes(t)

export class DomainField {
  constructor(name, spec) {
    invariant(name && spec, 'DomainField needs a name and a spec')
    this.spec = {}
    if (isScalarType(spec)) {
      this.spec.type = spec.type
    } else if (mapStringToType[spec.type]) {
      this.spec.type = mapStringToType[spec.type]
    } else {
      throw new Error(`Unable to determine type for field ${ name }`)
    }
  }
}

export class DomainType {
  constructor(spec) {
    invariant(spec && spec.name, 'a domain type needs a name')
    this.fields = mapFieldsFromSpec(spec)
  }
}

