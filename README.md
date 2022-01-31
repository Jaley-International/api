## How to upload a file

- **/api/fileSystem/uploadFile**<br><br>

Request :
```
{ "file": myfile.txt } // has to be a file, not a string
```
Response :
```
f7e8a4ae4df126954bf2222e2b60d9bd // random generated file name
```
<br>

- **/api/fileSystem/createFile**<br><br>

Request :
```
{
  "encryptedFileName" : "f7e8a4ae4df126954bf2222e2b60d9bd",
  "encryptedMetadata" : "imanencryptedfilemetadata",
  "encryptedKey" : "qwerty",
  "encryptedParentKey" : "azerty",
  "parentId" : 1,       // folder id in which the file is tored
  "treeOwnerId" : 1     // user owning the tree we want to add the file in
}
```
Response :
```
[
    {
        "id": 1,
        "encryptedKey": "azerty",
        "encryptedMetadata": "myworkspacemetadata",
        "type": "folder",
        "ref": null,
        "encryptedParentKey": null,
        "children": [
            {
                "id": 2,
                "encryptedKey": "qwerty",
                "encryptedMetadata": "imanencryptedfilemetadata",
                "type": "file",
                "ref": f7e8a4ae4df126954bf2222e2b60d9bd,
                "encryptedParentKey": "azerty",
                "children": []
            },
        ]
    },
]
```

## How to overwrite a file

- **/api/fileSystem/uploadFile**<br><br>

Request :
```
{ "file": myNewFile.txt } // has to be a file, not a string
```
Response :
```
2328f0be4c98c90abf329c687488fa46 // random generated file name
```
<br>

- **/api/fileSystem/overwriteFile**<br><br>

Request :
```
{
    "nodeId": 2,
    "treeOwnerId": 1,
    "newEncryptedFileName": "2328f0be4c98c90abf329c687488fa46"
}
```
Response :
```
[
    {
        "id": 1,
        "encryptedKey": "azerty",
        "encryptedMetadata": "myworkspacemetadata",
        "type": "folder",
        "ref": null,
        "encryptedParentKey": null,
        "children": [
            {
                "id": 2,
                "encryptedKey": "qwerty",
                "encryptedMetadata": "imanencryptedfilemetadata",
                "type": "file",
                "ref": 2328f0be4c98c90abf329c687488fa46,
                "encryptedParentKey": "azerty",
                "children": []
            },
        ]
    },
]
```
