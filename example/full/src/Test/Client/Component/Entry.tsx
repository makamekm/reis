import * as React from 'react';
import { shallow } from 'enzyme';

import { Button } from '~/Components/Button';

describe("<Button/>", async () => {
  it("Render", async () => {
    let clicked = false;
    const wrapper = shallow(
      <Button>Test</Button>
    );
    expect(wrapper.text).toBe("Test");
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