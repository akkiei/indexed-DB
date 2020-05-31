# indexed-db-lite

A simple implementation of indexed-DB.

## Installation

Use the node package manager to install indexed-db-lite.

```bash
npm i indexed-db-lite
```

## Usage

```javascript
import IDB from 'indexed-db-lite';
```

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.


## Implementing functions

Currently, I have added all the functions responsible for CRUD operations.
In future updates, I'll add more functions like key-pair lookup in a nested JSON etc.
Some functions mentioned here return promise due to asynchronous nature of IndexedDB.
Hence, they should be called from async function with the await keyword or 
can be resolved using .then() 

```javascript
import IDB from 'indexed-db-lite';

ReadObject = async (StoreName, primKey) => {
    const result = await IDB.ReadObjectStoreById( StoreName, primKey );
    console.log(result);
 }
```
## OR
```javascript
import IDB from 'indexed-db-lite';

 IDB.ReadObjectStoreById( StoreName, primKey ).then(function(result){
   console.log(result);
});
```





## Functions
```javascript
InitDB = function(dbName, version)
```
 This is the first function that should be called where we initialise the indexedDB.
In the InitDB, database name and inital version should be passed as parameters.
 * @param  {} dbName => database name
 * @param  {} version => version should be an integer value.


##
```javascript
CreateObjectStore = function(dbName, ObjectStoreName, isAutoIncrement = true)
```
 This is function should be called whenever we want to create a new ObjectStore in indexedDB.
 * @param  {} dbName => Database name
 * @param  {} ObjectStoreName => Name of the store in our Database
 * @param  {} isAutoIncrement = true => if true then primary key for each row/entry will be an auto-increment value else a custom key for each entry should be passed while insertion.

##
```javascript
InsertObjectStore = function(ObjectStoreName, dataObject, primaryKey = '', valueKey = 'data') 
```
 This is function inserts data to the ObjectStore in indexedDB.
 * @param  {} ObjectStoreName => name of the store in our Database
 * @param  {} dataObject => data to be inserted in the store
 * @param  {} primaryKey => primary key for dataObject. Keep empty for auto-increment stores.
 * @param  {} valueKey => 'key' for the dataObject to be inserted. If none passed, then default value will be used.


##
```javascript
ReadObjectStoreById = function(ObjectStoreName, primaryKey)
```


  This is function reads the data based on the primary key from an ObjectStore in indexedDB.
 * @param  {} ObjectStoreName => Name of the store in our Database
 * @param  {} primaryKey => primary key of the record to be fetched

##

```javascript
ReadCompleteObjectStore = function(ObjectStoreName) 
```

 This is function reads the **complete** data from an ObjectStore in indexedDB.
 * @param  {} ObjectStoreName => Name of the store in our Database



##
```javascript
KeyExists = function(ObjectStoreName, primaryKey) 
```
 This is function checks if a primary key exists in an ObjectStore in indexedDB.
 * @param  {} ObjectStoreName => Name of the store in our Database
 * @param  {} primaryKey => primary key for the a particular record
 * This function checks if a primary Key exists in the indexedDB or not
 



##
```javascript

UpdateObjectStore = function(ObjectStoreName, primaryKey, appendObj, appendKey = '')
```


 This is function appends the data in an existing data entry in ObjectStore.

 * @param  {} ObjectStoreName => Name of the store in our Database
 * @param  {} primaryKey => primary key for the a particular record
 * @param  {} appendObj => Object to appended in the existing JSON
 * @param  {} appendKey = ' ' =>  Keep appendKey null if appendObj JSON already has a parent key, otherwise provide a key.




##
```javascript

DeleteRow = function(ObjectStoreName, primaryKey)
```
 This is function deletes a row/entry in an ObjectStore in indexedDB.

 * @param  {} ObjectStoreName => Name of the store in our Database
 * @param  {} primaryKey => primary key for the a particular record


##
```javascript

DeleteObjectStore = function(dbName, ObjectStoreName)
```


 This is function deletes an ObjectStore in indexedDB.
 * @param  {} dbName => Database Name
 * @param  {} ObjectStoreName => Name of the store in our Database


##
```javascript
DeleteDB = function(dbName)
 ```


 
This is function deletes the entire indexedDB database.
 * @param  {} dbName => Database Name

##


## License
<<<<<<< HEAD
[MIT](https://choosealicense.com/licenses/mit/)
=======
[MIT](https://choosealicense.com/licenses/mit/)
>>>>>>> 4fe60d5fd3be1d9f9c9f3dd8397f5c214f051ada
