import * as ApolloLinkWS from "apollo-link-ws";
import * as ApolloLink from "apollo-link";
import { BatchHttpLink } from 'apollo-link-batch-http';
import * as graphql from 'graphql';
import { createUploadLink } from 'apollo-upload-client'

import { Hook } from '../Modules/ClientHook';
import * as Upload from '../Client/Upload';

// TODO: Optimize client links creation
export function genLink(hooksRes: Hook[], context, linkWS?: ApolloLinkWS.WebSocketLink): ApolloLink.ApolloLink {
    if (linkWS === undefined && window) {
        const wsAddress = "ws://" + (window as any).__HOST__ + ":" + (window as any).__WSADDRESS__ + "/";
        linkWS = new ApolloLinkWS.WebSocketLink({
            uri: wsAddress,
            options: {
                reconnect: true,
                connectionParams: context
            }
        });
    }

    // const linkNetwork = new BatchHttpLink({
    //     uri: (window as any).__GQLHOST__ || `/graphql`,
    // });

    const linkNetwork = Upload.createUploadLink({
        uri: (window as any).__GQLHOST__ || `/graphql`,
    });

    const linkSplitted: ApolloLink.ApolloLink = linkWS ? ApolloLink.ApolloLink.split(
        operation => {
            const operationAST = graphql.getOperationAST(operation.query as any, operation.operationName);
            return !!operationAST && operationAST.operation === 'subscription';
        },
        linkWS,
        linkNetwork
    ) : linkNetwork;

    let links: ApolloLink.ApolloLink[] = [];

    hooksRes.forEach(hook => {
        if (hook.linksBefore) links = links.concat(hook.linksBefore);
    });

    links = links.concat(linkSplitted);

    hooksRes.forEach(hook => {
        if (hook.linksAfter) links = links.concat(hook.linksAfter);
    });

    let link = ApolloLink.ApolloLink.from(links);

    hooksRes.forEach(hook => {
        if (hook.linksWrap) link = hook.linksWrap.concat(link);
    });

    return link;
}