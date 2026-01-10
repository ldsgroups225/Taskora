export default {
  providers: [
    {
      // Replace with your own Clerk Issuer URL from your "convex" JWT template
      // format: https://clerk.your-domain.com or https://verb-noun-00.clerk.accounts.dev
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN || 'https://placeholder-clerk-domain.clerk.accounts.dev',
      applicationID: 'convex',
    },
  ],
}
