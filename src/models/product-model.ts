export enum ProductlistType {
    AllProducts = 'allproducts',
    LowStock = 'lowstock',
    Stock = 'stock',
}

export class ProductModel {
    id: string;
    name: string;
    idProduct: string;
    productId: string;
    productName: string;
    image: string;
    // Default order quantity/stock transaction quantity
    defaultQuantity: number;
    minimumStock: number;
    resupplyQuantity: number;
    stockTransactionSumQty: number;
    availableQty: number;
    reorderQty: number;

    constructor(productJson: any) {
        this.id = productJson.customerProduct ? productJson.customerProduct : productJson.product.id;
        this.name = productJson.name;
        this.idProduct = productJson.product.id;
        this.productId =  productJson.product.productId;
        this.productName = productJson.product.name;
        this.image = productJson.product.image ? productJson.product.image : productJson.image;
        this.defaultQuantity = productJson.quantity ? productJson.quantity : 1;
        this.minimumStock = productJson.minimumStock;
        this.resupplyQuantity = productJson.resupplyQuantity;
        this.stockTransactionSumQty = productJson.stockTransactionSumQty;
        this.availableQty = productJson.availableQty;
        this.reorderQty = productJson.reorderQty;
    }
}