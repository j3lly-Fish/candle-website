import { PageLoadingTransition } from '@/components/animation';

export default function CheckoutLoading() {
  return <PageLoadingTransition message="Preparing checkout..." />;
}