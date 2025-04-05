<script setup></script>
<template>
  <div class="card">
    <div class="font-semibold text-xl mb-4">Đợt giảm giá</div>
    <DataTable>
      <template #header>
        <div class="flex justify-between">
          <Button type="button" icon="pi pi-filter-slash" label="Clear" outlined />
          <div class="flex">
            <Button icon="pi pi-plus" class="mr-2" severity="secondary" text />
            <Button icon="pi pi-print" class="mr-2" severity="secondary" text />
            <Button icon="pi pi-upload" class="mr-2" severity="secondary" text />
            <IconField>
              <InputIcon>
                <i class="pi pi-search" />
              </InputIcon>
              <InputText placeholder="Keyword Search" />
            </IconField>
          </div>
        </div>
      </template>
    </DataTable>
  </div>
</template>
