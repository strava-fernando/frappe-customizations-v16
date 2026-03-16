import { computed, unref } from 'vue';

/**
 * Vue 3 composable that wraps every Frappe Desk permission helper.
 *
 * Usage (doctype-level):
 *   const { canCreate, canWrite, canRead, canDelete } = useDocPerm('CRM Task');
 *
 * Usage (document-level – pass an existing doc object):
 *   const { canWrite, canSubmit } = useDocPerm('CRM Task', docRef);
 *
 * Every returned property is a computed ref so it stays reactive if
 * the doctype/doc argument is itself a ref.
 *
 * Internally this delegates to `frappe.model.can_*` (boot-level lists)
 * and `frappe.perm.has_perm` (role + doc-level evaluation) — the exact
 * same checks the Desk list view, form view, and tree view rely on.
 */
export function useDocPerm(doctype, doc) {
  // Allow both plain strings and Vue refs
  const dt = computed(() => unref(doctype));
  const d  = computed(() => unref(doc) ?? null);

  // ── Boot-level permission helpers (frappe.model.can_*) ───────────
  // These check `frappe.boot.user.can_*` lists populated server-side
  // during the Desk boot sequence based on the user's roles.

  const canCreate = computed(() => frappe.model.can_create(dt.value));
  const canRead   = computed(() => frappe.model.can_read(dt.value));
  const canWrite  = computed(() => frappe.model.can_write(dt.value));
  const canDelete = computed(() => frappe.model.can_delete(dt.value));
  const canSubmit = computed(() => frappe.model.can_submit(dt.value));
  const canCancel = computed(() => frappe.model.can_cancel(dt.value));
  const canImport = computed(() => frappe.model.can_import(dt.value));
  const canExport = computed(() => frappe.model.can_export(dt.value));
  const canPrint  = computed(() => frappe.boot.user.can_print.indexOf(dt.value) !== -1);
  const canEmail  = computed(() => frappe.boot.user.can_email.indexOf(dt.value) !== -1);
  const canSelect = computed(() => frappe.model.can_select(dt.value));
  const canReport = computed(() => frappe.model.can_get_report(dt.value));

  // ── Fine-grained perm (frappe.perm.has_perm) ────────────────────
  // When a `doc` is provided these evaluate ownership + user-perm
  // restrictions (same as the Form view). Without a doc they return
  // pure role-based doctype-level permissions.

  const hasPerm = (ptype, permlevel = 0) => {
    return computed(() => frappe.perm.has_perm(dt.value, permlevel, ptype, d.value));
  };

  // ── Convenience: role checks ─────────────────────────────────────
  const isAdmin = computed(() =>
    frappe.session.user === 'Administrator' ||
    (frappe.user_roles || []).includes('Administrator')
  );

  const hasRole = (role) => {
    return computed(() => (frappe.user_roles || []).includes(role));
  };

  return {
    // boot-level flags (most common – matches Desk list/base_list usage)
    canCreate,
    canRead,
    canWrite,
    canDelete,
    canSubmit,
    canCancel,
    canImport,
    canExport,
    canPrint,
    canEmail,
    canSelect,
    canReport,

    // low-level per-doc / per-permlevel check
    hasPerm,

    // role utilities
    isAdmin,
    hasRole,
  };
}


