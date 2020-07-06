# ldap check

## Purpose

We want to check the users against LDAP to see if people are still within Philips

## Usage

### Generate `users.csv`

```
../varys/bin/varys users list | awk -F ' ' '{print $1 , $2}' > users.csv
```

### Run `check.sh`

Set environment variables:
`LDAP_URI`
`LDAP_BASE`
`LDAP_PASSWORD`
`LDAP_BIND_DN`

```
./check.sh
```
