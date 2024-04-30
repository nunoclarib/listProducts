import { LightningElement, api, wire } from 'lwc';
import getAllInventoryProducts from '@salesforce/apex/ProductController.getAllProductsFromInventory';
import getProductsOpp from '@salesforce/apex/ProductController.getProductsFromOpportunity';
import getWarehouse from '@salesforce/apex/ProductController.getWarehouse';

export default class ProductList extends LightningElement {

    @api columns = [
        { label: 'Id', fieldName: 'id', type: 'string', cellAttributes: {class: 'slds-text-color_default'} },
        { 
          label: 'Name', fieldName: 'name',
          cellAttributes: {class: {fieldName: 'colorName'}},
        },
        { label: 'Image', fieldName: 'image', type: 'customImage',
        cellAttributes: {class: 'slds-text-color_default'}
        },
        { label: 'Color', fieldName: 'color', type: 'string', cellAttributes: {class: 'slds-text-color_default'} },
        { label: 'Available', fieldName: 'availableItems', type: 'string', cellAttributes: {class: 'slds-text-color_default'} },
        { label: 'Reserved', fieldName: 'reservedItems', type: 'string', cellAttributes: {class: 'slds-text-color_default'} },
        { label: 'Sold', fieldName: 'soldItems', type: 'string', cellAttributes: {class: 'slds-text-color_default'} },
        { label: 'Location', fieldName: 'location', type: 'string', cellAttributes: {class: 'slds-text-color_default'} },
    ];

    @api tableData = [];
    @api recordId;

    @api warehouseId;

    connectedCallback() {
        console.log('connectedCallback');
        if (this.recordId) {
            this.handleProductData();
        } else {
            console.error('Record Id is not provided.');
        }
    }

    handleProductData() {
        let productIds = [];

        getWarehouse({recordId: this.recordId})
            .then(warehouse => {
                for (let key in warehouse) {
                    this.warehouseId = warehouse[key].Warehouse__c;
                }
            })
            .catch(error => {
                console.log('Error in fetching warehouse data', error);
            });

        getProductsOpp({recordId: this.recordId})
            .then(products => {
                products.forEach(product => {
                    productIds.push(product.Product2.Id);
                });
                console.log('Opportunity Products Ids_____', products);
                console.log('Opportunity Products Ids 2_____', productIds);

                console.log('Warehouse Id_____', this.warehouseId);
                console.log('Warehouse Type_____', typeof(this.warehouseId));
    
                getAllInventoryProducts({warehouseId: this.warehouseId})
                    .then(products => {
                        let productData = [];
                        products.forEach(product => {
                            let productRow = {
                                id: '',
                                image:'',
                                name: '',
                                color: '',
                                availableItems: '',
                                reservedItems: '',
                                location: ''
                            };
    
                            productRow.name = product.Product__r.Name;
                            productRow.id = product.Product__c;

                            //productRow.image = product.Product__r.Image__c;
                            productRow.image = product.Product__r.Image__c ? product.Product__r.Image__c : "https://t4.ftcdn.net/jpg/03/32/56/67/360_F_332566713_q0QLBQ0BWkG5ed7DGRiuFIjvZNwEL9k2.jpg";
                            productRow.color = product.Product__r.Color__c ? product.Product__r.Color__c : "N/A";
                            
                            productRow.availableItems = product.Available_Items__c;
                            productRow.location = product.Product_Location__r.Name;
                            productRow.reservedItems = product.Reserved_Items__c;
                            productRow.soldItems = product.Sold_Items__c;

                            // color for the product depending on the location and availability
                            if(product.Product_Location__c !== this.warehouseId){
                                productRow.colorName = product.Available_Items__c > 0 ? 'slds-text-title_bold' : 'slds-text-color_error slds-text-title_bold';
                            } else {
                                productRow.colorName = product.Available_Items__c > 0 ? 'slds-text-color_success slds-text-title_bold' : 'slds-text-color_error slds-text-title_bold';
                            }

                            if (productIds.includes(product.Product__c)) {
                                productData.push(productRow);
                            }
                        });
                        console.log('Opportunity Products_____', products);
                        console.log('DATAA_____', productData);
                        
                        if (productData.length === 0) {
                            this.tableData = null;
                        } else {
                            this.tableData = productData;
                        }
                    })
                    .catch(error => {
                        console.log('Error in fetching product data', error);
                    });
    
            })
            .catch(error => {
                console.log('Error in fetching product data', error);
            });
            
    }
}
