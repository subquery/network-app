import { gql, useLazyQuery } from '@apollo/client';
import { TOP_100_INDEXERS } from '@containers/QueryApolloProvider';
import { useWhyDidYouUpdate } from 'ahooks';

import { useAsyncMemo } from './useAsyncMemo';

const useIndexerGeoInformation = (indexers: string[]) => {
  const [fetchGeoInformation] = useLazyQuery<{
    geoips: {
      indexer: string;
      country?: {
        names?: {
          en?: string;
        };
      };
      city?: {
        names?: {
          en?: string;
        };
      };
      location?: {
        latitude?: number;
        longitude?: number;
      };
    }[];
  }>(gql`
    query GetGeoInformation($indexers: [String!]!) {
      geoips(indexers: $indexers) {
        indexer
        country {
          names {
            en
          }
        }
        city {
          names {
            en
          }
        }
        location {
          latitude
          longitude
        }
      }
    }
  `);

  const geoInfo = useAsyncMemo(async () => {
    const res = await fetchGeoInformation({
      context: {
        clientName: TOP_100_INDEXERS,
      },
      variables: { indexers },
    });

    return res?.data?.geoips;
  }, [indexers]);

  return geoInfo;
};

export default useIndexerGeoInformation;
