
export interface Product {
    _id: string;
    Code: string;
    Description: string;
    Pack: number;
    rrp: number;
    GrpSupplier: string;
    GrpSupplierCode: string;
    Manufacturer: string;
    ManufacturerCode: string;
    ISPCCombined: number;
    VATCode: number;
    Brand: string; // For demo, just string name/_id
    ExtendedCharacterDesc: string;
    CatalogueCopy: string;
    ImageRef: string;
    Category1: string;
    Category2: string;
    Category3: string;
    Style: string;
    isActive: boolean;
    topSelling?: boolean;
    createdAt?: string
}