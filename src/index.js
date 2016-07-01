import invariant from 'invariant'

export class DomainType {
  constructor(spec) {
    invariant(spec && spec.name, 'a domain type needs a name')
  }
}

