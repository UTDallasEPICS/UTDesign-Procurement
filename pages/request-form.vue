<template>
  <div class="max-w-3xl mx-auto space-y-6">
    <h1 class="text-2xl font-bold text-[#1A1A1A]">New Procurement Request</h1>

    <!-- Budget Display -->
    <BudgetDisplay
      v-if="selectedProject"
      :starting-budget="selectedProject.startingBudget"
      :used="selectedProject.totalExpenses + itemsTotal"
    />

    <form class="space-y-6 bg-white border border-[#D9D9D9] rounded-xl p-6" @submit.prevent="submit">
      <!-- Project -->
      <div>
        <label class="block text-sm font-medium mb-1">Project *</label>
        <USelect
          v-model="form.projectNum"
          :items="projectOptions"
          placeholder="Select your project..."
          value-key="value"
          label-key="label"
          required
        />
      </div>

      <!-- Date Needed -->
      <div>
        <label class="block text-sm font-medium mb-1">Date Needed *</label>
        <UInput v-model="form.dateNeeded" type="date" required />
      </div>

      <!-- Additional Info -->
      <div>
        <label class="block text-sm font-medium mb-1">Additional Information</label>
        <UTextarea v-model="form.additionalInfo" placeholder="Any additional context..." :rows="3" />
      </div>

      <!-- File Upload -->
      <div>
        <label class="block text-sm font-medium mb-1">Design Specifications (optional)</label>
        <DragAndDrop v-model="attachmentFile" accept=".pdf,.png,.jpg,.docx" label="PDF, image, or document" />
      </div>

      <!-- Items -->
      <div>
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-semibold text-[#1A1A1A]">Items</h3>
          <UButton size="sm" variant="outline" class="border-[#E87722] text-[#E87722]" @click="addItem">
            + Add Item
          </UButton>
        </div>

        <div class="space-y-4">
          <div
            v-for="(item, i) in form.items"
            :key="i"
            class="border border-[#D9D9D9] rounded-lg p-4 space-y-3 bg-[#F4F4F4]"
          >
            <div class="flex items-center justify-between">
              <span class="text-sm font-semibold text-[#5A5A5A]">Item {{ i + 1 }}</span>
              <button
                v-if="form.items.length > 1"
                type="button"
                class="text-red-500 text-xs hover:text-red-700"
                @click="removeItem(i)"
              >
                Remove
              </button>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div class="col-span-2">
                <UInput v-model="item.description" placeholder="Description *" required />
              </div>
              <UInput v-model="item.url" placeholder="URL *" required />
              <UInput v-model="item.partNumber" placeholder="Part Number *" required />
              <UInput v-model.number="item.quantity" type="number" min="1" placeholder="Qty *" required />
              <UInput v-model.number="item.unitPrice" type="number" step="0.01" min="0" placeholder="Unit Price * ($)" required />
            </div>
            <div>
              <label class="block text-xs text-[#5A5A5A] mb-1">Vendor *</label>
              <VendorSelect
                v-model="item.vendorID"
                @update:new-vendor="(v: { name: string; email: string; url: string }) => item.newVendor = v"
              />
            </div>
          </div>
        </div>

        <!-- Running Total -->
        <div class="mt-3 text-right text-sm font-semibold text-[#1A1A1A]">
          Items Total: <span class="text-[#E87722]">${{ itemsTotal.toFixed(2) }}</span>
        </div>
      </div>

      <!-- Error -->
      <div v-if="error" class="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
        {{ error }}
      </div>

      <div class="flex gap-3 justify-end">
        <UButton variant="ghost" @click="$router.back()">Cancel</UButton>
        <UButton
          type="submit"
          class="bg-[#154734] hover:bg-[#0f3326] text-white"
          :loading="submitting"
        >
          Submit Request
        </UButton>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { isStudent } = useAuth()
if (!isStudent.value) await navigateTo('/orders')

const { data: projects } = await useFetch<{ projectNum: string; projectTitle: string; startingBudget: number; totalExpenses: number }[]>(
  '/api/worksOn/currentProjects',
)

const projectOptions = computed(() =>
  (projects.value ?? []).map(p => ({
    label: `${p.projectNum} — ${p.projectTitle}`,
    value: p.projectNum,
  })),
)

const selectedProject = computed(() =>
  projects.value?.find(p => p.projectNum === form.projectNum) ?? null,
)

const form = reactive({
  projectNum: '',
  dateNeeded: '',
  additionalInfo: '',
  items: [newItem()],
})

const attachmentFile = ref<File | null>(null)
const submitting = ref(false)
const error = ref('')

function newItem() {
  return {
    description: '',
    url: '',
    partNumber: '',
    quantity: 1,
    unitPrice: 0,
    vendorID: undefined as number | string | undefined,
    newVendor: null as { name: string; email: string; url: string } | null,
  }
}

function addItem() { form.items.push(newItem()) }
function removeItem(i: number) { form.items.splice(i, 1) }

const itemsTotal = computed(() =>
  form.items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0),
)

async function submit() {
  error.value = ''
  if (!form.projectNum || !form.dateNeeded) {
    error.value = 'Project and date needed are required.'
    return
  }
  if (form.items.some(i => !i.description || !i.url || !i.partNumber || !i.vendorID)) {
    error.value = 'All item fields are required and a vendor must be selected.'
    return
  }

  submitting.value = true
  try {
    await $fetch('/api/request', {
      method: 'POST',
      body: {
        projectNum: form.projectNum,
        dateNeeded: form.dateNeeded,
        additionalInfo: form.additionalInfo,
        totalExpenses: itemsTotal.value,
        items: form.items.map(i => ({
          description: i.description,
          url: i.url,
          partNumber: i.partNumber,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          vendorID: i.vendorID !== '__new__' ? Number(i.vendorID) : null,
          newVendorName: i.vendorID === '__new__' ? i.newVendor?.name : undefined,
          newVendorEmail: i.vendorID === '__new__' ? i.newVendor?.email : undefined,
          newVendorURL: i.vendorID === '__new__' ? i.newVendor?.url : undefined,
        })),
      },
    })
    await navigateTo('/orders/student')
  } catch (e: any) {
    error.value = e?.data?.message ?? 'Submission failed. Please try again.'
  } finally {
    submitting.value = false
  }
}
</script>
