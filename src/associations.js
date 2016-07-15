import invariant from 'invariant'

export const mapHasManyFromSpec = (typeName, spec) => {
  const result = {}
  Object.entries(spec || {}).forEach(([ k, v ]) => {
    if (typeof v === 'function') {
      v = v()
    }
    const name = k
    invariant(name, `no name for 'hasMany' entry in ${ typeName }`)

    invariant(v, `no value for hasMany.${ name } in ${ typeName }`)
    let type = v.type ? v.type : v
    if (typeof type === 'function') {
      type = type()
    }
    const foreignKey = v.foreignKey || `${ typeName }Id`
    invariant(type, `invalid type for foreign key ${ foreignKey } in type ${ typeName }`)
    result[name] = { type: type, foreignKey }
  })
  return result
}
