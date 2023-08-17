// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from 'react';
import { BsChatLeftDots } from 'react-icons/bs';
import NewCard from '@components/NewCard';
import { IGetLatestTopics, useForumApis } from '@hooks/useForumApis';
import { Spinner, Typography } from '@subql/components';
import { renderAsync } from '@subql/react-hooks';
import { parseError } from '@utils';
import { Skeleton } from 'antd';
import Link from 'antd/es/typography/Link';
import moment from 'moment';

export const ForumCard = () => {
  const forumApis = useForumApis();
  const [topics, setTopics] = useState<IGetLatestTopics['topic_list']['topics']>([]);

  const getTopics = async () => {
    const res = await forumApis.getLatestApi();

    setTopics(res.slice(0, 5));
  };

  useEffect(() => {
    getTopics();
  }, []);

  return renderAsync(
    {
      loading: !!!topics.length,
      data: !topics.length ? undefined : topics,
    },
    {
      loading: () => <Skeleton active paragraph={{ rows: 14 }} style={{ marginTop: 30 }}></Skeleton>,
      error: (e) => <>{parseError(e)}</>,
      data: (topics) => {
        return (
          <NewCard
            title={
              <Typography style={{ display: 'flex', alignItems: 'flex-end' }}>
                Forum
                <BsChatLeftDots style={{ fontSize: 20, color: 'var(--sq-blue600)', marginLeft: 10 }}></BsChatLeftDots>
              </Typography>
            }
            width={302}
            style={{ marginTop: 24 }}
          >
            <div className="col-flex">
              {topics.map((topic) => {
                return (
                  <Link
                    key={topic.slug}
                    href={`${import.meta.env.VITE_FORUM_DOMAIN}/t/${topic.slug}`}
                    className="col-flex"
                    style={{ marginBottom: 16 }}
                  >
                    <Typography variant="medium" style={{ marginBottom: 0 }}>
                      {topic.title}
                    </Typography>
                    <Typography variant="small" type="secondary" style={{ marginTop: 8, marginBottom: 0 }}>
                      {moment(topic.last_posted_at).utc(true).fromNow()}
                    </Typography>
                  </Link>
                );
              })}
              <Link href="https://forum.subquery.network/c/kepler-network/16">View Forum</Link>
            </div>
          </NewCard>
        );
      },
    },
  );
};
