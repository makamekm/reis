import * as React from 'react';

import { PopupItem } from './';
import { Popup, PopupScroll, PopupInput } from './';

export class PopupSelect extends React.Component<{
  children: React.ReactElement<any>
  className?: string
  disabled?: boolean
  init?: boolean
  initOpen?: boolean
  filter?: boolean
  source: (value: string) => Promise<any[]>
  rows: (data: any[], update?: Function) => any
  onKeyUpEnter?: (e) => void

  level?: number
}, {
  data: any[]
  value: string
}> {
  state = {
    data: [],
    value: ''
  }

  loading: boolean = false
  needToLoad: boolean = false
  mounted: boolean = false

  componentDidMount() {
    this.mounted = true;
    if (this.props.init) {
      this.update();
    }
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  async update() {
    if (this.mounted) {
      if (!this.loading) {
        this.loading = true;
        this.forceUpdate();
        let data = await this.props.source(this.state.value);
        if (this.mounted) {
          if (this.needToLoad) {
            this.loading = false;
            this.needToLoad = false;
            await this.update();
          }
          else {
            this.loading = false;
            this.state.data = data;
            this.forceUpdate();
          }
        }
      }
      else {
        this.needToLoad = true;
      }
    }
  }

  render() {
    const {
      className,
      disabled,
      init,
      initOpen,
      filter,
      source,
      rows,
      onKeyUpEnter,
      ...props
    } = this.props;
    
    let rowsRender = this.props.rows(this.state.data, this.update.bind(this));

    let content = <div className={"item"}>Nothing to show</div>;
    if (this.loading) content = <div className={"item loading"}>Loading...</div>;
    if (rowsRender && rowsRender.length > 0) content = rowsRender;

    return (
      <Popup {...props} type="select" position="bottom center" isHidden={this.props.disabled} element={this.props.children} openOnFocus openOnClick closeOnOutsideClick onShow={() => {
        if (this.props.initOpen) {
          this.update();
        }
      }}>
        {filter && <PopupInput help="Type to find" className={this.loading ? ' loading' : ''} placeholder="Search" value={this.state.value || ''} onChange={e => {
          this.state.value = e.target.value;
          this.forceUpdate();
          this.update();
        }}/>}
        <PopupScroll>
          {content}
        </PopupScroll>
      </Popup>
    )
  }
}