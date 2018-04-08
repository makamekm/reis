import * as React from 'react';

export class Img extends React.Component<{
    className?: string
    url?: string
    file?: File
    src?: string
    disabled?: boolean
    onClick?(e?: React.MouseEvent<HTMLImageElement>): Promise<void>
}, {
    url: string
}> {
    state = {
        url: '',
        file: null,
        src: ''
    }

    loading: boolean = false

    componentWillReceiveProps(nextProps) {
        if (nextProps.file !== this.state.file || nextProps.url !== this.state.url) {
            this.state.url = nextProps.url;
            this.state.file = nextProps.file;
            this.update();
        }
    }

    componentDidMount() {
        this.state.url = this.props.url;
        this.update();
    }

    async update() {
        this.loading = true;
        this.forceUpdate();
        let self = this;

        let src = null;

        if (this.state.file) src = await new Promise<string>(r => {
            let reader = new FileReader();
            reader.onload = (e) => {
                r((e.target as any).result);
            }
            reader.readAsDataURL(this.state.file as any);
        });
        else if (this.state.url) src = await new Promise<string>(r => {
            let newImg = new Image;
            newImg.onload = function() {
                r((this as HTMLImageElement).src);
            }
            newImg.src = this.state.url;
        });

        this.loading = false;
        this.state.src = src || this.props.src;
        this.forceUpdate();
    }

    render() {
        return (
            <img className={(this.props.className || '') + (this.loading ? ' loading' : '') + (this.props.disabled ? ' disabled' : '')} src={this.state.src} tabIndex={this.props.onClick && 0} onClick={async e => {
                if (!this.loading && !this.props.disabled) {
                    this.loading = true;
                    this.forceUpdate();
                    if (this.props.onClick) await this.props.onClick(e);
                    this.loading = false;
                    this.forceUpdate();
                }
            }}/>
        )
    }
}