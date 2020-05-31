const dbObject =
	window.indexedDB || window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
var request;
var db;
/* this method should be called during the initial app loading time...
this will create the localDB and inside it a ObjectStore with keypath 'id'. */
/**
 * @param  {} dbName
 * @param  {} version
 * @param  {} ObjectStoreName
 */
exports.InitDB = function(dbName, version) {
	request = dbObject.open(dbName, version);
	request.onerror = (e) => {
		console.log(`Error opening database:${e}`);
	};
	request.onsuccess = (e) => {
		db = request.result;
		localStorage.setItem('dbVer', version);
		console.log(`Database successfully opened : ${e}`);
	};
};
/* 
	This function will be called to create store for new Location { school, phc etc}
*/
/**
 * @param  {} dbName
 * @param  {} ObjectStoreName
 * @param  {} isAutoIncrement=true
 */
exports.CreateObjectStore = function(dbName, ObjectStoreName, isAutoIncrement = true) {
	const curVer = localStorage.getItem('dbVer');
	return new Promise(function(resolve) {
		db.close();
		request = dbObject.open(dbName, parseInt(curVer) + 1);
		request.onerror = (e) => {
			console.log(e);
		};
		request.onsuccess = (e) => {
			db = request.result;
			console.log(e);
		};
		request.onupgradeneeded = (e) => {
			db = e.target.result;
			if (isAutoIncrement === true) {
				db.createObjectStore(ObjectStoreName, { autoIncrement: true });
			} else {
				db.createObjectStore(ObjectStoreName, { keyPath: 'id' });
			}
			localStorage.setItem('dbVer', parseInt(curVer) + 1);
			resolve();
		};
	});
};

/* insert (dataObject) into the new store( ObjectStoreName)
	* this method should be called when we download the school to create the records for the 'First Time' in the localdb. To update or edit , UpdateObjectStore() should be called.
    * format of "dataObject" should be like this everywhere...where "student_det" is the 'key' {or can be understood as table name (refer to dbstatement.js) } for every jsonObject you push for a particular record..
  */

/**
 * @param  {} ObjectStoreName
 * @param  {} dataObject
 * @param  {} primaryKey
 * @param  {} valueKey
 */
exports.InsertObjectStore = function(ObjectStoreName, dataObject, primaryKey = '', valueKey = 'data') {
	if (db.objectStoreNames.contains(ObjectStoreName)) {
		try {
			const tx = db.transaction(ObjectStoreName, 'readwrite');
			const store = tx.objectStore(ObjectStoreName);
			if (primaryKey == '') {
				store.add({ [valueKey]: dataObject });
			} else {
				store.add({ id: primaryKey, [valueKey]: dataObject });
			}
			tx.oncomplete = () => {
				console.log('Insert operation completed !');
			};
		} catch (error) {
			console.log(' error in insert operation ' + error);
		}
	} else {
		console.log('ObjectStoreName not found');
	}
};

/* Read from exiting store
  * findIdByKeyPath is optional parameter. It is the Key value or primary key of indexed db.
  * This method is used to read the data based on primary keypath ID i.e. "locationID.personID" .
  */
/**
 * @param  {} ObjectStoreName
 * @param  {} findIdByKeyPath
 */
exports.ReadObjectStoreById = function(ObjectStoreName, primaryKey) {
	return new Promise(function(resolve, reject) {
		const tx = db.transaction(ObjectStoreName);
		const currentObjectStore = tx.objectStore(ObjectStoreName);
		const req = currentObjectStore.get(primaryKey);
		req.onsuccess = function(event) {
			try {
				const data = event.target.result;
				resolve(data);
			} catch (error) {
				console.log('error in read operation: ' + error);
			}
		};
	});
};

/**
 * @param  {} ObjectStoreName
 */
exports.ReadCompleteObjectStore = function(ObjectStoreName) {
	return new Promise(function(resolve, reject) {
		const tx = db.transaction(ObjectStoreName);
		const currentObjectStore = tx.objectStore(ObjectStoreName);
		const req = currentObjectStore.getAll();
		req.onsuccess = function(event) {
			try {
				const data = event.target.result;
				resolve(data);
			} catch (error) {
				console.log('error in read operation: ' + error);
			}
		};
	});
};

/**
   *  This method is used to search the records based on keyName eg. student Fname, student Lname
   *  JsonObjectName ==> tableName (eg. student_det)
   *  KeyName ===> name of the key to search (eg. Fname , Age ,StudentGUID )
   *  Keyvalue ===> value you are looking for (" akash" , 24, 4321231 )
   */

function recFindKey(obj, key) {
	let flag = false;
	if (obj instanceof Object) {
		for (let k in obj) {
			if (obj.hasOwnProperty(k)) {
				if (k == key) {
					console.log('FOUND');
					return true;
				} else return recFindKey(obj[k], key);
			}
		}
	}
}

/**
 * @param  {} ObjectStoreName
 * @param  {} JsonObjectName
 * @param  {} KeyName
 * @param  {} Keyvalue
 */
