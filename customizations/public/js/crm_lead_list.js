frappe.listview_settings['CRM Lead'] = {

    get_indicator: function(doc) {
        if (doc.status === "Qualified") {
            return [__("Qualified"), "blue", "status,=,Qualified"];
        }
        return [__(doc.status), "gray", `status,=,${doc.status}`];
    }

};
