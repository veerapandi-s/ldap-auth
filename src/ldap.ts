import { Client } from "ldapts";
import { env } from "./env";


interface User {
  dn: string;
  uid: string;
  name: string;
  lastName: string;
  email: string;

  firstName?: string;
  displayName?: string;
  employeeNumber?: string;
  mobile?: string;
  telephoneNumber?: string;
  title?: string;
  department?: string;
  ou?: string;
  manager?: string;
}


export const getSingleValue = (
  value?: string | string[] | Buffer | Buffer[]
): string | undefined => {
  if (!value) return undefined;

  if (Array.isArray(value)) {
    const first = value[0];
    return Buffer.isBuffer(first) ? first.toString("utf8") : first;
  }

  return Buffer.isBuffer(value) ? value.toString("utf8") : value;
}


export const authenticateUser = async (
  uid: string,
  password: string
): Promise<User | null> => {

  let userDN: string | null = null;

  const serviceClient = new Client({
    url: env.LDAP_URL,
    timeout: 5000,
    connectTimeout: 5000,
    tlsOptions: { rejectUnauthorized: false }
  });

  try {
    await serviceClient.bind(
      env.LDAP_SERVICE_DN,
      env.LDAP_SERVICE_PASSWORD
    );

    const { searchEntries } = await serviceClient.search(
      `ou=users,${env.LDAP_BASE_DN}`,
      {
        scope: "sub",
        filter: `(uid=${uid})`,
        attributes: ["dn"]
      }
    );


    if (searchEntries.length === 0) {
      console.debug("USER NOT FOUND");
      return null;
    }

    userDN = searchEntries[0].dn;
  } catch (e) {
    console.error("SERVICE PHASE ERROR", e);
    return null;
  } finally {
    await serviceClient.unbind();
  }

  const userClient = new Client({
    url: env.LDAP_URL,
    timeout: 5000,
    connectTimeout: 5000,
    tlsOptions: { rejectUnauthorized: false }
  });

  try {
    await userClient.bind(userDN!, password);
    const { searchEntries } = await userClient.search(
      userDN,
      {
        scope: "base",
        attributes: ["cn", "mail", "givenName", "sn", "displayName","uid","employeeNumber", "mobile", "telephoneNumber","title", "department", "ou","manager"]
      }
    );

    const user = searchEntries[0];


    return {
      dn: userDN,
      name: getSingleValue(user.cn)!,
      email: getSingleValue(user.mail)!,
      firstName: getSingleValue(user.givenName),
      lastName: getSingleValue(user.sn)!,
      displayName: getSingleValue(user.displayName),
      uid: getSingleValue(user.uid)!,
      employeeNumber: getSingleValue(user.employeeNumber),
      mobile: getSingleValue(user.mobile),
      telephoneNumber: getSingleValue(user.telephoneNumber),
      title: getSingleValue(user.title),
      department: getSingleValue(user.department),
      ou: getSingleValue(user.ou),
      manager: getSingleValue(user.manager)
    };
  } catch (e) {
    console.error("USER BIND FAILED", e);
    return null;
  } finally {
    await userClient.unbind();
  }
};
