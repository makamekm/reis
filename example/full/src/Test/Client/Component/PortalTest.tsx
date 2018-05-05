import * as React from 'react';
import { configure, shallow, mount } from 'enzyme';
import * as Adapter from 'enzyme-adapter-react-16';

import { Portal } from '~/Components/Portal';

// describe("<Portal/>", () => {
//   configure({ adapter: new Adapter() });

//   it("Render", async () => {
//     let value = 'test';

//     const wrapper = mount(
//       <Portal testing>
//         {value}
//       </Portal>
//     );

//     const popup = $(document).find('.popup.select');

//     expect(popup.length).toBe(1);
//     expect(popup.hasClass('show')).toBeTruthy();
//     wrapper.unmount();
//   });

//   it("Data Loading => Item Click", async () => {
//     let value = '';
//     let resolveInit;
//     let waitInit = new Promise(r => resolveInit = r);

//     const wrapper = mount(
//       <Portal testing>
//         <div id="data-value-test">{value}</div>
//       </Portal>
//     );

//     const popup = $(document).find('.popup.select');

//     expect(popup.find('.item.loading').length).toBe(1);

//     await waitInit;

//     let input = wrapper.find('input');
//     let inputEl: any = input.get(0);
//     let item = popup.find('#test');

//     item.trigger('click');    

//     expect(value).toBe('test');
//     expect(popup.length).toBe(1);
//     expect(popup.hasClass('show')).toBeTruthy();
//     wrapper.unmount();
//   });
// });