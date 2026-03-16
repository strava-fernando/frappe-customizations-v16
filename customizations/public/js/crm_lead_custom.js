// // Render button conditionally based on related CRM Tasks count
// frappe.ui.form.on("CRM Lead", {
//     onload(frm) {
// 		load_tasks(frm);
//     },
// 	refresh(frm) {
// 		load_tasks(frm);
//     }
// });
//
// function load_tasks(frm) {
// 		// Only run if the button hasn't been added yet
// 		// Custom buttons
// 		frm.add_custom_button('Approve', () => {
// 			frappe.msgprint(__("Successfully sent!"));
// 		}).addClass('btn-primary');
// 		frm.add_custom_button('Reject', () => {
// 			frappe.msgprint(__("Successfully sent!"));
// 		})
//
// 		frm.add_custom_button(__("Approve"), function () {
//
// 			frappe.call({
// 				method: "customizations.api.crm_lead.send_to_external_system",
// 				args: {
// 					lead_name: frm.doc.name
// 				},
// 				freeze: true,
// 				freeze_message: __("Processing..."),
// 				callback: function(r) {
// 					if (!r.exc) {
// 						frappe.msgprint(__("Successfully sent!"));
// 					}
// 				}
// 			});
//
// 		}, __("DO something"));
//
//         if (!frm.custom_button_added) {
//
//             // Get count of CRM Tasks related to this lead
//             frappe.call({
//                 method: "frappe.client.get_count",
//                 args: {
//                     doctype: "CRM Task",
//                     filters: {
//                         reference_doctype: "CRM Lead",
//                         reference_docname: frm.doc.name
//                     }
//                 },
//                 callback: function(r) {
//                     let task_count = r.message || 0;
//
//                     // Only add button if there's at least one task
//                     if (task_count > 0) {
//                         frm.add_custom_button(__("Approve"), function () {
//
//                             frappe.call({
//                                 method: "customizations.api.crm_lead.send_to_external_system",
//                                 args: {
//                                     lead_name: frm.doc.name
//                                 },
//                                 freeze: true,
//                                 freeze_message: __("Processing..."),
//                                 callback: function(r) {
//                                     if (!r.exc) {
//                                         frappe.msgprint(__("Successfully sent!"));
//                                     }
//                                 }
//                             });
//
//                         }, __("Actions"));
//                     }
//                 }
//             });
//
//             frm.custom_button_added = true;
//         }
// }


frappe.ui.form.on("CRM Lead", {
  refresh(frm) {
    load_crm_tasks(frm);
	load_custom_vue(frm);
  }
});

function load_crm_tasks(frm) {
	if (frappe.model.can_write('CRM Lead')) {
		frm.add_custom_button('Approve', () => {
			frappe.msgprint(__("Successfully sent!"));
		});
	}

  frappe.call({
    method: "frappe.client.get_list",
    args: {
      doctype: "CRM Task",
      filters: {
        reference_doctype: "CRM Lead",
        reference_docname: frm.doc.name
      },
      fields: ["name", "title", "status", "priority"],
      order_by: "modified desc"
    },
    callback: function(r) {

      // Add button at top
      let html = `
        <div style="margin-bottom: 10px; display: flex; justify-content: flex-end;">
		  <button class="btn btn-primary btn-sm" id="create-crm-task-btn">
			+ New Task
		  </button>
		</div>
      `;

      if (!r.message.length) {
        html += "<p>No tasks found</p>";
        frm.fields_dict.custom_task_items.$wrapper.html(html);
      } else {

        html += `<table class="table table-bordered">
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Priority</th>
            </tr>
          </thead>
          <tbody>`;

        r.message.forEach(task => {
          html += `
            <tr data-name="${task.name}" style="cursor:pointer;">
              <td>${task.title}</td>
              <td>${task.status}</td>
              <td>${task.priority}</td>
            </tr>
          `;
        });

        html += `</tbody></table>`;

        frm.fields_dict.custom_task_items.$wrapper.html(html);
      }

      // Button click event
      frm.fields_dict.custom_task_items.$wrapper
        .find("#create-crm-task-btn")
        .on("click", function() {

          frappe.new_doc("CRM Task", {
            reference_doctype: "CRM Lead",
            reference_docname: frm.doc.name
          });

        });

      // Row click event
      frm.fields_dict.custom_task_items.$wrapper
        .find("tr[data-name]")
        .on("click", function() {

          let name = $(this).data("name");
          frappe.set_route("Form", "CRM Task", name);

        });

    }
  });
}

frappe.ui.form.on("CRM Lead", {
    refresh(frm) {
        if (!frappe.user.has_role("System Manager")) {
			// Details Tab
            frm.set_df_property("organization", "hidden", 1);
            frm.set_df_property("website", "hidden", 1);
            frm.set_df_property("territory", "hidden", 1);
            frm.set_df_property("industry", "hidden", 1);
            frm.set_df_property("job_title", "hidden", 1);
            frm.set_df_property("source", "hidden", 1);

			// Person tab
            frm.set_df_property("salutation", "hidden", 1);
            frm.set_df_property("first_name", "hidden", 1);
            frm.set_df_property("last_name", "hidden", 1);
            frm.set_df_property("email", "hidden", 1);
            frm.set_df_property("mobile_no", "hidden", 1);

			// Others Tab
			frm.set_df_property("naming_series", "hidden", 1);
            frm.set_df_property("lead_name", "hidden", 1);
            frm.set_df_property("middle_name", "hidden", 1);
            frm.set_df_property("gender", "hidden", 1);
            frm.set_df_property("no_of_employees", "hidden", 1);
            frm.set_df_property("annual_revenue", "hidden", 1);
            frm.set_df_property("image", "hidden", 1);
            frm.set_df_property("phone", "hidden", 1);
            frm.set_df_property("converted", "hidden", 1);
            frm.set_df_property("status", "hidden", 1);

			// SLA Tab
			frm.set_df_property("sla", "hidden", 1);
            frm.set_df_property("sla_creation", "hidden", 1);
            frm.set_df_property("sla_status", "hidden", 1);
            frm.set_df_property("communication_status", "hidden", 1);
            frm.set_df_property("rolling_responses", "hidden", 1);

			// Syncing Tab
			frm.set_df_property("facebook_lead_id", "hidden", 1);
			frm.set_df_property("facebook_form_id", "hidden", 1);
        }
    }
});

function load_custom_vue(frm) {
	const $wrapper = frm.fields_dict.custom_html.$wrapper;

	// Clear any previous mount and create a fresh container
	$wrapper.empty();
	$wrapper.append('<div id="crm-task-vue-root"></div>');
	$wrapper.append('<div id="crm-task-vue-data-table"></div>');

	// Require the bundle then mount the Vue Table component
	frappe.require('table.bundle.js', function() {
		frappe.ui.setup_vue($wrapper.find('#crm-task-vue-root'));
	});
	frappe.require(['frappe-data-table.bundle.js'], function() {
		frappe.ui.setup_frappe_data_table($wrapper.find('#crm-task-vue-data-table'));
	});
}
