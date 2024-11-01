const { MongoClient, ServerApiVersion } = require("mongodb");
const assert = require("assert");
require('dotenv').config();
//const axios = require('axios');
const BASE_URL = "http://localhost:3000"

const TEST_DB = 'tmc_uat'

// Helper function to generate random data for testing
async function postData(url, inputBody) {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(inputBody)
        });

        // Parse the response as JSON
        const data = await response.json();

        // Return the data for further use
        return data;
    } catch (error) {
        console.error('Error:', error);
        throw error; // Rethrow the error to handle it in the calling code
    }
}



async function fetchData(url, query="") {
    try {
        const response = await fetch(url, {
            method: 'GET', 
        });

        if (!response.ok) {
            console.log(response.status)
            throw new Error('Network response was not ok');
        }

        const data = await response.json();

        return data; // Return the data for further use
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
        throw error; // Rethrow the error to handle it in the calling code
    }
}


async function updateData(url, inputBody) {
    try {
        const response = await fetch(url, {
            method: 'PUT', // Use PUT method for updating data
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(inputBody)
        });

        // Parse the response as JSON
        const data = await response.json();
        // Return the data for further use
        return data;
    } catch (error) {
        console.error('Error:', error);
        throw error; // Rethrow the error to handle it in the calling code
    }
}


async function testPostMenuItem(){
    const url = BASE_URL + '/menuItem';
    const body = {
        name: 'Test Burger',
        price: 9.99,
        description: 'Delicious burger',
        category: 'Food'
    };
    result = await postData(url, body);
    assert.strictEqual(result.message, 'Menu item added successfully');
    const insertedId = result.menuItem;
    //result = await fetchData(BASE_URL + '/menuItems?_id=' + insertedId, '_id='+ insertedId)
    result = await fetchData(BASE_URL + '/menuItems?_id='+ insertedId)
    assert.strictEqual(result.foundMenuItems[0]._id, insertedId )
}

async function testPostEmptyMenuItem(){
    const url = BASE_URL + '/menuItem';
    const body = {};
    result = await postData(url, body);
    assert.strictEqual(result.error, 'Required fields are missing');
}


async function testPostIncompleteMenuItem(){
    const url = BASE_URL + '/menuItem';
    const body = {
        price: 9.99,
        description: 'Delicious burger',
        category: 'Food'
    };
    result = await postData(url, body);
    assert.strictEqual(result.error, 'Required fields are missing');
}

async function testUpdateMenuItem(){
    const url = BASE_URL + '/menuItem';
    const body = {
        name: 'Test Burger',
        price: 9.99,
        description: 'Delicious burger',
        category: 'Food'
    };
    result = await postData(url, body);
    assert.strictEqual(result.message, 'Menu item added successfully');
    const insertedId = result.menuItem;
    const updateItem = {
        name: 'Updated Item Name',
        description: 'This is the updated description of the item',
        price: 99.99
    };
    await updateData(url + '?_id='+ insertedId, updateItem)
    result = await fetchData(BASE_URL + '/menuItems?_id='+ insertedId)
    assert.strictEqual(result.foundMenuItems[0]._id, insertedId )
    assert.strictEqual(result.foundMenuItems[0].name, updateItem.name)
    assert.strictEqual(result.foundMenuItems[0].description, updateItem.description)
    assert.strictEqual(result.foundMenuItems[0].price, updateItem.price)
}



async function testPostOrder(){
    const url = BASE_URL + '/order';
    const body = {  
        accountId : '2342abdc',
        orderTime : "2023-09-24T15:30:45Z",
        pickupLocation : 3,
        items : ['2','4','6','1'],
        costOfItems : 34,
        tip : 3.4,
        completed : "2023-09-24T16:30:45Z",
    };
    result = await postData(url, body);
    assert.strictEqual(result.message, 'order added successfully');
    const insertedId = result.order;
    result = await fetchData(BASE_URL + '/orders?_id='+ insertedId)
    assert.strictEqual(result.foundOrders[0]._id, insertedId )
}

async function testPostEmptyOrder(){
    const url = BASE_URL + '/order';
    const body = {};
    result = await postData(url, body);
    assert.strictEqual(result.error, 'Required fields are missing');
}


async function testPostIncompleteOrder(){
    const url = BASE_URL + '/order';
    const body = {  
        orderTime : "2023-09-24T15:30:45Z",
        pickupLocation : 3,
        costOfItems : 34,
        tip : 3.4,
        completed : "2023-09-24T16:30:45Z",
    };
    result = await postData(url, body);
    assert.strictEqual(result.error, 'Required fields are missing');
}

