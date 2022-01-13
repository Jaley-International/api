## Current Requests

See the withepaper for any usage of the requests.

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
