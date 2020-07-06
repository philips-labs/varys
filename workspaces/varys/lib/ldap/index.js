import ldap from 'ldapjs';

export const userLDAP = (code1, config) => {
  const {uri, base, bindDN, password} = config.ldap

  const client = ldap.createClient({
    url: uri
  });

  client.bind(base, password, function(err) {
    assert.ifError(err);
  });
  return true
}

