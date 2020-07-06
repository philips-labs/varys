#!/bin/bash

URI=${LDAP_URI}
BASE=${LDAP_BASE}
PASSWORD=${LDAP_PASSWORD}
BIND_DN=${LDAP_BIND_DN}
OUTPUT_DIR="report"

checkUser() {
  FILTER="(sAMAccountName=$1)"

  ldapsearch -x -D ${BIND_DN} -w ${PASSWORD}  -H ${URI} -b ${BASE} ${FILTER} -LLL sAMAccountName | grep "sAMAccountName:" > /dev/null
  if [ $? -eq 0 ]; then
    echo $1 >> ${OUTPUT_DIR}/users-valid.txt
  else
    echo User $1 NOT found.
    echo $1 >> ${OUTPUT_DIR}/user-no-valid.txt
  fi
}

checkUserFile() {
  while IFS=" " read -r USERID CODE1
  do
    checkUser $CODE1
  done < <(tail -n +2 $1)
}



mkdir -p ${OUTPUT_DIR}
checkUserFile users.csv
