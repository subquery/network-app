# registry
npx apollo client:codegen \
  --config registry.config.js \
  --target=typescript \
  --tagName=gql  \
  --useReadOnlyTypes \
  --passthroughCustomScalars \
  --customScalarsPrefix=GraphQL_ \
  --outputFlat src/__generated__/registry

# swap exchange
npx apollo client:codegen \
  --config swapExchange.config.js \
  --target=typescript \
  --tagName=gql \
  --useReadOnlyTypes \
  --passthroughCustomScalars \
  --globalTypesFile src/__generated__/swapExchange/globalTypes.d.ts \
  --customScalarsPrefix=GraphQL_ --outputFlat src/__generated__/swapExchange


# excellent indexers exchange
npx apollo client:codegen \
  --config excellentIndexers.config.js \
  --target=typescript \
  --tagName=gql \
  --useReadOnlyTypes \
  --passthroughCustomScalars \
  --globalTypesFile src/__generated__/excellentIndexers/globalTypes.d.ts \
  --customScalarsPrefix=GraphQL_ --outputFlat src/__generated__/excellentIndexers