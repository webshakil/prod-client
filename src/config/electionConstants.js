// Election-related constants

export const VOTING_TYPES = {
  PLURALITY: 'plurality',
  RANKED_CHOICE: 'ranked_choice',
  APPROVAL: 'approval'
};

export const PERMISSION_TYPES = {
  PUBLIC: 'public',
  COUNTRY_SPECIFIC: 'country_specific',
  ORGANIZATION_ONLY: 'organization_only'
};

export const PRICING_TYPES = {
  FREE: 'free',
  GENERAL_FEE: 'general_fee',
  REGIONAL_FEE: 'regional_fee'
};

export const ELECTION_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

export const QUESTION_TYPES = {
  MULTIPLE_CHOICE: 'multiple_choice',
  OPEN_TEXT: 'open_text',
  IMAGE_BASED: 'image_based'
};

export const CREATOR_TYPES = {
  INDIVIDUAL: 'individual',
  ORGANIZATION: 'organization',
  CONTENT_CREATOR: 'content_creator'
};

export const AUTHENTICATION_METHODS = {
  PASSKEY: 'passkey',
  OAUTH: 'oauth',
  MAGIC_LINK: 'magic_link',
  EMAIL_PASSWORD: 'email_password'
};

export const REGIONAL_ZONES = [
  { code: 'US', name: 'United States', currency: 'USD' },
  { code: 'EU', name: 'European Union', currency: 'EUR' },
  { code: 'UK', name: 'United Kingdom', currency: 'GBP' },
  { code: 'CA', name: 'Canada', currency: 'CAD' },
  { code: 'AU', name: 'Australia', currency: 'AUD' },
  { code: 'JP', name: 'Japan', currency: 'JPY' },
  { code: 'CN', name: 'China', currency: 'CNY' },
  { code: 'IN', name: 'India', currency: 'INR' }
];

export const FILE_SIZE_LIMITS = {
  IMAGE: 5 * 1024 * 1024, // 5MB
  VIDEO: 50 * 1024 * 1024, // 50MB
  LOGO: 2 * 1024 * 1024 // 2MB
};

export const FILE_TYPES = {
  IMAGE: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  VIDEO: ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo']
};

export default {
  VOTING_TYPES,
  PERMISSION_TYPES,
  PRICING_TYPES,
  ELECTION_STATUS,
  QUESTION_TYPES,
  CREATOR_TYPES,
  AUTHENTICATION_METHODS,
  REGIONAL_ZONES,
  FILE_SIZE_LIMITS,
  FILE_TYPES
};