import { Validator } from 'jsonschema'
import invariant from 'invariant'
import { Spec } from './common'

const createSchemaForDomainConstraints = (domainSchema, domainType) => {
  const schema = {
    type: 'object',
    properties: {
    },
    additionalProperties: false
  }

  // add properties
  domainType[Spec].fields.forEach(field => {
    const validator = field.createPropertyValidator()
    schema.properties[field.name] = validator
  })

  // add properties for 'hasMany' associations pointing at `domainType`
  // ...
  Object.entries(domainSchema.types).forEach(([ name, type ]) => {
    Object.entries(type[Spec].hasMany || {}).forEach(([ assocName, assocSpec ]) => {
      assocSpec = typeof assocSpec === 'function' ? assocSpec() : assocSpec
      console.log('assoc from', name, 'to', assocSpec, 'as', assocName)
      if (assocSpec.type === domainType) {
        console.log(`for validation of ${ domainType.name } we need to add ${ assocSpec.foreignKey }`)
        invariant(!schema.properties[assocSpec.foreignKey], `duplicate property ${ assocSpec.foreignKey } of type ${ domainType.name }`)
        schema.properties[assocSpec.foreignKey] = { type: 'any' } // TODO: may have to be more strict
      }
    })
  })
  return schema
}

export const getValidatorForType = (schema, domainType) => {
  const validator = new Validator()
  const schemas = []
  schemas.push(createSchemaForDomainConstraints(schema, domainType))
  // TODO: add validation declared for type
  validator.addSchema({ allOf: schemas }, 'u5Domain')
  return validator
}

export const filterValidateResult = f => f
