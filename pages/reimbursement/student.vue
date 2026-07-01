<template>
  <div class="max-w-3xl mx-auto space-y-6">
    <h1 class="text-2xl font-bold text-[#1A1A1A]">New Reimbursement Request</h1>

    <BudgetDisplay
      v-if="selectedProject"
      :starting-budget="selectedProject.startingBudget"
      :used="selectedProject.totalExpenses + receiptTotal"
    />

    <form class="space-y-6 bg-white border border-[#D9D9D9] rounded-xl p-6" @submit.prevent="submit">
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

      <div>
        <label class="block text-sm font-medium mb-1">Additional Information</label>
        <UTextarea v-model="form.additionalInfo" placeholder="Notes about this reimbursement..." :rows="3" />
      </div>

      <!-- Receipt Items -->
      <div>
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-semibold text-[#1A1A1A]">Receipts</h3>
          <UButton size="sm" variant="outline" class="border-[#E87722] text-[#E87722]" @click="addItem">
            + Add Receipt
          </UButton>
        </div>

        <div class="space-y-4">
          <div
            v-for="(item, i) in form.items"
            :key="i"
            class="border border-[#D9D9D9] rounded-lg p-4 space-y-3 bg-[#F4F4F4]"
          >
            <div class="flex items-center justify-between">
              <span class="text-sm font-semibold text-[#5A5A5A]">Receipt {{ i + 1 }}</span>
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
              <div>
                <label class="block text-xs text-[#5A5A5A] mb-1">Date of Purchase *</label>
                <UInput v-model="item.receiptDate" type="date" required />
              </div>
              <div>
                <label class="block text-xs text-[#5A5A5A] mb-1">Quantity *</label>
                <UInput v-model.number="item.quantity" type="number" min="1" required />
              </div>
              <div>
                <label class="block text-xs text-[#5A5A5A] mb-1">Unit Price ($) *</label>
                <UInput v-model.number="item.unitPrice" type="number" step="0.01" min="0" required />
              </div>
              <div>
                <label class="block text-xs text-[#5A5A5A] mb-1">Item URL (optional)</label>
                <UInput v-model="item.url" placeholder="https://..." />
              </div>
              <div class="col-span-2">
                <UInput v-model="item.description" placeholder="Description *" required />
              </div>
            </div>
            <div>
              <label class="block text-xs text-[#5A5A5A] mb-1">Category *</label>
              <USelect
                v-model="item.category"
                :items="categoryOptions"
                placeholder="Select category..."
                value-key="value"
                label-key="label"
              />
              <UInput
                v-if="item.category === 'Other'"
                v-model="item.otherCategoryDescription"
                class="mt-2"
                placeholder="Describe the category *"
              />
            </div>
            <div v-if="justificationRequired(item)">
              <label class="block text-xs text-[#5A5A5A] mb-1">Justification *</label>
              <UTextarea
                v-model="item.justification"
                placeholder="Required for Chemicals, Software, or items with a vendor quote/URL"
                :rows="2"
                class="w-full"
              />
            </div>
            <div>
              <label class="block text-xs text-[#5A5A5A] mb-1">Vendor *</label>
              <VendorSelect
                v-model="item.vendorID"
                @update:new-vendor="(v: { name: string; email: string; url: string }) => item.newVendor = v"
              />
            </div>
            <div>
              <label class="block text-xs text-[#5A5A5A] mb-1">Receipt Upload</label>
              <DragAndDrop v-model="item.file" accept=".pdf,.png,.jpg" label="Receipt scan or photo" />
            </div>
            <div class="text-right text-xs font-semibold text-[#5A5A5A]">
              Line total: ${{ (Number(item.quantity) * Number(item.unitPrice) || 0).toFixed(2) }}
            </div>
          </div>
        </div>

        <div class="mt-3 text-right text-sm font-semibold text-[#1A1A1A]">
          Total: <span class="text-[#E87722]">${{ receiptTotal.toFixed(2) }}</span>
        </div>
      </div>

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
          Submit Reimbursement
        </UButton>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ITEM_CATEGORIES, JUSTIFICATION_REQUIRED_CATEGORIES } from '~/shared/constants/categories'

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

const categoryOptions = ITEM_CATEGORIES.map(c => ({ label: c, value: c }))

const selectedProject = computed(() =>
  projects.value?.find(p => p.projectNum === form.projectNum) ?? null,
)

const form = reactive({
  projectNum: '',
  additionalInfo: '',
  items: [newItem()],
})

const submitting = ref(false)
const error = ref('')

function newItem() {
  return {
    receiptDate: '',
    description: '',
    unitPrice: 0,
    quantity: 1,
    category: '',
    otherCategoryDescription: '',
    justification: '',
    url: '',
    vendorID: undefined as number | string | undefined,
    newVendor: null as { name: string; email: string; url: string } | null,
    file: null as File | null,
  }
}

function addItem() { form.items.push(newItem()) }
function removeItem(i: number) { form.items.splice(i, 1) }

function justificationRequired(item: ReturnType<typeof newItem>) {
  return (
    (JUSTIFICATION_REQUIRED_CATEGORIES as readonly string[]).includes(item.category) ||
    !!item.url.trim()
  )
}

const receiptTotal = computed(() =>
  form.items.reduce((sum, i) => sum + Number(i.quantity) * Number(i.unitPrice), 0),
)

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

async function submit() {
  error.value = ''
  if (!form.projectNum) { error.value = 'Project is required.'; return }
  if (form.items.some(i => !i.receiptDate || !i.description || !i.vendorID || !i.category)) {
    error.value = 'All receipt fields are required, including category and vendor.'
    return
  }
  if (form.items.some(i => i.category === 'Other' && !i.otherCategoryDescription.trim())) {
    error.value = 'Please describe the category for items marked "Other".'
    return
  }
  if (form.items.some(i => justificationRequired(i) && !i.justification.trim())) {
    error.value = 'A justification is required for Chemicals, Software, or items with a vendor quote/URL.'
    return
  }
  if (!form.items.some(i => i.file)) {
    error.value = 'At least one receipt must be uploaded.'
    return
  }

  submitting.value = true
  try {
    const items = await Promise.all(
      form.items.map(async i => ({
        receiptDate: i.receiptDate,
        description: i.description,
        unitPrice: i.unitPrice,
        quantity: i.quantity,
        category: i.category,
        otherCategoryDescription: i.category === 'Other' ? i.otherCategoryDescription : undefined,
        justification: i.justification || undefined,
        url: i.url || undefined,
        vendorID: i.vendorID !== '__new__' ? Number(i.vendorID) : null,
        newVendorName: i.vendorID === '__new__' ? i.newVendor?.name : undefined,
        newVendorEmail: i.vendorID === '__new__' ? i.newVendor?.email : undefined,
        newVendorURL: i.vendorID === '__new__' ? i.newVendor?.url : undefined,
        fileName: i.file?.name,
        fileData: i.file ? await readFileAsDataURL(i.file) : undefined,
      })),
    )

    await $fetch('/api/reimbursement', {
      method: 'POST',
      body: {
        projectNum: form.projectNum,
        additionalInfo: form.additionalInfo,
        totalExpenses: receiptTotal.value,
        items,
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
