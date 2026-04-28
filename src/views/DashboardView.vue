<script setup>
</script>

<template>
  <div class="dashboard">
    <div class="dashboard-header glass-panel">
      <h1>Leva Dashboard</h1>
      <p>Workspace & Task Management</p>
    </div>
    
    <div class="dashboard-content">
      <div class="glass-panel task-list">
        <h3>Your Current Tasks</h3>
        <!-- To Do List here -->
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.dashboard-header {
  padding: 2rem;
  margin-bottom: 2rem;
  border-radius: 16px;
}

.dashboard-header h1 {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.dashboard-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

.task-list {
  padding: 2rem;
  min-height: 400px;
}
</style>