async function testUpdateOrder(){
    const url = BASE_URL + '/order';
    const body = {  
        accountId : '2342abdc',
        orderTime : "2023-09-24T15:30:45Z",
        pickupLocation : 3,
        items : ['2','4','6','1'],
        costOfItems : 34,
        tip : 3.4,
        completed : "2023-09-24T16:30:45Z",
    };
    result = await postData(url, body);
    assert.strictEqual(result.message, 'order added successfully');
    const insertedId = result.order;
    const updateItem = {  
        pickupLocation : 4,
        items : ['16','7','6','1'],
        costOfItems : 86.4,
        tip : 3.1,
        completed : "2023-09-25T16:30:45Z",
    };
    await updateData(url + '?_id='+ insertedId, updateItem)
    result = await fetchData(BASE_URL + '/orders?_id='+ insertedId)
    assert.strictEqual(result.foundOrders[0]._id, insertedId )
    assert.strictEqual(result.foundOrders[0].pickupLocation, updateItem.pickupLocation)
    assert.strictEqual(result.foundOrders[0].items[0], updateItem.items[0])
    assert.strictEqual(result.foundOrders[0].costOfItems, updateItem.costOfItems)
    assert.strictEqual(result.foundOrders[0].tip, updateItem.tip)
    assert.strictEqual(result.foundOrders[0].completed, updateItem.completed)
}


async function testPostAccount(){
    const url = BASE_URL + '/account';
    const body = {  
        name : "the tester",
        email : "theTester@test.com",
        password : "12345",
        phone : "122-333-4444",
        accessLevel : 1, 
        cart : ['1', '2', '3', '4']
    };
    result = await postData(url, body);
    assert.strictEqual(result.message, 'account successfully created');
    const insertedId = result.account;
    result = await fetchData(BASE_URL + '/accounts?_id='+ insertedId)
    assert.strictEqual(result.foundAccounts[0]._id, insertedId )
}

async function testPostEmptyAccount(){
    const url = BASE_URL + '/account';
    const body = {};
    result = await postData(url, body);
    assert.strictEqual(result.error, 'Required fields are missing');
}


async function testPostIncompleteAccount(){
    const url = BASE_URL + '/account';
    const body = {  
        name : "the tester",
        phone : "122-333-4444",
        accessLevel : 1, 
        cart : ['1', '2', '3', '4']
    };
    result = await postData(url, body);
    assert.strictEqual(result.error, 'Required fields are missing');
}

async function testUpdateAccount(){
    const url = BASE_URL + '/account';
    const body = {  
        name : "the tester",
        email : "theTester@test.com",
        password : "12345",
        phone : "122-333-4444",
        accessLevel : 1, 
        cart : ['1', '2', '3', '4']
    };
    result = await postData(url, body);
    assert.strictEqual(result.message, 'account successfully created');
    const insertedId = result.account;
    const updateItem = {  
        email : "testing2@test.com",
        password : "abcdefg",
        phone : "122-333-5555",
        accessLevel : 0, 
        cart : ['9', '2', '3', '4']
    };
    await updateData(url + '?_id='+ insertedId, updateItem)
    result = await fetchData(BASE_URL + '/accounts?_id='+ insertedId)
    assert.strictEqual(result.foundAccounts[0]._id, insertedId )
    assert.strictEqual(result.foundAccounts[0].email, updateItem.email)
    assert.strictEqual(result.foundAccounts[0].cart[0], updateItem.cart[0])
    assert.strictEqual(result.foundAccounts[0].password, updateItem.password)
    assert.strictEqual(result.foundAccounts[0].phone, updateItem.phone)
    assert.strictEqual(result.foundAccounts[0].accessLevel, updateItem.accessLevel)
}


async function testPostPickupLocaion(){
    const url = BASE_URL + '/pickupLocation';
    const body = {  
        address : "123 RPI Rd.",
        contactInfo : "123-456-7890",
        name : "RPI union"
    };
    result = await postData(url, body);
    assert.strictEqual(result.message, 'pickup location successfully created');
    const insertedId = result.pickupLocation;
    result = await fetchData(BASE_URL + '/pickupLocations?_id='+ insertedId)
    assert.strictEqual(result.foundPickupLocations[0]._id, insertedId )
}

async function testPostEmptyPickupLocation(){
    const url = BASE_URL + '/pickupLocation';
    const body = {};
    result = await postData(url, body);
    assert.strictEqual(result.error, 'Required fields are missing');
}


async function testPostIncompletePickupLocation(){
    const url = BASE_URL + '/pickupLocation';
    const body = {  
        contactInfo : "123-456-7890",
        name : "RPI union"
    };
    result = await postData(url, body);
    assert.strictEqual(result.error, 'Required fields are missing');
}

async function testUpdatePickupLocation(){
    const url = BASE_URL + '/pickupLocation';
    const body = {  
        address : "123 RPI Rd.",
        contactInfo : "123-456-7890",
        name : "RPI union"
    };
    result = await postData(url, body);
    assert.strictEqual(result.message, 'pickup location successfully created');
    const insertedId = result.pickupLocation;
    const updateItem = {  
        address : "193 RPI Rd.",
        contactInfo : "123-456-4321",
        name : "Sage Dinning Hall",
        active : true
    };
    await updateData(url + '?_id='+ insertedId, updateItem)
    result = await fetchData(BASE_URL + '/pickupLocations?_id='+ insertedId)
    assert.strictEqual(result.foundPickupLocations[0]._id, insertedId )
    assert.strictEqual(result.foundPickupLocations[0].address, updateItem.address)
    assert.strictEqual(result.foundPickupLocations[0].contactInfo, updateItem.contactInfo)
    assert.strictEqual(result.foundPickupLocations[0].name, updateItem.name)
    assert.strictEqual(result.foundPickupLocations[0].active, true)
}


