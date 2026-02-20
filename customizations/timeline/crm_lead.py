import frappe
import json


def get_task_timeline(doctype, docname):

	timeline = []

	tasks = frappe.get_all(
		"CRM Task",
		filters={
			"reference_doctype": doctype,
			"reference_docname": docname
		},
		fields=["name", "creation", "owner", "title"]
	)

	task_names = [t.name for t in tasks]

	versions = frappe.get_all(
		"Version",
		filters={
			"ref_doctype": "CRM Task",
			"docname": ["in", task_names]
		},
		fields=["name", "owner", "creation", "data", "docname"],
		order_by="creation desc",  # IMPORTANT
	)

	# reconstruct original titles
	original_titles = {t.name: t.title for t in tasks}

	for version in versions:

		data = json.loads(version.data)

		for change in data.get("changed", []):

			field, old, new = change

			if field == "title":

				# reverse apply change
				if original_titles.get(version.docname) == new:
					original_titles[version.docname] = old

	# Task created entries
	for task in tasks:

		timeline.append({
			"creation": task.creation,
			"owner": task.owner,
			"content": f"Task created: {original_titles.get(task.name, task.title)}",
			"doctype": "CRM Task",
			"name": task.name,
		})

	# Task updates
	for version in versions:

		data = json.loads(version.data)

		content = format_version_content(data)

		timeline.append({
			"creation": version.creation,
			"owner": version.owner,
			"content": f"Task updated: {content}",
			"doctype": "CRM Task",
			"name": version.docname,
		})

	return timeline


def format_version_content(data):

	changes = []

	for change in data.get("changed", []):
		field, old, new = change
		changes.append(f"{field}: {old} → {new}")

	return ", ".join(changes) if changes else "Updated"
