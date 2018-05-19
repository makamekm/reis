import * as React from 'react';
import { configure, shallow, mount } from 'enzyme';
import * as Adapter from 'enzyme-adapter-react-16';

import { Clickable } from '~/Components/Clickable';

describe("<Clickable/>", () => {
  configure({ adapter: new Adapter() });

  it("Render", () => {
    const wrapper = shallow(
      <Clickable>Test</Clickable>
    );
    let btn = wrapper.children();
  
    expect(btn.text()).toBe("Test");
  });

  it("Classes", () => {
    const wrapper = shallow(
      <Clickable className="test">Test</Clickable>
    );

    expect(wrapper.hasClass("test")).toBeTruthy();
  });

  it("Click", () => {
    let clicked = false;

    const wrapper = mount(
      <Clickable id="test" onClick={e => {
        clicked = true;
      }}>Test</Clickable>
    );

    wrapper.simulate("click");
    wrapper.update();
  
    expect(clicked).toBeTruthy();

    wrapper.unmount();
  });
});