public with sharing class ProductController {
    @AuraEnabled(cacheable=true)
    public static List<Inventory__c> getAllProductsFromInventory() {
        return [
            SELECT Product__c, Product__r.Name, Available_Items__c, Reserved_Items__c, Sold_Items__c, Product_Location__c, Product_Location__r.Name
            FROM Inventory__c
       ];
    }

    @AuraEnabled(cacheable=true)
    public static List<OpportunityLineItem> getProductsFromOpportunity(String recordId) {

        try {
            return [
                SELECT Opportunity.Id, Product2.Name 
                FROM OpportunityLineItem
                WHERE Opportunity.Id =: recordId
            ];            
        } catch(Exception e) {
            // Log or handle the exception appropriately
            throw new AuraHandledException('Error occurred while fetching products from opportunity: ' + e.getMessage());
        }
    }
}