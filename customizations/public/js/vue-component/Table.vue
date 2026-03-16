<script setup>
import { ref, onMounted } from 'vue';
import { useDocPerm } from './composables/useDocPerm';

const tasks = ref([]);
const loading = ref(false);
const error = ref(null);

// Reusable permission composable – provides canCreate, canWrite, canDelete, etc.
const { canCreate } = useDocPerm('CRM Task');

const columns = [
  { key: 'name',     label: 'ID' },
  { key: 'title',    label: 'Title' },
  { key: 'status',   label: 'Status' },
  { key: 'priority', label: 'Priority' },
];

const statusClass = (status) => {
  const map = {
    Open:        'badge-blue',
    Closed:      'badge-green',
    Cancelled:   'badge-red',
    'In Progress': 'badge-orange',
  };
  return map[status] ?? 'badge-gray';
};

const priorityClass = (priority) => {
  const map = {
    High:   'badge-red',
    Medium: 'badge-orange',
    Low:    'badge-gray',
  };
  return map[priority] ?? 'badge-gray';
};

const fetchTasks = () => {

  loading.value = true;
  error.value = null;

  frappe.call({
    method: 'frappe.client.get_list',
    args: {
      doctype: 'CRM Task',
      filters: {
        reference_doctype: 'CRM Lead',
      },
      fields: ['name', 'title', 'status', 'priority'],
      order_by: 'modified desc',
    },
    callback(r) {
      loading.value = false;
      if (r.exc) {
        error.value = 'Failed to load tasks.';
        return;
      }
      tasks.value = r.message ?? [];
    },
  });
};

const addCrmTask = () => {
  frappe.new_doc('CRM Task');
};

onMounted(fetchTasks);
</script>

<template>
  <div class="crm-task-table">
    <div class="table-header">
      <h5 class="table-title">CRM Tasks</h5>
      <div class="table-actions">
        <button
          v-if="canCreate"
          class="btn btn-xs btn-primary add-task-btn"
          @click="addCrmTask"
        >
          + Add CRM Task
        </button>
        <button class="btn btn-xs btn-default refresh-btn" @click="fetchTasks" :disabled="loading">
          <span v-if="loading">Loading…</span>
          <span v-else>↻ Refresh</span>
        </button>
      </div>
    </div>

    <div v-if="error" class="alert alert-danger">{{ error }}</div>

    <div v-else-if="loading && tasks.length === 0" class="loading-state">
      Loading tasks…
    </div>

    <div v-else-if="tasks.length === 0" class="empty-state">
      No tasks found.
    </div>

    <table v-else class="table table-bordered table-hover">
      <thead>
        <tr>
          <th v-for="col in columns" :key="col.key">{{ col.label }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="task in tasks" :key="task.name">
          <td>
            <a :href="`/app/crm-task/${task.name}`" target="_blank">
              {{ task.name }}
            </a>
          </td>
          <td>{{ task.title }}</td>
          <td>
            <span class="badge" :class="statusClass(task.status)">
              {{ task.status }}
            </span>
          </td>
          <td>
            <span class="badge" :class="priorityClass(task.priority)">
              {{ task.priority }}
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.crm-task-table {
  padding: 12px 0;
}

.table-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.table-title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
}

.refresh-btn {
  font-size: 12px;
}

.table-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.add-task-btn {
  font-size: 12px;
}

.loading-state,
.empty-state {
  text-align: center;
  color: var(--text-muted, #8d99a6);
  padding: 24px 0;
  font-size: 13px;
}

table {
  width: 100%;
  font-size: 13px;
}

thead th {
  background-color: var(--fg-color, #f4f5f6);
  font-weight: 600;
  white-space: nowrap;
}

.badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 500;
}

.badge-blue   { background: #d1ecf1; color: #0c5460; }
.badge-green  { background: #d4edda; color: #155724; }
.badge-red    { background: #f8d7da; color: #721c24; }
.badge-orange { background: #fff3cd; color: #856404; }
.badge-gray   { background: #e2e3e5; color: #383d41; }
</style>
