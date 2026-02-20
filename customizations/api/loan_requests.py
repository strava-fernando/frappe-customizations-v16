import frappe
from frappe.model.workflow import apply_workflow

@frappe.whitelist(allow_guest=True)
def create_loan_request():
	"""
	Entry point for the Loan Request Workflow.
	Creates a Lead, creates a linked CRM Task, and returns the ID.
	"""
	try:
		frappe.set_user("Administrator")  # TODO: Giving Administrator privileges to this API for demo purposes, remove later
		data = frappe.request.get_json()

		if not data:
			frappe.throw("Missing JSON payload")

		# Validating Mandatory Fields
		required_fields = ["group_id", "process_instance_id"]
		for field in required_fields:
			if field not in data:
				frappe.throw(f"Missing required field: {field}")

		sg_id = data.get("group_id")
		sg_number, sg_name = frappe.get_value("DL Saving Group", {"id": sg_id},["number", "sg_name"])

		# Have to add the processInstanceId after that is available as well
		new_lead = frappe.get_doc({
			"doctype": "CRM Lead",
			"first_name": sg_name, # Hard coded for now
			"lead_owner": "stravanskefernando24@gmail.com",
			"custom_saving_group": "n9qskebj1e", # Remember this is hard coded
			"custom_group_name": sg_name,
			"custom_group_number": sg_number,
			"custom_process_instance_id": data.get("process_instance_id")
		})

		new_lead.insert(ignore_permissions=True)

		frappe.db.commit()

		return {
			"status": "success",
			"message": "Loan Request Started",
			"lead_id": new_lead.name,
			"current_state": new_lead.status
		}

	except Exception as e:
		frappe.log_error(frappe.get_traceback(), "Loan Request API Error")
		return {"status": "error", "message": str(e)}
