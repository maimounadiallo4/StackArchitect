/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  siReact,
  siNextdotjs,
  siVuedotjs,
  siNuxt,
  siSvelte,
  siAngular,
  siRemix,
  siAstro,
  siFastapi,
  siNestjs,
  siExpress,
  siDjango,
  siLaravel,
  siSpringboot,
  siGo,
  siRubyonrails,
  siFlutter,
  siSwift,
  siKotlin,
  siPostgresql,
  siSupabase,
  siMongodb,
  siMysql,
  siRedis,
  siSqlite,
  siClerk,
  siAuth0,
  siFirebase,
  siCloudflare,
  siCloudflareworkers,
  siGooglecloud,
  siGooglecloudstorage,
  siStripe,
  siLemonsqueezy,
  siRabbitmq,
  siApachekafka,
  siGooglegemini,
  siLangchain,
  siMeilisearch,
  siElasticsearch,
  siAlgolia,
  siSentry,
  siDatadog,
  siPosthog,
  siVercel,
  siRailway,
  siKubernetes,
  siGithubactions,
  siDocker,
  siResend,
} from "simple-icons";

export interface BrandLogo {
  title: string;
  hex: string;
  path: string;
}

/**
 * Maps a catalog Technology `id` to its official brand mark (via simple-icons).
 * A handful of brands (AWS/Amazon family, Twilio, OpenAI, Pinecone, Dragonfly,
 * Auth.js) have no mark available in the dataset — components fall back to the
 * generic lucide icon for those.
 */
export const TECH_LOGOS: Record<string, BrandLogo> = {
  react: siReact,
  nextjs: siNextdotjs,
  vue: siVuedotjs,
  nuxt: siNuxt,
  svelte: siSvelte,
  sveltekit: siSvelte,
  angular: siAngular,
  remix: siRemix,
  astro: siAstro,

  fastapi: siFastapi,
  nestjs: siNestjs,
  express: siExpress,
  django: siDjango,
  laravel: siLaravel,
  springboot: siSpringboot,
  gin: siGo,
  rails: siRubyonrails,

  reactnative: siReact,
  flutter: siFlutter,
  swift: siSwift,
  kotlin: siKotlin,

  postgresql: siPostgresql,
  supabase_db: siSupabase,
  mongodb: siMongodb,
  mysql: siMysql,
  redis_db: siRedis,
  sqlite: siSqlite,

  clerk: siClerk,
  auth0: siAuth0,
  supabase_auth: siSupabase,
  firebase_auth: siFirebase,

  redis: siRedis,
  cloudflare_kv: siCloudflareworkers,

  cloudflare_r2: siCloudflare,
  gcs: siGooglecloudstorage,

  stripe: siStripe,
  lemonsqueezy: siLemonsqueezy,

  rabbitmq: siRabbitmq,
  kafka: siApachekafka,

  gemini: siGooglegemini,
  langchain: siLangchain,

  meilisearch: siMeilisearch,
  elasticsearch: siElasticsearch,
  algolia: siAlgolia,

  sentry: siSentry,
  datadog: siDatadog,
  posthog: siPosthog,

  vercel: siVercel,
  gcp_cloudrun: siGooglecloud,
  railway: siRailway,
  kubernetes: siKubernetes,

  github_actions: siGithubactions,
  docker: siDocker,

  resend: siResend,
};

export function getTechLogo(techId: string): BrandLogo | undefined {
  return TECH_LOGOS[techId];
}
