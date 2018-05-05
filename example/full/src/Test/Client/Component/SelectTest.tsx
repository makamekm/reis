import * as React from 'react';
import { configure, shallow, mount } from 'enzyme';
import * as Adapter from 'enzyme-adapter-react-16';

import { PopupItem } from '~/Components/Popup';
import { Select } from '~/Components/Input';

describe("<Select/>", () => {
  configure({ adapter: new Adapter() });

  it("Render", async () => {
    let value = 'test';

    const wrapper = mount(
      <Select testing initOpen source={async val => ['test']} rows={data => data.map(name => <PopupItem key={name}>{name}</PopupItem>)}>
        {value}
      </Select>
    );

    const popup = $(document).find('.popup.select');

    expect(popup.length).toBe(1);
    expect(popup.hasClass('show')).toBeTruthy();
    wrapper.unmount();
  });

  it("Data Loading => Item Click", async () => {
    let value = '';
    let resolveInit;
    let waitInit = new Promise(r => resolveInit = r);

    const wrapper = mount(
      <Select testing init onInit={resolveInit} source={async val => ['test']} rows={data => data.map(name => <PopupItem id={name} key={name} onClick={async () => value = name}>{name}</PopupItem>)}>
        <div id="data-value-test">{value}</div>
      </Select>
    );

    const popup = $(document).find('.popup.select');

    expect(popup.find('.item.loading').length).toBe(1);

    await waitInit;

    let input = wrapper.find('input');
    let inputEl: any = input.get(0);
    let item = popup.find('#test');

    item.trigger('click');    

    expect(value).toBe('test');
    expect(popup.length).toBe(1);
    expect(popup.hasClass('show')).toBeTruthy();
    wrapper.unmount();
  });
});