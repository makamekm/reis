import * as React from 'react';
import { configure, shallow, mount } from 'enzyme';
// import jasmineEnzyme from 'jasmine-enzyme';
import * as Adapter from 'enzyme-adapter-react-16';

import { PopupItem } from '~/Components/Popup';
import { Input, InputSelect, Select } from '~/Components/Input';

describe("<Input/>", () => {
  configure({ adapter: new Adapter() });

  it("Render", async () => {
    let value = 'test';

    const wrapper = shallow(
      <Input linkValue={{
        get: () => value,
        set: v => value = v
      }}/>
    );

    let input = wrapper.find('input');
    let inputEl: any = input.get(0);

    await wrapper.update();
  
    expect(input.length).toBe(1);
    expect(inputEl.props.value).toBe('test');
  });

  it("Change", async () => {
    let value = '';

    const wrapper = shallow(
      <Input linkValue={{
        get: () => value,
        set: v => value = v
      }}/>
    );

    let input = wrapper.find('input');

    await input.simulate('focus');
    await input.simulate('change', { target: { value: "test" } });
    await input.simulate('blur');

    expect(value).toBe('test');
  });
});

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

  it("Change Text", async () => {
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
});