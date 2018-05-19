import * as React from 'react';
import { configure, shallow, mount } from 'enzyme';
import * as Adapter from 'enzyme-adapter-react-16';

import { Popup } from '~/Components/Popup';

describe("<Popup/>", () => {
  configure({ adapter: new Adapter() });

  it("Render", async () => {
    let value = 'test';

    const wrapper = mount(
      <Popup testing element={popup => <div id="test" ref={r => popup.ref(r)}>Test</div>}>
        {value}
      </Popup>
    );

    const popup = $(document).find('.popup');
    const element = wrapper.find('#test');

    expect(popup.length).toBe(1);
    expect(popup.hasClass('show')).toBeTruthy();
    expect(element.length).toBe(1);
    wrapper.unmount();
  });

  it("Open & Close", async () => {
    let value = 'test';

    const wrapper = mount(
      <Popup element={popup => <div id="test" ref={r => popup.ref(r)} onClick={e => popup.open()}>Test</div>}>
        {value}
      </Popup>
    );

    let popup = $(document).find('.popup');
    const element = wrapper.find('#test');

    expect(popup.length).toBe(0);

    element.simulate('click');

    await new Promise(r => setTimeout(r, 500));

    popup = $(document).find('.popup');

    expect(popup.length).toBe(1);
    expect(popup.hasClass('show')).toBeTruthy();
    wrapper.unmount();

    await new Promise(r => setTimeout(r, 500));
  
    popup = $(document).find('.popup');

    expect(popup.length).toBe(0);
  });
});