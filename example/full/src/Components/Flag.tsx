import * as React from 'react';

export function Flag(props: {
    name: string
    className?: string
    style?: any
    onClick?: any
}) {
    return <span className={"flag-icon flag-icon-" + props.name + ' ' + (props.className || '')} style={props.style} onClick={props.onClick}/>
}