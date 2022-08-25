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

# leaderboard nest backend
npx apollo client:codegen \
  --config leaderboard.config.js \
  --target=typescript \
  --tagName=gql \
  --useReadOnlyTypes \
  --passthroughCustomScalars \
  --globalTypesFile src/__generated__/leaderboard/globalTypes.d.ts \
  --customScalarsPrefix=GraphQL_ --outputFlat src/__generated__/leaderboard


# leaderboard season 3 
npx apollo client:codegen \
  --config season3.config.js \
  --target=typescript \
  --tagName=gql \
  --useReadOnlyTypes \
  --passthroughCustomScalars \
  --globalTypesFile src/__generated__/leaderboard-season3/globalTypes.d.ts \
  --customScalarsPrefix=GraphQL_ --outputFlat src/__generated__/leaderboard-season3
