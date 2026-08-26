export default defineAppConfig({
  ui: {
    colors: {
      primary: 'utd-green',
      secondary: 'utd-orange',
      neutral: 'white'
    },

    input: {
      slots: {
        root: 'relative inline-flex items-center rounded-md border border-gray-400',
        base: 'w-full border-0 ring-0 outline-none'
      },  

      defaultVariants: {
        variant: 'none'
      }
    },
     textarea: {
      slots: {
        root: 'relative inline-flex rounded-md border border-gray-400',
        base: 'w-full border-0 ring-0 outline-none focus:ring-0'
      },
      defaultVariants: {
        variant: 'none'
      }
    },
    tabs: {
  slots: {
    list: '',
       trigger: '!text-lg data-[state=inactive] data-[state=inactive]:text-[var(--text-dark)]'
  },
  defaultVariants: {
    variant: 'link'
  }
}
  }
})