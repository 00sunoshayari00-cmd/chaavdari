// lib/cartLabels.ts
type T = (key: string) => string;

// Server components build this once and pass it to the client cart components
export function buildCartLabels(t: T) {
  return {
    title: t("cart.title"),
    open: t("cart.open"),
    close: t("cart.close"),
    empty: t("cart.empty"),
    emptyHint: t("cart.emptyHint"),
    continueShopping: t("cart.continueShopping"),
    viewCart: t("cart.viewCart"),
    remove: t("cart.remove"),
    decrease: t("cart.decrease"),
    increase: t("cart.increase"),
    subtotal: t("cart.subtotal"),
    discountLine: t("cart.discountLine"),
    afterDiscount: t("cart.afterDiscount"),
    addMore: t("cart.addMore"),
    offerApplied: t("cart.offerApplied"),
    outOfStock: t("cart.outOfStock"),
    removedNotice: t("cart.removedNotice"),
    loadError: t("cart.loadError"),
    retry: t("cart.retry"),
    order: t("cart.order"),
    longHint: t("cart.longHint"),
    clear: t("cart.clear"),
    msgGreeting: t("orderMsg.greeting"),
    msgTotal: t("orderMsg.total"),
    msgDiscount: t("orderMsg.discount"),
    msgAfterDiscount: t("orderMsg.afterDiscount"),
    msgLink: t("orderMsg.productLink"),
    msgLinks: t("orderMsg.productLinks"),
  };
}

export type CartLabels = ReturnType<typeof buildCartLabels>;