async function testActivateLocation(){
    const url = BASE_URL + '/pickupLocation';
    body = {  
        address : "123 RPI Rd.",
        contactInfo : "123-456-7890",
        name : "RPI union",
        active : true
    };
    result = await postData(url, body);
    assert.strictEqual(result.message, 'pickup location successfully created');
    const insertedIdOne = result.pickupLocation;

    body = {  
        address : "321 RPI Rd.",
        contactInfo : "123-456-7890",
        name : "Commons Dinning hall",
    };
    result = await postData(url, body);
    assert.strictEqual(result.message, 'pickup location successfully created');
    const insertedIdTwo = result.pickupLocation;
    result = await postData(BASE_URL + '/activateLocation', {_id: insertedIdTwo})
    // check that the active flag was removed from the first id
    result = await fetchData(BASE_URL + '/pickupLocations?_id='+ insertedIdOne)
    assert.strictEqual(result.foundPickupLocations[0].active, false )
    // check the active flag was set to true for the second id
    result = await fetchData(BASE_URL + '/pickupLocations?_id='+ insertedIdTwo)
    assert.strictEqual(result.foundPickupLocations[0].active, true )
}


// add 3 menu Items and return thier Ids
async function fillMenuItems(){
    let menuIds = []
    let menuUrl = BASE_URL + '/menuItem';
    let body = [
        {
            name: 'Test Burger',
            price: 9.99,
            description: 'Delicious burger',
            category: 'Food'
        },
        {
            name: 'Test Curry',
            price: 25,
            description: 'Delicious Curry',
            category: 'Curry'
        },
        {
            name: 'Test Waffle',
            price: 25,
            description: 'Delicious Waffle',
            category: 'Waffle'
        }
    ];
    for (let i = 0; i< body.length; i++){
        let result = await postData(menuUrl, body[i]);
        menuIds.push(result.menuItem)
    }
    return menuIds
}


async function testOrderFromCart(){
    //setup the account
    let menuIds = await fillMenuItems()
    let accountUrl = BASE_URL + '/account';
    const body = {  
        name : "the tester",
        email : "theTester@test.com",
        password : "12345",
        phone : "122-333-4444",
        accessLevel : 1, 
        cart : menuIds
    };
    let result = await postData(accountUrl, body);
    let accountId = result.account;
    //Create the order
    let orderFromCartUrl = BASE_URL + '/orderFromCart?_id=' + accountId
    result = await postData(orderFromCartUrl, {pickupLocation: '1', tip: 1.2})
    result = await fetchData(BASE_URL + '/orders?_id='+ result.orderId)
    assert.strictEqual(result.foundOrders[0].costOfItems, 59.99 )
    assert.strictEqual(result.foundOrders[0].tip, 1.2 )
    assert.strictEqual(result.foundOrders[0].items.length, menuIds.length )
    assert.strictEqual(result.foundOrders[0].items[0], menuIds[0] )
    assert.strictEqual(result.foundOrders[0].items[1], menuIds[1] )
    assert.strictEqual(result.foundOrders[0].items[2], menuIds[2] )

}

async function clearTestDB(){
    const uri = process.env.ATLAS_URI

    const client = new MongoClient(uri,  {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
        }
    }
    );
    assert.strictEqual(TEST_DB, 'tmc_uat')
    const myDB = client.db(TEST_DB);
    const menuItems = myDB.collection("menuItems");
    const orders = myDB.collection("orders");
    const accounts = myDB.collection("accounts");
    const pickupLocations = myDB.collection("pickupLocations");
    
    await menuItems.deleteMany({})
    await orders.deleteMany({})
    await accounts.deleteMany({})
    await pickupLocations.deleteMany({})
}
  
async function runTests(){
    // We only want to run the tests on the test database 
    assert.strictEqual(process.env.DATABASE, TEST_DB)
    
    await testPostMenuItem()
    await testPostEmptyMenuItem()
    await testPostIncompleteMenuItem()
    await testUpdateMenuItem()
    await testPostOrder()
    await testPostEmptyOrder()
    await testPostIncompleteOrder()
    await testUpdateOrder()
    await testPostAccount()
    await testPostEmptyAccount()
    await testPostIncompleteAccount()
    await testUpdateAccount()
    await testPostPickupLocaion()
    await testPostEmptyPickupLocation()
    await testPostIncompletePickupLocation()
    await testUpdatePickupLocation()
    await testActivateLocation()
    await testOrderFromCart()
    console.log("all tests passed")
    //await clearTestDB()
}

runTests();
