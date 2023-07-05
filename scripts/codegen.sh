# registry
npx apollo client:codegen \
  --config registry.config.js \
  --target=typescript \
  --tagName=gql  \
  --useReadOnlyTypes \
  --passthroughCustomScalars \
  --customScalarsPrefix=GraphQL_ \
  --outputFlat src/__generated__/registry