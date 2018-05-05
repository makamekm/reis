import * as React from 'react';
import { configure, shallow, mount } from 'enzyme';
import * as Adapter from 'enzyme-adapter-react-16';

import { PopupItem } from '~/Components/Popup';
import { InputSelect } from '~/Components/Input';

describe("<InputSelect/>", () => {
  configure({ adapter: new Adapter() });

  it("Render", async () => {
    let value = 'test';

    const wrapper = mount(
      <InputSelect testing linkValue={{
        get: () => value,
        set: v => value = v
      }} initOpen source={async val => ['test']} rows={data => data.map(name => <PopupItem key={name}>{name}</PopupItem>)}/>
    );

    const popup = $(document).find('.popup.select');
    let input = wrapper.find('input');
    let inputEl: any = input.get(0);

    expect(input.length).toBe(1);
    expect(inputEl.props.value).toBe('test');
    expect(popup.length).toBe(1);
    expect(popup.hasClass('show')).toBeTruthy();
    wrapper.unmount();
  });

  it("Change", async () => {
    let value = '';

    const wrapper = mount(
      <InputSelect testing linkValue={{
        get: () => value,
        set: v => value = v
      }} source={async val => ['test']} rows={data => data.map(name => <PopupItem key={name}>{name}</PopupItem>)}/>
    );

    const popup = $(document).find('.popup.select');
    let input = wrapper.find('input');
    let inputEl: any = input.get(0);

    await input.simulate('focus');
    await input.simulate('change', { target: { value: "test" } });
    await input.simulate('blur');

    expect(value).toBe('test');
    expect(popup.length).toBe(1);
    expect(popup.hasClass('show')).toBeTruthy();
    wrapper.unmount();
  });

  it("Data Loading => Item Click", async () => {
    let value = '';
    let resolveInit;
    let waitInit = new Promise(r => resolveInit = r);

    const wrapper = mount(
      <InputSelect testing init onInit={resolveInit} linkValue={{
        get: () => value,
        set: v => value = v
      }} source={async val => ['test']} rows={data => data.map(name => <PopupItem id={name} key={name} onClick={async () => value = name}>{name}</PopupItem>)}/>
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