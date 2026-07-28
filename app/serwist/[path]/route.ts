import { createSerwistRoute } from "@serwist/turbopack";

export const {
  dynamic,
  dynamicParams,
  revalidate,
  generateStaticParams,
  GET,
} = createSerwistRoute({
  swSrc: "app/sw.ts",
  additionalPrecacheEntries: [
    {
      url: "/offline",
      revision: process.env.VERCEL_GIT_COMMIT_SHA ?? Date.now().toString(),
    },
  ],
  useNativeEsbuild: true,
});
