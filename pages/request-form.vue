<template>
  <div class="max-w-3xl mx-auto space-y-6">
    <h1 class="text-2xl font-bold text-[#1A1A1A]">{{ editRequestID ? 'Edit & Resubmit Request' : 'New Procurement Request' }}</h1>

    <div v-if="editComment" class="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
      <span class="font-semibold">Requested changes:</span> {{ editComment }}
    </div>

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
                <p class="text-xs mt-0.5" :class="wordCount(item.description) > 50 ? 'text-red-500' : 'text-[#5A5A5A]'">
                  {{ wordCount(item.description) }}/50 words
                </p>
              </div>
              <UInput v-model="item.url" placeholder="URL *" required />
              <UInput v-model="item.partNumber" placeholder="Part Number *" required />
              <UInput v-model.number="item.quantity" type="number" min="1" placeholder="Qty *" required />
              <UInput v-model.number="item.unitPrice" type="number" step="0.01" min="0" placeholder="Unit Price * ($)" required />
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
            <div>
              <label class="block text-xs text-[#5A5A5A] mb-1">Justification *</label>
              <UTextarea v-model="item.justification" placeholder="Why is this item needed?" :rows="2" class="w-full" />
              <p class="text-xs mt-0.5" :class="wordCount(item.justification) > 50 ? 'text-red-500' : 'text-[#5A5A5A]'">
                {{ wordCount(item.justification) }}/50 words
              </p>
            </div>
            <div>
              <label class="block text-xs text-[#5A5A5A] mb-1">Vendor *</label>
              <VendorSelect
                v-model="item.vendorID"
                @update:new-vendor="(v: { name: string; email: string; url: string }) => item.newVendor = v"
                @update:selected-vendor="(v: { vendorID: number; vendorName: string; isPreferred?: boolean } | null) => item.selectedVendor = v"
              />
            </div>

            <!-- Non-preferred vendor warning -->
            <div
              v-if="vendorWarning(item)"
              class="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded px-3 py-2"
            >
              ⚠ This vendor is not a preferred vendor. Orders for Software, Chemicals, or items over $1,000
              from non-preferred vendors may require extra review and take longer to process.
            </div>

            <div class="text-right text-xs font-semibold text-[#5A5A5A]">
              Line total: ${{ (Number(item.quantity) * Number(item.unitPrice) || 0).toFixed(2) }}
            </div>
          </div>
        </div>

        <!-- Running Total + Budget Impact -->
        <div class="mt-3 text-right text-sm font-semibold text-[#1A1A1A] space-y-1">
          <div>Items Total: <span class="text-[#E87722]">${{ itemsTotal.toFixed(2) }}</span></div>
          <div v-if="selectedProject" :class="balanceAfter < 0 ? 'text-red-600' : 'text-[#154734]'">
            Available balance after this order: ${{ balanceAfter.toFixed(2) }}
          </div>
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
          :disabled="balanceAfter < 0 && !editRequestID"
        >
          {{ editRequestID ? 'Resubmit Request' : 'Submit Request' }}
        </UButton>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ITEM_CATEGORIES } from '~/shared/constants/categories'

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
  dateNeeded: '',
  additionalInfo: '',
  items: [newItem()],
})

const attachmentFile = ref<File | null>(null)
const submitting = ref(false)
const error = ref('')

// ── Edit & resubmit mode (?edit=<requestID>) ────────────────────────────────
const route = useRoute()
const editRequestID = route.query.edit ? Number(route.query.edit) : null
const editComment = ref('')

if (editRequestID) {
  const data = await $fetch<{ requests: Array<{
    requestID: number
    dateNeeded: string
    additionalInfo?: string | null
    project?: { projectNum: string }
    process?: { status: string; mentorProcessedComments?: string | null; adminProcessedComments?: string | null }
    items?: Array<{ description: string; justification?: string; url: string; partNumber: string; quantity: number; unitPrice: number; category?: string; otherCategoryDescription?: string | null; vendorID?: number }>
  }> }>('/api/request/get', { method: 'POST', body: {} })
  const existing = data?.requests?.find(
    r => r.requestID === editRequestID && ['REJECTED', 'CHANGES_REQUESTED'].includes(r.process?.status ?? ''),
  )
  if (existing) {
    form.projectNum = existing.project?.projectNum ?? ''
    form.dateNeeded = existing.dateNeeded?.slice(0, 10) ?? ''
    form.additionalInfo = existing.additionalInfo ?? ''
    form.items = (existing.items ?? []).map(it => ({
      ...newItem(),
      description: it.description,
      justification: it.justification ?? '',
      url: it.url,
      partNumber: it.partNumber,
      quantity: it.quantity,
      unitPrice: it.unitPrice,
      category: it.category ?? '',
      otherCategoryDescription: it.otherCategoryDescription ?? '',
      vendorID: it.vendorID,
    }))
    if (!form.items.length) form.items = [newItem()]
    editComment.value =
      existing.process?.mentorProcessedComments || existing.process?.adminProcessedComments || ''
  }
}

function newItem() {
  return {
    description: '',
    justification: '',
    url: '',
    partNumber: '',
    quantity: 1,
    unitPrice: 0,
    category: '',
    otherCategoryDescription: '',
    vendorID: undefined as number | string | undefined,
    newVendor: null as { name: string; email: string; url: string } | null,
    selectedVendor: null as { vendorID: number; vendorName: string; isPreferred?: boolean } | null,
  }
}

function addItem() { form.items.push(newItem()) }
function removeItem(i: number) { form.items.splice(i, 1) }

function wordCount(s: string) {
  return s.trim() ? s.trim().split(/\s+/).length : 0
}

/** Warn when a non-preferred (or brand-new) vendor is used for sensitive categories or expensive items. */
function vendorWarning(item: ReturnType<typeof newItem>) {
  if (!item.vendorID || !item.category) return false
  const isPreferred = item.vendorID === '__new__' ? false : (item.selectedVendor?.isPreferred ?? false)
  if (isPreferred) return false
  return item.category === 'Software' || item.category === 'Chemicals' || Number(item.unitPrice) > 1000
}

const itemsTotal = computed(() =>
  form.items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0),
)

const balanceAfter = computed(() => {
  if (!selectedProject.value) return 0
  return selectedProject.value.startingBudget - selectedProject.value.totalExpenses - itemsTotal.value
})

async function submit() {
  error.value = ''
  if (!form.projectNum || !form.dateNeeded) {
    error.value = 'Project and date needed are required.'
    return
  }
  if (form.items.some(i => !i.description || !i.url || !i.partNumber || !i.vendorID || !i.category)) {
    error.value = 'All item fields are required, including category and vendor.'
    return
  }
  if (form.items.some(i => i.category === 'Other' && !i.otherCategoryDescription.trim())) {
    error.value = 'Please describe the category for items marked "Other".'
    return
  }
  if (form.items.some(i => !i.justification.trim())) {
    error.value = 'A justification is required for every item.'
    return
  }
  if (form.items.some(i => wordCount(i.justification) > 50 || wordCount(i.description) > 50)) {
    error.value = 'Justification and description must each be 50 words or fewer.'
    return
  }
  // In edit mode the server credits back the order's prior expense before checking the budget
  if (balanceAfter.value < 0 && !editRequestID) {
    error.value = 'This order exceeds the project\'s available balance.'
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
        resubmitRequestID: editRequestID ?? undefined,
        items: form.items.map(i => ({
          description: i.description,
          justification: i.justification,
          url: i.url,
          partNumber: i.partNumber,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          category: i.category,
          otherCategoryDescription: i.category === 'Other' ? i.otherCategoryDescription : undefined,
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
