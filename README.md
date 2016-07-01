# What?

The idea is to describe a domain (classes, their properties and relationships)
for a business application, so that other artefacts can be deduced from it.

This is probably not going to be a generic tool, but may be useful in our
context / on our stack.

The aspects we try to cover here:

- persistence
- API
- validation

# Example

Say, we want to use have orders and order items in our domain model. We may
describe the domain model as follows:

```
const orderType = new DomainType({
  name: 'Order',
  fields: {
    id: DomainID,
    orderedByName: { type: DomainString, required: true },
    orderedByEmail: {
      type: DomainString,
      validate: v => /\S+@\S+\.\S+/.test(v) // TODO: don't validate email addresses like this in real life
    }
    tipInCents: DomainInt
  },
  belongsTo: {
    shop: 'Shop'
  }
})

// TODO: complete the example

const domainSchema = new DomainSchema([ orderType, shopType ])
const graphQLOrderType = domain.toGraphQLSchema(domainSchema)

```
