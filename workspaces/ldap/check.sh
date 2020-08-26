#!/bin/bash

URI=${LDAP_URI}
BASE=${LDAP_BASE}
PASSWORD=${LDAP_PASSWORD}
BIND_DN=${LDAP_BIND_DN}
OUTPUT_DIR="report"

showMail() {
  echo "$ldapresult" | grep -o 'mail:[^,]\+' | grep -o '[^:]\+$'
}

showAccount() {
  echo "$ldapresult" | grep -o 'sAMAccountName:[^,]\+' | grep -o '[^:]\+$'
}

showDepartment() {
  echo "$ldapresult" | grep -o 'department:[^,]\+' | grep -o '[^:]\+$'
}

# Disabled
showExtensionAttribute14() {
  echo "$ldapresult" | grep -o 'extensionAttribute14:[^,]\+' | grep -o '[^:]\+$'
}

# Cost Center
showExtensionAttribute15() {
  echo "$ldapresult" | grep -o 'extensionAttribute15:[^,]\+' | grep -o '[^:]\+$'
}


checkUser() {
  FILTER="(sAMAccountName=$1)"

  ldapresult=$(ldapsearch -x -D ${BIND_DN} -w ${PASSWORD}  -H ${URI} -b ${BASE} ${FILTER} -LLL sAMAccountName extensionAttribute14 extensionAttribute15 mail department)

  echo "$ldapresult" | grep 'sAMAccountName:' > /dev/null
  if [ $? -eq 0 ]; then
    disabled=$(showExtensionAttribute14)
    # Functional accounts do not have the disabled attribute 14 set.
    if [ -z $disabled ] || [ "$disabled" -eq "0" ]; then
      echo "$(showAccount),$(showMail),$(showExtensionAttribute15),$(showDepartment), $2" >> ${OUTPUT_DIR}/users-valid.txt
    else
      echo Account User $1 / $2 / $(showMail) is disabled.
      echo $1, $2 >> ${OUTPUT_DIR}/user-no-valid.txt
    fi
  else
    echo User $1 / $2 NOT found.
    echo $1, $2 >> ${OUTPUT_DIR}/user-no-valid.txt
  fi
}

checkUserFile() {
  while IFS=" " read -r USERID CODE1
  do
    checkUser $CODE1 $USERID
  done < <(cat $1 | sed '1,/USERID/d')
}



mkdir -p ${OUTPUT_DIR}
checkUserFile users.csv
