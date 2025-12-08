export interface Product {
    _id: string;
    productId?: string;
    code?: string;
    description?: string;
    image?: string;
    quantity?: number;
    unitPrice?: number;
    totalPrice?: number;
    buyPrice?: number;
    grossProfit?: number;
    commission?: number;

    Code?: string;
    Description?: string;
    Pack?: number;
    rrp?: number;
    GrpSupplier?: string;
    GrpSupplierCode?: string;
    Manufacturer?: string;
    ManufacturerCode?: string;
    ISPCCombined?: number;
    VATCode?: number;
    Brand?: string; // ObjectId as string
    ExtendedCharacterDesc?: string;
    CatalogueCopy?: string;
    ImageRef?: string;
    Category1?: string; // ObjectId as string
    Category2?: string; // ObjectId as string
    Category3?: string; // ObjectId as string
    Style?: string;
}


export interface Customer {
    firstName: string;
    lastName: string;
    email: string;
    phone: string | number;
    address: string;
    city: string;
    company: string;
}

export interface Order {
    orderId: string;
    email: string;
    phone?: string;
    billingAddress?: string;
    invoiceAddress?: string;
    firstName: string;
    lastName?: string;
    deliveryCharges?: number;
    deliveryInstructions?: string;
    poNumber?: number;
    address?: string;
    address2?: string;
    city?: string;
    postcode?: string;
    company?: string;
    sessionId?: string;
    message?: string;
    products?: Product[];
    status?: String;
    subtotal?: number;
    tax?: number;
    total?: number;
    createdAt?: String
}