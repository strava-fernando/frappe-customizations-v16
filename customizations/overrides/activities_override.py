import frappe
import copy
from frappe.desk.form.load import getdoc as original_get_doc

@frappe.whitelist()
def customize_get_doc(doctype, name):

	if not (doctype and name):
		raise Exception("doctype and name required!")

	docs_to_customize = ["CRM Lead", "CRM Deal"]

	# Default behavior for other doctypes
	if doctype not in docs_to_customize:
		original_get_doc(doctype, name)
		return frappe.response

	# Step 1: Load main Lead/Deal
	original_get_doc(doctype, name)

	# Make a deep copy of main response
	main_response = copy.deepcopy(frappe.response)

	frappe.log_error(f"Main response for {doctype} {name}: {main_response}", "Activities Override - Main Response")

	# Step 2: Get linked tasks
	linked_tasks = frappe.get_all(
		"CRM Task",
		filters={
			"reference_doctype": doctype,
			"reference_docname": name
		},
		fields=["name"]
	)

	# Step 3: Merge task activities into main response
	for task in linked_tasks:

		# Load task doc (this overwrites frappe.response)
		original_get_doc("CRM Task", task.name)

		task_response = frappe.response

		# Merge timeline fields
		merge_docinfo(main_response["docinfo"], task_response["docinfo"])

		# Merge user info
		main_response["docinfo"]["user_info"].update(
			task_response["docinfo"].get("user_info", {})
		)

		# Merge link titles
		if "_link_titles" in task_response:
			if "_link_titles" not in main_response:
				main_response["_link_titles"] = {}
			main_response["_link_titles"].update(task_response["_link_titles"])

	frappe.log_error(f"Main response for {doctype} {name}: {main_response}",
					 "Activities Override 2 - Main Response")

	# Restore merged response
	frappe.response = main_response

	return frappe.response


def merge_docinfo(main_docinfo, task_docinfo):

	fields_to_merge = [
		"comments",
		"assignment_logs",
		"attachment_logs",
		"info_logs",
		"like_logs",
		"workflow_logs",
		"communications",
		"automated_messages",
		"versions",
		"assignments",
		"views",
		"milestones"
	]

	for field in fields_to_merge:

		if field not in main_docinfo:
			main_docinfo[field] = []

		main_docinfo[field].extend(
			task_docinfo.get(field, [])
		)
