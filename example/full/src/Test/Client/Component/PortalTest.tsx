import * as React from 'react';
import { configure, shallow, mount } from 'enzyme';
import * as Adapter from 'enzyme-adapter-react-16';

import { Portal, Consumer } from '~/Components/Portal';

describe("<Portal/>", () => {
  configure({ adapter: new Adapter() });

  const node = document.createElement('div');
  document.body.appendChild(node);

  it("Render", async () => {
    let isOpen = false;
    let isCheckOpen = false;

    const wrapper = mount(
      <Portal testing isOpen={isOpen} element={<div id="inner-element">Test</div>} onOpen={() => isCheckOpen = true} onClose={() => isCheckOpen = false}>
        <div id="portal-test">test</div>
      </Portal>,
      { attachTo: node }
    );

    expect($(document).find('#portal-test').length).toBe(0);
    expect(isCheckOpen).toBeFalsy();
    expect($(node).find('#inner-element').length).toBe(1);

    isOpen = true;
    wrapper.setProps({ isOpen });

    expect($(document).find('#portal-test').length).toBe(1);
    expect(isCheckOpen).toBeTruthy();
    expect($(node).find('#inner-element').length).toBe(1);
    
    wrapper.unmount();

    expect($(document).find('#portal-test').length).toBe(0);
    expect(isCheckOpen).toBeFalsy();
    expect($(node).find('#inner-element').length).toBe(0);
  });

  it("isFocusable", async () => {
    let isOpen = false;

    const wrapper = mount(
      <Portal isFocusable testing isOpen={isOpen} element={<div id="inner-element" tabIndex={0}>Test</div>}>
        <div id="portal-test" tabIndex={0}>test</div>
      </Portal>,
      { attachTo: node }
    );

    expect($(document).find('#portal-test').length).toBe(0);
    expect($(node).find('#inner-element').length).toBe(1);
    expect($(node).find('#inner-element').attr('tabIndex')).toBe("0");

    isOpen = true;
    wrapper.setProps({ isOpen });

    expect($(document).find('#portal-test').length).toBe(1);
    expect($(node).find('#inner-element').length).toBe(1);
    expect($(node).find('#inner-element').attr('tabIndex')).toBe("-1");
    expect($(document).find('#portal-test').attr('tabIndex')).toBe("0");

    wrapper.unmount();

    expect($(document).find('#portal-test').length).toBe(0);
    expect($(node).find('#inner-element').length).toBe(0);
  });

  it("isFixedBody", async () => {
    let isOpen = false;

    const wrapper = mount(
      <Portal isFixedBody testing isOpen={isOpen}>
        <div tabIndex={0}>test</div>
      </Portal>,
      { attachTo: node }
    );

    expect(document.body.style.overflow).toBe('');

    isOpen = true;
    wrapper.setProps({ isOpen });

    expect(document.body.style.overflow).toBe("hidden");

    wrapper.unmount();

    expect(document.body.style.overflow).toBe('');
  });

  it("Context", async () => {
    let isOpen = false;

    let isActiveCheck;
    let nodeCheck;
    let isShow;

    const wrapper = mount(
      <Portal isFixedBody testing isOpen={isOpen}>
        <Consumer>{portal => {
            isActiveCheck = portal.isActive();
            nodeCheck = portal.getNode();
            isShow = portal.isShow();
            return <div tabIndex={0}>test</div>
        }}</Consumer>
      </Portal>,
      { attachTo: node }
    );

    expect(isActiveCheck).toBeFalsy();
    expect($(nodeCheck).length).toBe(0);
    expect(isShow).toBeFalsy();

    isOpen = true;
    wrapper.setProps({ isOpen });

    expect(isActiveCheck).toBeTruthy();
    expect($(nodeCheck).length).toBe(1);
    expect(isShow).toBeTruthy();

    wrapper.unmount();
  });
});