exports.SearchByKeyName = function(ObjectStoreName, JsonObjectName, KeyName, Keyvalue) {
	const tx = db.transaction(ObjectStoreName);
	const currentObjectStore = tx.objectStore(ObjectStoreName);
	let result = [];
	return new Promise(function(resolve, reject) {
		currentObjectStore.openCursor().onsuccess = (e) => {
			const cursor = e.target.result;
			if (cursor) {
				// if (cursor.value.hasOwnProperty(JsonObjectName)) {
				// 	if (cursor.value[JsonObjectName].hasOwnProperty(KeyName)) {
				// 		if (cursor.value[JsonObjectName][KeyName] == Keyvalue) {
				// 			result.push(cursor.value);
				// 		}
				// 	}
				// }
				let json = cursor.value;
				let isFound = recFindKey(json, JsonObjectName);
				if (isFound == true) resolve(true);
				cursor.continue();
			} else {
				resolve(false);
			}
		};
	});
};
/**
 * @param  {} ObjectStoreName
 * @param  {} primaryKey
 * This function checks if a primary Key exists in the indexedDB or not
 */
exports.KeyExists = function(ObjectStoreName, primaryKey) {
	const transaction = db.transaction(ObjectStoreName, 'readwrite');
	const objectStore = transaction.objectStore(ObjectStoreName);
	const req = objectStore.get(primaryKey);
	return new Promise(function(resolve) {
		req.onsuccess = function(event) {
			const data = event.target.result;
			if (data == undefined) {
				resolve(false);
			} else {
				resolve(true);
			}
		};
	});
};

/* update in exiting storeObject
  * This function should be called to append data(JSONobjects) to an exisiting row based on keyPath 'id'
  * eg. keyPathId = 100.123 => you can append new jsonObj in it.
  *
*/

/**
 * @param  {} ObjectStoreName
 * @param  {} primaryKey
 * @param  {} appendObj
 * @param  {} appendKey=''
 */
exports.UpdateObjectStore = function(ObjectStoreName, primaryKey, appendObj, appendKey = '') {
	const transaction = db.transaction(ObjectStoreName, 'readwrite');
	const objectStore = transaction.objectStore(ObjectStoreName);
	const req = objectStore.get(primaryKey);
	req.onsuccess = function(event) {
		try {
			const data = event.target.result;
			let KeyForAppendObj;
			if (appendKey == '') {
				KeyForAppendObj = Object.keys(appendObj)[0];
				data[KeyForAppendObj] = appendObj[KeyForAppendObj];
			} else {
				KeyForAppendObj = appendKey;
				data[KeyForAppendObj] = appendObj;
			}
			const requestUpdate = objectStore.put(data);
			requestUpdate.onsuccess = (e) => {
				console.log(` success in update ${e}`);
			};
			requestUpdate.onerror = (e) => {
				console.log(`error in update ${e}`);
			};
		} catch (error) {
			console.log('error in update operation: ' + error);
		}
	};
	req.onerror = function(e) {
		console.log('error in update operation: ' + e);
	};
};

/* update in exiting store object datarow based on a key,value pair
  * eg. keyPathId = 100.123 => inside its value part, you can go ahead and update the 'ObjectKeyToBeUpdated' with a new 'newValue'
*/
/**
 * @param  {} ObjectStoreName
 * @param  {} primaryKey
 * @param  {} ObjectKeyToBeUpdated
 * @param  {} newValue
 */
exports.UpdateObjectStoreByKey = function(ObjectStoreName, primaryKey, ObjectKeyToBeUpdated, newValue) {
	const transaction = db.transaction(ObjectStoreName, 'readwrite');
	const objectStore = transaction.objectStore(ObjectStoreName);
	const req = objectStore.get(primaryKey.key.join('.'));
	req.onsuccess = function(event) {
		const data = event.target.result;
		data[ObjectKeyToBeUpdated] = newValue;
		const requestUpdate = objectStore.put(data);
		requestUpdate.onsuccess = (e) => {
			console.log(`success in update ${e}`);
		};
		requestUpdate.onerror = (e) => {
			console.log(`error in update ${e}`);
		};
	};
};

/**
 * @param  {} ObjectStoreName
 * @param  {} primaryKey
 */
exports.DeleteRow = function(ObjectStoreName, primaryKey) {
	const tx = db.transaction(ObjectStoreName, 'readwrite');
	const store = tx.objectStore(ObjectStoreName).delete(primaryKey); // 1 is "keyPathId" here for row no. in the store
	tx.oncomplete = (e) => {
		console.log(`deleted successfully ${e}`);
	};
};
/**
 * @param  {} dbName
 * @param  {} ObjectStoreName
 */
exports.DeleteObjectStore = function(dbName, ObjectStoreName) {
	const curVer = localStorage.getItem('dbVer');
	return new Promise(function(resolve) {
		db.close();
		request = dbObject.open(dbName, parseInt(curVer) + 1);
		request.onerror = (e) => {
			console.log(e);
		};
		request.onsuccess = (e) => {
			db = request.result;
			console.log(e);
		};
		request.onupgradeneeded = (e) => {
			console.log('inside onupgrade');
			db = e.target.result;
			localStorage.setItem('dbVer', parseInt(curVer) + 1);
			db.deleteObjectStore(ObjectStoreName);
			resolve();
		};
	});
};
/**
 * @param  {} dbName
 */
exports.DeleteDB = function(dbName) {
	return new Promise(function(resolve, reject) {
		const DBDeleteRequest = dbObject.deleteDatabase(dbName);
		db.close();
		DBDeleteRequest.onerror = function(event) {
			console.log('Error deleting database.');
			reject();
		};

		DBDeleteRequest.onsuccess = function(event) {
			console.log(`${dbName} is deleted !`);
			resolve();
		};
		DBDeleteRequest.onblocked = function() {
			console.log("Couldn't delete database due to the operation being blocked");
		};
	});
};
