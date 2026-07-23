<template>
  <div class="mx-auto max-w-5xl space-y-6">
    <section class="app-surface overflow-hidden p-0">
      <div class="border-b border-white/70 bg-gradient-to-r from-[#154734] to-[#0f3326] px-6 py-6 text-white sm:px-8">
        <div class="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p class="text-xs font-bold uppercase tracking-[0.3em] text-white/60">Student workflow</p>
            <h1 class="mt-2 text-3xl font-black tracking-tight">New Reimbursement Request</h1>
            <p class="mt-2 max-w-2xl text-sm text-white/75">
              Use this when you already paid for approved project expenses and need to recover the cost.
            </p>
          </div>

          <div v-if="selectedProject" class="rounded-3xl border border-white/15 bg-white/10 px-4 py-3">
            <p class="text-[11px] font-bold uppercase tracking-[0.24em] text-white/55">Available balance</p>
            <p class="mt-1 text-2xl font-black">${{ (selectedProject.startingBudget - selectedProject.totalExpenses - receiptTotal).toFixed(2) }}</p>
            <p class="text-xs text-white/65">After this reimbursement</p>
          </div>
        </div>
      </div>

      <div class="space-y-6 p-6 sm:p-8">
        <BudgetDisplay
          v-if="selectedProject"
          :starting-budget="selectedProject.startingBudget"
          :used="selectedProject.totalExpenses + receiptTotal"
        />

        <form class="space-y-6" @submit.prevent="submit">
          <section class="app-surface space-y-4 p-5">
            <div>
              <h2 class="text-lg font-bold text-slate-900">Project details</h2>
              <p class="text-sm text-slate-500">Select the project this reimbursement belongs to and add any context reviewers need.</p>
            </div>

            <AppSelect
              v-model="form.projectNum"
              :items="projectOptions"
              label="Project"
              placeholder="Select your project"
              required
            />

            <div class="rounded-2xl border-2 border-slate-300 bg-slate-50 p-5 space-y-3">
              <label class="block text-sm font-bold text-slate-900">Additional information</label>
              <textarea
                v-model="form.additionalInfo"
                rows="4"
                placeholder="Notes about this reimbursement..."
                class="block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 shadow-sm outline-none transition focus:border-[#d86e18] focus:ring-4 focus:ring-[#d86e18]/10 resize-none"
              ></textarea>
            </div>
          </section>

          <section class="app-surface space-y-4 p-5">
            <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 class="text-lg font-bold text-slate-900">Receipts</h2>
                <p class="text-sm text-slate-500">Attach clear receipt images or PDFs for at least one line item.</p>
              </div>
              <UButton size="sm" variant="outline" class="border-[#d86e18] text-[#d86e18]" @click="addItem">
                + Add receipt
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
                    <p class="text-sm font-semibold text-slate-900">Receipt {{ i + 1 }}</p>
                    <p class="text-xs text-slate-500">Every receipt needs the purchase date, description, and vendor.</p>
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

                <!-- Date and Description -->
                <div class="mt-6 space-y-4">
                  <div class="rounded-2xl border-2 border-slate-300 bg-slate-50 p-5">
                    <label class="mb-3 block text-sm font-bold text-slate-900">Date of purchase *</label>
                    <UInput v-model="item.receiptDate" type="date" />
                  </div>
                  <div class="rounded-2xl border-2 border-slate-300 bg-slate-50 p-5 space-y-3">
                    <label class="block text-sm font-bold text-slate-900">What is on the receipt? *</label>
                    <textarea
                      v-model="item.description"
                      rows="7"
                      placeholder="Be specific about the items purchased"
                      class="block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 shadow-sm outline-none transition focus:border-[#d86e18] focus:ring-4 focus:ring-[#d86e18]/10 resize-none"
                    ></textarea>
                    <p class="text-xs" :class="wordCount(item.description) > 50 ? 'text-red-500' : 'text-slate-500'">
                      {{ wordCount(item.description) }}/50 words
                    </p>
                  </div>
                </div>

                <!-- Item Quantity and Unit Price -->
                <div class="mt-6 grid gap-4 md:grid-cols-2">
                  <div class="rounded-xl border-2 border-slate-300 bg-slate-50 p-5">
                    <label class="mb-3 block text-sm font-bold text-slate-900">Item quantity *</label>
                    <UInput v-model.number="item.quantity" type="number" min="1" placeholder="How many?" />
                  </div>
                  <div class="rounded-xl border-2 border-slate-300 bg-slate-50 p-5">
                    <label class="mb-3 block text-sm font-bold text-slate-900">Item unit price ($) *</label>
                    <UInput v-model.number="item.unitPrice" type="number" step="0.01" min="0" placeholder="Cost per item" />
                  </div>
                </div>

                <!-- Optional Product URL -->
                <div class="mt-6">
                  <div class="rounded-2xl border-2 border-slate-300 bg-slate-50 p-5">
                    <label class="mb-3 block text-sm font-bold text-slate-900">Product URL (optional)</label>
                    <UInput v-model="item.url" placeholder="Link to vendor or product page" />
                  </div>
                </div>

                <!-- Category and Justification -->
                <div class="mt-6 space-y-4">
                  <div class="rounded-2xl border-2 border-slate-300 bg-slate-50 p-5">
                    <label class="mb-3 block text-sm font-bold text-slate-900">Category *</label>
                    <AppSelect
                      v-model="item.category"
                      :items="categoryOptions"
                      placeholder="Choose a category"
                      required
                    />
                  </div>
                  <div v-if="justificationRequired(item)" class="rounded-2xl border-2 border-slate-300 bg-slate-50 p-5 space-y-3">
                    <label class="block text-sm font-bold text-slate-900">Justification *</label>
                    <textarea
                      v-model="item.justification"
                      rows="7"
                      placeholder="Why is this reimbursement needed?"
                      class="block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 shadow-sm outline-none transition focus:border-[#d86e18] focus:ring-4 focus:ring-[#d86e18]/10 resize-none"
                    ></textarea>
                    <p class="text-xs" :class="wordCount(item.justification) > 50 ? 'text-red-500' : 'text-slate-500'">
                      {{ wordCount(item.justification) }}/50 words
                    </p>
                  </div>
                </div>

                <div v-if="item.category === 'Other'" class="mt-4">
                  <div class="rounded-2xl border-2 border-slate-300 bg-slate-50 p-5">
                    <label class="mb-3 block text-sm font-bold text-slate-900">Other category description *</label>
                    <UInput v-model="item.otherCategoryDescription" placeholder="Describe the category" />
                  </div>
                </div>

                <!-- Vendor Selection -->
                <div class="mt-6">
                  <VendorSelect
                    v-model="item.vendorID"
                    @update:new-vendor="setItemNewVendor(item, $event)"
                  />
                </div>

                <!-- Receipt Upload -->
                <div class="mt-6">
                  <label class="mb-3 block text-sm font-semibold text-slate-900">Receipt upload</label>
                  <DragAndDrop v-model="item.file" accept=".pdf,.png,.jpg" label="Drag and drop receipt scan or photo" />
                </div>

                <div class="mt-4 text-right text-sm font-semibold text-slate-700">
                  Line total: ${{ (Number(item.quantity) * Number(item.unitPrice) || 0).toFixed(2) }}
                </div>
              </article>
            </div>

            <div class="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm">
              <span class="font-semibold text-slate-700">Receipt total</span>
              <span class="font-black text-[#d86e18]">${{ receiptTotal.toFixed(2) }}</span>
            </div>
          </section>

          <div v-if="error" class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {{ error }}
          </div>

          <div class="flex flex-wrap justify-end gap-3">
            <UButton variant="ghost" @click="$router.back()">Cancel</UButton>
            <UButton type="submit" class="bg-[#154734] text-white hover:bg-[#0f3326]" :loading="submitting">
              Submit Reimbursement
            </UButton>
          </div>
        </form>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ITEM_CATEGORIES, JUSTIFICATION_REQUIRED_CATEGORIES } from '~~/shared/constants/categories'

