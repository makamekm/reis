import * as React from 'react';
import { configure, shallow, mount } from 'enzyme';
import * as Adapter from 'enzyme-adapter-react-16';

import { Notification } from '../../../Components/Notification';

describe("<Notification/>", () => {
  configure({ adapter: new Adapter() });

  it("Render", async () => {
    let value = 'test';
    let closed = false;

    const wrapper = mount(
      <Notification testing title="TestTitle" type="error" message="TestMessage" onClose={() => {
        closed = true;
      }} code="777"/>
    );

    const notification = $(document).find('.notification-container');

    expect(notification.length).toBe(1);
    expect(notification.hasClass('show')).toBeTruthy();
    expect(notification.attr('data-code')).toBe("777");
    expect(notification.html().indexOf("TestTitle")).toBeGreaterThanOrEqual(0);
    expect(notification.html().indexOf("TestMessage")).toBeGreaterThanOrEqual(0);
    wrapper.unmount();

    expect(closed).toBeTruthy();
  });
});