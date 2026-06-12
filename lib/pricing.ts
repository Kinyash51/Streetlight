export const pricing = {
  ebook: {
    name: "The Drowned Streetlamp",
    price: "$4.99",
    amount: 499,
    billing: "one-time purchase",
    productCode: "ebook",
  },
  freeReader: {
    name: "Free Reader",
    price: "$0",
  },
  supporter: {
    name: "Supporter",
    price: "$2.99/month",
    amount: 299,
    productCode: "supporter",
  },
  patron: {
    name: "Patron",
    price: "$9.99/month",
    amount: 999,
    productCode: "patron",
  },
} as const;
