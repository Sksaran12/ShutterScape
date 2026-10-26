/**
 * ShutterScape Core TypeScript Definitions
 */

// Navigation Types
export interface NavItem {
  label: string;
  href: string;
  isExternal?: boolean;
}

// Activity & Event Types
export type EventType =
  | 'workshop'
  | 'exhibition'
  | 'photowalk'
  | 'contest'
  | 'challenge'
  | 'meeting';

export type ActivityStatus = 'upcoming' | 'ongoing' | 'completed';

export interface Activity {
  id: string;
  title: string;
  slug: string;
  description: string;
  eventType: EventType;
  status: ActivityStatus;
  eventDate: string;
  endDate?: string;
  venue: string;
  coverImage: {
    url: string;
    alt: string;
    caption?: string;
  };
  registrationUrl?: string;
  highlights?: string[];
  isFeatured?: boolean;
}

// Gallery & Photography Types
export type GalleryCategory =
  | 'Campus Life'
  | 'Landscape & Nature'
  | 'Portraits'
  | 'Street & Culture'
  | 'Events & Workshops'
  | 'Creative';

export interface ExifData {
  camera?: string;
  lens?: string;
  focalLength?: string;
  aperture?: string;
  shutterSpeed?: string;
  iso?: string;
  deviceType: 'Smartphone' | 'DSLR' | 'Mirrorless' | 'Other';
}

export interface GalleryItem {
  id: string;
  title: string;
  caption: string;
  photographer: {
    name: string;
    role?: string;
    instagram?: string;
  };
  image: {
    url: string;
    alt: string;
    width: number;
    height: number;
  };
  category: GalleryCategory;
  tags?: string[];
  exifData?: ExifData;
  isFeatured?: boolean;
  dateAdded: string;
}

// Team Member & Faculty Types
export type MemberCategory = 'faculty' | 'executive' | 'core' | 'alumni';

export interface ClubMember {
  id: string;
  name: string;
  role: string;
  category: MemberCategory;
  department: string;
  bio?: string;
  avatarUrl: string;
  displayOrder: number;
  tenure: string;
  socialLinks?: {
    instagram?: string;
    linkedin?: string;
    portfolio?: string;
    email?: string;
  };
}

// UI Component Props
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'accent' | 'neutral' | 'upcoming' | 'past' | 'outline';
  size?: 'sm' | 'md';
  className?: string;
}

export interface SectionHeadingProps {
  label?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
  className?: string;
  /** Small running index shown before the label, e.g. "01". */
  index?: string;
  /** Switches typography for the dark ink sections. */
  tone?: 'light' | 'dark';
  /** Use h1 for the page title, h2 for in-page sections (default). */
  as?: 'h1' | 'h2';
}

export interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  as?: 'div' | 'main' | 'section';
}
