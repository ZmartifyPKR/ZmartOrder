export enum StockTransactionlistType {
    AllOrders = '',
    Delayed = 'delayed',
    NotDelivered = 'notdelivered',
    Today = 'today',
    Delivered = 'delivered'
}

export class StockTransactionModel {
    id: string;
    productId: string;
    transNo: number;
    transName: string;
    productName: string;
    quantity: number;
    createdDate: Date;
    deliveryDate: Date;
    expectedDeliveryDate;

    constructor(orderJson: any) {
        this.id = orderJson.id;
        this.productId = orderJson.customerProduct.product.productId;
        // this.orderNo = orderJson.sequenceNo;
        this.transName = orderJson.name;
        this.productName = orderJson.customerProduct.product.name;
        this.createdDate = orderJson.createdDate;
        this.quantity = orderJson.quantity;
    }

}