definePageMeta({ middleware: 'auth' })

type ReimbursementCategory = (typeof ITEM_CATEGORIES)[number]
type ReimbursementItem = {
  receiptDate: string
  description: string
  unitPrice: number
  quantity: number
  category: ReimbursementCategory | undefined
  otherCategoryDescription: string
  justification: string
  url: string
  vendorID: number | string | undefined
  newVendor: { name: string; email: string; url: string } | null
  file: File | null
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

const categoryOptions = ITEM_CATEGORIES.map(c => ({ label: c, value: c as ReimbursementCategory }))

const selectedProject = computed(() =>
  projects.value?.find(p => p.projectNum === form.projectNum) ?? null,
)

const form = reactive<{
  projectNum: string
  additionalInfo: string
  items: ReimbursementItem[]
}>({
  projectNum: '',
  additionalInfo: '',
  items: [newItem()],
})

const submitting = ref(false)
const error = ref('')

function newItem(): ReimbursementItem {
  return {
    receiptDate: '',
    description: '',
    unitPrice: 0,
    quantity: 1,
    category: undefined,
    otherCategoryDescription: '',
    justification: '',
    url: '',
    vendorID: undefined as number | string | undefined,
    newVendor: null as { name: string; email: string; url: string } | null,
    file: null as File | null,
  }
}

function addItem() {
  form.items.push(newItem())
}

function removeItem(i: number) {
  form.items.splice(i, 1)
}

function setItemNewVendor(item: ReimbursementItem, vendor: { name: string; email: string; url: string } | null) {
  item.newVendor = vendor
}

function wordCount(s: string) {
  return s.trim() ? s.trim().split(/\s+/).length : 0
}

function justificationRequired(item: ReimbursementItem) {
  return (
    (!!item.category && (JUSTIFICATION_REQUIRED_CATEGORIES as readonly string[]).includes(item.category)) ||
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
  if (!form.projectNum) {
    error.value = 'Project is required.'
    return
  }
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
  if (form.items.some(i => (i.vendorID == null || i.vendorID === '__new__') && !i.newVendor?.name.trim())) {
    error.value = 'Enter a vendor name for each new vendor.'
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
        fileData: i.file ? await readFileAsDataURL(i.file) : null,
        fileName: i.file?.name ?? null,
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