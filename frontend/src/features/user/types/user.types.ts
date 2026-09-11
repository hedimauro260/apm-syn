export interface UserOnboarding {
  completed: boolean;
  skipped: boolean;
}

export interface User {
  id: string;
  clerkId: string;
  email: string | null;
  name: string | null;
  imageUrl: string | null;
  onboarding: UserOnboarding;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserInput {
  name?: string;
  onboarding?: {
    completed?: boolean;
    skipped?: boolean;
  };
}