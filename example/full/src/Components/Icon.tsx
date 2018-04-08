import * as React from 'react';

export function Icon(props: {
    name: string
    className?: string
    style?: any
    onClick?: any
}) {
    return <span className={"fa fa-" + props.name + ' ' + (props.className || '')} style={props.style} onClick={props.onClick}/>
}