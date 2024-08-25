import { defineStore } from 'pinia'

export const useMobileMenuStore = defineStore('mobileMenu', {
  state: () => ({
    isOpen: false
  }),
  actions: {
    toggle() {
      this.isOpen = !this.isOpen
    },
    close() {
      this.isOpen = false
    }
  }
})
