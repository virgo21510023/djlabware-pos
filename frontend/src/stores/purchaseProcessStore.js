import { defineStore } from 'pinia';

export const usePurchaseProcessStore = defineStore('purchaseProcess', {
  state: () => ({
    poToProcess: null,
  }),
  actions: {
    setPoForPurchase(poData) {
      this.poToProcess = poData;
    },
    clearPoForPurchase() {
      this.poToProcess = null;
    },
  },
});