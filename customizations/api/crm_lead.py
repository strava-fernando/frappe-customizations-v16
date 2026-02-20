import frappe
from frappe import _

@frappe.whitelist()
def send_to_external_system(lead_name):
    if not frappe.has_permission("CRM Lead", "write", lead_name):
        frappe.throw(_("Not permitted"), frappe.PermissionError)

    lead = frappe.get_doc("CRM Lead", lead_name)

    # Your logic here
    # Example:
    frappe.logger().info(f"Lead {lead.name} triggered custom API")

    frappe.log_error("Hit", "This was a success... Keep grinding!!")

    return {"status": "success"}
