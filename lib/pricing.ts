export const pricing = {
  ebook: {
    name: "The Drowned Streetlamp",
    price: "$4.99",
    amount: 499,
    billing: "one-time purchase",
    checkoutProduct: "ebook",
    href: "https://buy.stripe.com/test_eVqfZj4Vg7Ro3294p77kc00",
  },
  freeReader: {
    name: "Free Reader",
    price: "$0",
  },
  supporter: {
    name: "Supporter",
    price: "$2.99/month",
    amount: 299,
    checkoutProduct: "supporter",
    href: "https://buy.stripe.com/test_bJefZj1J47Ro1Y53l37kc01",
  },
  patron: {
    name: "Patron",
    price: "$9.99/month",
    amount: 999,
    checkoutProduct: "patron",
  },
} as const;

export type CheckoutProduct =
  | typeof pricing.ebook.checkoutProduct
  | typeof pricing.supporter.checkoutProduct
  | typeof pricing.patron.checkoutProduct;
