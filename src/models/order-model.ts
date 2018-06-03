export enum OrderlistType {
    AllOrders = '',
    Delayed = 'delayed',
    NotDelivered = 'notdelivered',
    Today = 'today',
    Delivered = 'delivered',
    PictureOrders =  'images'
}

export class OrderModel {
    id: string;
    productId: string;
    orderNo: number;
    orderName: string;
    productName: string;
    quantity: number;
    image?: string;
    createdDate: Date;
    deliveryDate: Date;
    expectedDeliveryDate;

    constructor(orderJson: any) {
        this.id = orderJson.id;
        this.productId = orderJson.customerProduct.product.productId;
        this.orderNo = orderJson.sequenceNo;
        this.orderName = orderJson.name;
        this.productName = orderJson.customerProduct.product.name;
        this.createdDate = orderJson.createdDate;
        this.deliveryDate = orderJson.deliveryDate;
        this.quantity = orderJson.quantity;
        this.image = orderJson.image;
        this.expectedDeliveryDate = orderJson.expectedDeliveryDate;
    }

}