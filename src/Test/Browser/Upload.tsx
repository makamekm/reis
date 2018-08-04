import * as React from 'react';
import { configure, shallow, mount } from 'enzyme';
import * as Adapter from 'enzyme-adapter-react-16';

import * as ApolloClient from 'apollo-client';
import { createApolloFetch } from 'apollo-fetch';
import * as ApolloCache from 'apollo-cache-inmemory';

require("fetch-everywhere");

import { genLink } from '../../Client/Link';
import { gql } from '../../Modules/Router';

describe("Upload", () => {
    configure({ adapter: new Adapter() });

    const config = JSON.parse(process.env.HOST_CONFIG);

    (window as any).__GQLHOST__ = `http://${config.host}:${config.port}/graphql`;

    it("Simple", async () => {
        let fileRaw = new File(["T"], 'test.txt');

        const gqlClient = new ApolloClient.ApolloClient({
            link: genLink([], {}, null),
            cache: new ApolloCache.InMemoryCache(),
            ssrMode: false,
            queryDeduplication: true
        });

        let res = await gqlClient.mutate({
            mutation: gql`
              mutation Upload($file: Upload!) {
                upload {
                  do(file: $file)
                }
              }`,
            variables: { file: fileRaw }
        });

        expect(true).toBeTruthy();
    });
});