import * as React from 'react';
import { configure, shallow } from 'enzyme';
// import jasmineEnzyme from 'jasmine-enzyme';
import * as Adapter from 'enzyme-adapter-react-16';

import { Input, InputSelect, Select, SelectItem } from '~/Components/Input';

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
    const wrapper = shallow(
      <InputSelect linkValue={{
        get: () => value,
        set: v => value = v
      }} source={async val => ['test']} rows={data => data.map(name => <SelectItem>{name}</SelectItem>)}/>
    );
    let input = wrapper.find('input');
    let inputEl: any = input.get(0);

    await wrapper.update();
  
    expect(input.length).toBe(1);
    expect(inputEl.props.value).toBe('test');
  });

  it("Change Text", async () => {
    let value = '';
    const wrapper = shallow(
      <InputSelect linkValue={{
        get: () => value,
        set: v => value = v
      }} source={async val => ['test']} rows={data => data.map(name => <SelectItem>{name}</SelectItem>)}/>
    );
    let input = wrapper.find('input');
    let inputEl: any = input.get(0);

    await input.simulate('focus');
    await input.simulate('change', { target: { value: "test" } });
    await input.simulate('blur');

    expect(value).toBe('test');
  });
});