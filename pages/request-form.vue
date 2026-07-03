<template>
  <div class="mx-auto max-w-5xl space-y-6">
    <section class="app-surface overflow-hidden p-0">
      <div class="border-b border-white/70 bg-gradient-to-r from-[#154734] to-[#0f3326] px-6 py-6 text-white sm:px-8">
        <div class="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p class="text-xs font-bold uppercase tracking-[0.3em] text-white/60">Student workflow</p>
            <h1 class="mt-2 text-3xl font-black tracking-tight">
              {{ editRequestID ? 'Edit and Resubmit Request' : 'New Procurement Request' }}
            </h1>
            <p class="mt-2 max-w-2xl text-sm text-white/75">
              Pick the right project, add each item clearly, and give the reviewers enough detail to approve the order quickly.
            </p>
          </div>

          <div v-if="selectedProject" class="rounded-3xl border border-white/15 bg-white/10 px-4 py-3">
            <p class="text-[11px] font-bold uppercase tracking-[0.24em] text-white/55">Available balance</p>
            <p class="mt-1 text-2xl font-black">${{ balanceAfter.toFixed(2) }}</p>
            <p class="text-xs text-white/65">
              After this request: <span :class="balanceAfter < 0 ? 'text-amber-200' : 'text-white'">{{ balanceAfter < 0 ? 'Over budget' : 'Within budget' }}</span>
            </p>
          </div>
        </div>
      </div>

      <div class="space-y-6 p-6 sm:p-8">
        <div v-if="editComment" class="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <span class="font-semibold">Requested changes:</span> {{ editComment }}
        </div>

        <BudgetDisplay
          v-if="selectedProject"
          :starting-budget="selectedProject.startingBudget"
          :used="selectedProject.totalExpenses + itemsTotal"
        />

        <form class="space-y-6" @submit.prevent="submit">
          <section class="app-surface space-y-4 p-5">
            <div>
              <h2 class="text-lg font-bold text-slate-900">Project details</h2>
              <p class="text-sm text-slate-500">These fields tell the reviewers which project this order belongs to.</p>
            </div>

            <div class="grid gap-4 md:grid-cols-2">
              <AppSelect
                v-model="form.projectNum"
                :items="projectOptions"
                label="Project"
                placeholder="Select your project"
                required
              />
              <UInput v-model="form.dateNeeded" type="date" label="Date needed *" />
            </div>

            <UTextarea v-model="form.additionalInfo" label="Additional information" placeholder="Any extra context or constraints..." :rows="4" />
          </section>

          <section class="app-surface space-y-4 p-5">
            <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 class="text-lg font-bold text-slate-900">Items</h2>
                <p class="text-sm text-slate-500">Each line item should be specific enough that a reviewer can understand what you are buying.</p>
              </div>
              <UButton size="sm" variant="outline" class="border-[#d86e18] text-[#d86e18]" @click="addItem">
                + Add item
              </UButton>
            </div>

            <div class="space-y-4">
              <article
                v-for="(item, i) in form.items"
                :key="i"
                class="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm"
              >
                <div class="flex items-center justify-between gap-3">
                  <div>
                    <p class="text-sm font-semibold text-slate-900">Item {{ i + 1 }}</p>
                    <p class="text-xs text-slate-500">Fill out the product details, category, and vendor for this line.</p>
                  </div>
                  <button
                    v-if="form.items.length > 1"
                    type="button"
                    class="text-xs font-semibold text-red-600 hover:text-red-700"
                    @click="removeItem(i)"
                  >
                    Remove
                  </button>
                </div>

                <div class="mt-4 grid gap-4 md:grid-cols-2">
                  <div class="md:col-span-2">
                    <UInput v-model="item.description" label="Description *" placeholder="What are you ordering?" />
                    <p class="mt-1 text-xs" :class="wordCount(item.description) > 50 ? 'text-red-500' : 'text-slate-500'">
                      {{ wordCount(item.description) }}/50 words
                    </p>
                  </div>
                  <UInput v-model="item.url" label="URL *" placeholder="Product link" />
                  <UInput v-model="item.partNumber" label="Part number *" placeholder="Part or SKU" />
                  <UInput v-model.number="item.quantity" type="number" min="1" label="Quantity *" />
                  <UInput v-model.number="item.unitPrice" type="number" step="0.01" min="0" label="Unit price ($) *" />
                </div>

                <div class="mt-4 grid gap-4 md:grid-cols-2">
                  <AppSelect
                    v-model="item.category"
                    :items="categoryOptions"
                    label="Category"
                    placeholder="Choose a category"
                    required
                  />
                  <div class="space-y-2">
                    <label class="block text-sm font-semibold text-slate-800">Justification *</label>
                    <UTextarea v-model="item.justification" placeholder="Why is this item needed?" :rows="4" />
                    <p class="text-xs" :class="wordCount(item.justification) > 50 ? 'text-red-500' : 'text-slate-500'">
                      {{ wordCount(item.justification) }}/50 words
                    </p>
                  </div>
                </div>

                <div v-if="item.category === 'Other'" class="mt-4">
                  <UInput v-model="item.otherCategoryDescription" label="Other category description *" placeholder="Describe the category" />
                </div>

                <div class="mt-4">
                  <label class="mb-2 block text-sm font-semibold text-slate-800">Vendor *</label>
                  <VendorSelect
                    v-model="item.vendorID"
                    @update:new-vendor="setItemNewVendor(item, $event)"
                    @update:selected-vendor="setItemSelectedVendor(item, $event)"
                  />
                </div>

                <div
                  v-if="vendorWarning(item)"
                  class="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-medium text-amber-900"
                >
                  This vendor is not marked as preferred. Software, chemicals, and expensive items may need extra review.
                </div>

                <div class="mt-4 text-right text-sm font-semibold text-slate-700">
                  Line total: ${{ (Number(item.quantity) * Number(item.unitPrice) || 0).toFixed(2) }}
                </div>
              </article>
            </div>

            <div class="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm">
              <span class="font-semibold text-slate-700">Items total</span>
              <span class="font-black text-[#d86e18]">${{ itemsTotal.toFixed(2) }}</span>
            </div>
          </section>

          <div v-if="error" class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {{ error }}
          </div>

          <div class="flex flex-wrap justify-end gap-3">
            <UButton variant="ghost" @click="$router.back()">Cancel</UButton>
            <UButton
              type="submit"
              class="bg-[#154734] text-white hover:bg-[#0f3326]"
              :loading="submitting"
              :disabled="balanceAfter < 0 && !editRequestID"
            >
              {{ editRequestID ? 'Resubmit Request' : 'Submit Request' }}
            </UButton>
          </div>
        </form>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ITEM_CATEGORIES } from '~/shared/constants/categories'

