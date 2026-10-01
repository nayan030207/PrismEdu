import { LoadingScreen } from '@/components/ui/loading-screen';

export default function AuthLoading() {
  return <LoadingScreen message="Loading Authentication Portal..." fullScreen={true} />;
}
