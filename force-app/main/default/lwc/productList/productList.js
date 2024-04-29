import { LightningElement, api, wire } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import getAllInventoryProducts from '@salesforce/apex/ProductController.getAllProductsFromInventory';
import getProductsOpp from '@salesforce/apex/ProductController.getProductsFromOpportunity';

const FIELDS = ['Opportunity.Id'];

export default class ProductList extends LightningElement {

    @api columns = [
        { label: 'Product Id', fieldName: 'id', type: 'string'},
        { 
          label: 'Name', fieldName: 'name',
          cellAttributes: {class: {fieldName: 'colorName'}},
        },
        { label: 'Available', fieldName: 'availableItems', type: 'string' },
        { label: 'Reserved', fieldName: 'reservedItems', type: 'string' },
        { label: 'Sold', fieldName: 'soldItems', type: 'string' },
        { label: 'Location', fieldName: 'location', type: 'string' },
    ];

    @api tableData = [];

    @api recordId;

    // opportunity;
    // @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
    // wiredOpportunity({ data, error }) {
    //     if (data) {
    //         this.opportunity = data;
    //         //this.handleProductData();
    //     } else if (error) {
    //         console.error('Error fetching opportunity record:', error);
    //     }
    // }

    connectedCallback() {
        console.log('connectedCallback');
        if (this.recordId) {
            this.handleProductData();
        } else {
            console.error('Record Id is not provided.');
        }
    }

    handleProductData() {
        let productIds = []; // Declare productIds array outside of the getAllInventoryProducts then block
    
        getProductsOpp({recordId: this.recordId})
            .then(products => {
                products.forEach(product => {
                    productIds.push(product.Product2.Id);
                });
                console.log('Opportunity Products Ids_____', products);
                console.log('Opportunity Products Ids 2_____', productIds);
    
                // Fetch all inventory products
                getAllInventoryProducts()
                    .then(products => {
                        let productData = [];
                        products.forEach(product => {
                            let productRow = {
                                id: '',
                                name: '',
                                availableItems: '',
                                reservedItems: '',
                                location: ''
                            };
    
                            // Populate productRow with data
                            productRow.name = product.Product__r.Name;
                            productRow.id = product.Product__c;
                            productRow.availableItems = product.Available_Items__c;
                            productRow.location = product.Product_Location__r.Name;
                            productRow.reservedItems = product.Reserved_Items__c;
                            productRow.soldItems = product.Sold_Items__c;
                            productRow.colorName = product.Available_Items__c > 0 ? 'slds-text-color_success' : 'slds-text-color_error';
    
                            // Check if the product ID exists in productIds array
                            if (productIds.includes(product.Product__c)) {
                                productData.push(productRow);
                            }
                        });
                        console.log('Opportunity Products_____', products);
                        console.log('DATAA_____', productData);
                        
                        // Set tableData with filtered productData
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
    
        console.log('RECORD ID______', this.recordId);
    }
    
}