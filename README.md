## Requests quick doc

See the withepaper for any usage of the requests.<br/>
TypeORM code should obey https://orkhan.gitbook.io/typeorm/docs/mongodb.

### User

```
Prefix : /users
```

```
GET /
returns all users
```

```
POST /create {
  username: string
  clientRandomValue: string
  encryptedMasterKey: string
  hashedAuthenticationKey: string
  encryptedRsaPrivateSharingKey: string
  rsaPublicSharingKey: string
  email: string
  sessionIdentifiers: string[] (can be empty)
}
returns salt
```

```
POST /getSalt {
    username : string
}
returns salt
```

```
POST /login {
    username : srting
    derivedAuthenticationKey : string
}
returns salt
```

### File System

```
Prefix : /fileSystem
```

```
POST /uploadFile {
  file: file
  encryptedFile: string
  encryptedMetadata: string
  encryptedKey: string
  encryptedParentKey: string
  parentId: string
  userId: string
}
returns updated tree
```

```
POST /uploadFolder
```

```
POST /uploadRoot
```
