import * as React from 'react';
import { configure, shallow, mount } from 'enzyme';
import * as Adapter from 'enzyme-adapter-react-16';

import { Modal, Consumer } from '../../../Components/Modal';

describe("<Modal/>", () => {
  configure({ adapter: new Adapter() });

  it("Render", async () => {
    let value = 'test';

    const wrapper = mount(
      <Modal testing>
        <div id="test">
          Test
        </div>
      </Modal>
    );

    const modal = $(document).find('.modal-container');
    const element = modal.find('#test');

    expect(modal.length).toBe(1);
    expect(modal.hasClass('show')).toBeTruthy();
    expect(element.length).toBe(1);
    wrapper.unmount();
  });

  it("Open & Close", async () => {
    const wrapper = mount(
      <Modal content={
        <Consumer>
          {modal => 
            <div id="testElement" onClick={e => modal.open()}>
              Test
            </div>
          }
        </Consumer>}>
        Test
      </Modal>
    );

    let modal = $(document).find('.modal-container');
    const element = wrapper.find('#testElement');

    expect(modal.length).toBe(0);

    element.simulate('click');

    await new Promise(r => setTimeout(r, 500));

    modal = $(document).find('.modal-container');

    expect(modal.length).toBe(1);
    expect(modal.hasClass('show')).toBeTruthy();
    wrapper.unmount();

    await new Promise(r => setTimeout(r, 500));
  
    modal = $(document).find('.modal-container');

    expect(modal.length).toBe(0);
  });
});