definePageMeta({ middleware: 'auth' })

type RequestCategory = (typeof ITEM_CATEGORIES)[number]
type RequestItem = {
  description: string
  justification: string
  url: string
  partNumber: string
  quantity: number
  unitPrice: number
  category: RequestCategory | undefined
  otherCategoryDescription: string
  vendorID: number | string | undefined
  newVendor: { name: string; email: string; url: string } | null
  selectedVendor: { vendorID: number; vendorName: string; isPreferred?: boolean } | null
}

const { isStudent } = useAuth()
if (!isStudent.value) await navigateTo('/orders')

const { data: projects } = await useFetch<{ projectNum: string; projectTitle: string; startingBudget: number; totalExpenses: number }[]>(
  '/api/worksOn/currentProjects',
)

const projectOptions = computed(() =>
  (projects.value ?? []).map(p => ({
    label: `#${p.projectNum} - ${p.projectTitle}`,
    value: p.projectNum,
  })),
)

const categoryOptions = ITEM_CATEGORIES.map(c => ({ label: c, value: c as RequestCategory }))

const selectedProject = computed(() =>
  projects.value?.find(p => p.projectNum === form.projectNum) ?? null,
)

const form = reactive<{
  projectNum: string
  dateNeeded: string
  additionalInfo: string
  items: RequestItem[]
}>({
  projectNum: '',
  dateNeeded: '',
  additionalInfo: '',
  items: [newItem()],
})

const attachmentFile = ref<File | null>(null)
const submitting = ref(false)
const error = ref('')

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
      category: it.category as RequestCategory | undefined,
      otherCategoryDescription: it.otherCategoryDescription ?? '',
      vendorID: it.vendorID,
    }))
    if (!form.items.length) form.items = [newItem()]
    editComment.value = existing.process?.mentorProcessedComments || existing.process?.adminProcessedComments || ''
  }
}

function newItem(): RequestItem {
  return {
    description: '',
    justification: '',
    url: '',
    partNumber: '',
    quantity: 1,
    unitPrice: 0,
    category: undefined,
    otherCategoryDescription: '',
    vendorID: undefined as number | string | undefined,
    newVendor: null as { name: string; email: string; url: string } | null,
    selectedVendor: null as { vendorID: number; vendorName: string; isPreferred?: boolean } | null,
  }
}

function addItem() {
  form.items.push(newItem())
}

function removeItem(i: number) {
  form.items.splice(i, 1)
}

function setItemNewVendor(item: RequestItem, vendor: { name: string; email: string; url: string } | null) {
  item.newVendor = vendor
}

function setItemSelectedVendor(item: RequestItem, vendor: { vendorID: number; vendorName: string; isPreferred?: boolean } | null) {
  item.selectedVendor = vendor
}

function wordCount(s: string) {
  return s.trim() ? s.trim().split(/\s+/).length : 0
}

function vendorWarning(item: RequestItem) {
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
  if (form.items.some(i => (i.vendorID == null || i.vendorID === '__new__') && !i.newVendor?.name.trim())) {
    error.value = 'Enter a vendor name for each new vendor.'
    return
  }
  if (balanceAfter.value < 0 && !editRequestID) {
    error.value = 'This order exceeds the project balance.'
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
