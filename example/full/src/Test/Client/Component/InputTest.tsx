import * as React from 'react';
import { configure, shallow } from 'enzyme';
// import jasmineEnzyme from 'jasmine-enzyme';
import * as Adapter from 'enzyme-adapter-react-16';

import { Input } from '~/Components/Input';

async function simulateKeyPresses(wrapper, characters, ...args) {
  await wrapper.simulate('focus');
  await wrapper.simulate('change', { target: { value: characters } });
  // for(let i = 0; i < characters.length; i++) {
  //   wrapper.simulate('keyPress', {
  //     which: characters.charCodeAt(i),
  //     key: characters[i],
  //     keyCode: characters.charCodeAt(i),
  //     ...args
  //   });
  // }
  await wrapper.simulate('blur');
}

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
  
    await simulateKeyPresses(input, "test");

    expect(value).toBe('test');
  });
});