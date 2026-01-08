const requireEnv = (name: string): string => {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing environment variable: ${name}`);
    }
    return value;
}

export const env = {
    LDAP_URL: requireEnv("LDAP_URL"),
    LDAP_BASE_DN: requireEnv("LDAP_BASE_DN"),
    LDAP_SERVICE_DN: requireEnv("LDAP_SERVICE_DN"),
    LDAP_SERVICE_PASSWORD: requireEnv("LDAP_SERVICE_PASSWORD"),
    PORT: Number(process.env.PORT ?? 3000)
};
