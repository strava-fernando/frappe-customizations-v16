import { createApp } from 'vue';
import Table from './Table.vue';

// Mount the CRM Task table inside `wrapper`.
// Pass `docname` (the CRM Lead name) so the component can filter tasks.
function setup_vue(wrapper, docname) {
  // Accept a jQuery object or a raw DOM element
  const el = wrapper instanceof HTMLElement ? wrapper : wrapper[0];
  const app = createApp(Table, { docname });
  app.mount(el);
  return app;
}

frappe.ui.setup_vue = setup_vue;
export default setup_vue;
