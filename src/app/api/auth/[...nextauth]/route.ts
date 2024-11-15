import NextAuth, { AuthOptions } from "next-auth"
import { OAuthConfig, OAuthUserConfig } from "next-auth/providers/oauth"

interface AzureB2CProfile extends Record<string, number | string> {
    exp: number
    nbf: number
    ver: string
    iss: string
    sub: string
    aud: string
    iat: number
    auth_time: number
    name: string
    email: string
  }
  
function AzureADB2CProvider<P extends AzureB2CProfile>(
    options: OAuthUserConfig<P> & {
      primaryUserFlow?: string
      tenantId?: string
    }
  ): OAuthConfig<P> {
    const { tenantId, primaryUserFlow } = options
    const issuer =
      options.issuer ??
      `https://${tenantId}.b2clogin.com/${tenantId}.onmicrosoft.com/${primaryUserFlow}/v2.0`
    return {
      id: "azure-ad-b2c",
      name: "Azure Active Directory B2C",
      type: "oauth",
      wellKnown: `${issuer}/.well-known/openid-configuration`,
      idToken: true,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: null,
        }
      },
      style: { logo: "/azure.svg", text: "#fff", bg: "#0072c6" },
      options,
    }
  }


export const authOptions: AuthOptions = {
    session: {
        strategy: "jwt",
    },
    providers: [
        AzureADB2CProvider({
        clientId: process.env.AZURE_AD_B2C_CLIENT_ID!,
        clientSecret: process.env.AZURE_AD_B2C_CLIENT_SECRET!,
        tenantId: process.env.AZURE_AD_B2C_TENANT_NAME!,
        primaryUserFlow: process.env.AZURE_AD_B2C_PRIMARY_USER_FLOW,
        authorization: {
            params: {
                scope: process.env.AZURE_AD_B2C_CLIENT_ID! + " offline_access openid",
            },
        },
        }),
    ],
    callbacks: {
        async jwt({ token, account }) {
          // Add the access token to the token object if available
          if (account) {
            token.accessToken = account.access_token; // Save the access token
          }
          return token;
        },
        async session({ session, token }) {
          // Attach the access token to the session object
          session.accessToken = token.accessToken;
          return session;
        },
      },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };