import { PageLoadingTransition } from '@/components/animation';

export default function ProductDetailLoading() {
  return <PageLoadingTransition message="Loading product details..." />;
}