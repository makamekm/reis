import * as React from 'react';
import { configure, shallow } from 'enzyme';
// import jasmineEnzyme from 'jasmine-enzyme';
import * as Adapter from 'enzyme-adapter-react-16';

import { Button } from '~/Components/Button';

describe("<Button/>", async () => {
  beforeEach(() => {
    configure({ adapter: new Adapter() });
  });

  it("Render", async () => {
    const wrapper = shallow(
      <Button>Test</Button>
    );
    console.log($(wrapper.html()).text());
    expect($(wrapper.html()).text()).toBe("Test");
  });

  it("Classes", async () => {
    const wrapper = shallow(
      <Button className="test" size="xs" type="primary">Test</Button>
    );
    expect(wrapper.hasClass("test")).toBeTruthy();
    expect(wrapper.hasClass("btn-primary")).toBeTruthy();
    expect(wrapper.hasClass("btn-xs")).toBeTruthy();
  });

  it("Click", async () => {
    let clicked = false;
    const wrapper = shallow(
      <Button onClick={async e => {
        clicked = true;
      }}>Test</Button>
    );
    wrapper.simulate("click");
    expect(clicked).toBeTruthy();
  });
});