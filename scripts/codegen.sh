# registry
npx apollo client:codegen \
  --config registry.config.js \
  --target=typescript \
  --tagName=gql  \
  --useReadOnlyTypes \
  --passthroughCustomScalars \
  --customScalarsPrefix=GraphQL_ \
  --outputFlat src/__generated__/registry

# leaderboard
npx apollo client:codegen \
  --config leaderboard.config.js \
  --target=typescript \
  --tagName=gql \
  --useReadOnlyTypes \
  --passthroughCustomScalars \
  --globalTypesFile src/__generated__/leaderboard/globalTypes.d.ts \
  --customScalarsPrefix=GraphQL_ --outputFlat src/__generated__/leaderboard