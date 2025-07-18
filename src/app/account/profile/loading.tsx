import { PageLoadingTransition } from '@/components/animation';

export default function ProfileLoading() {
  return <PageLoadingTransition message="Loading your profile..." />;
}