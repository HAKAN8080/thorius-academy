import { CareerPathBuyButton } from "@/components/career-path/career-path-buy-button";
import { isPurchasableCareerPathProduct } from "@/lib/career-path/career-path-product-utils";
import type { CareerPathPurchaseState } from "@/lib/career-path/career-path-purchase-state";
import type { CareerPathWithProgress } from "@/lib/career-path/types";

interface CareerPathPanelPurchaseProps {
  path: CareerPathWithProgress;
  purchaseState: CareerPathPurchaseState;
}

export function CareerPathPanelPurchase({
  path,
  purchaseState,
}: CareerPathPanelPurchaseProps) {
  if (path.isEnrolled) {
    return null;
  }

  if (!isPurchasableCareerPathProduct(purchaseState.pathProduct)) {
    return null;
  }

  return (
    <div className="mt-4 rounded-xl border border-primary-100 bg-white p-4">
      <p className="text-sm text-muted-foreground">
        Bu yolu panelde takip etmek için paketi satın alın. İlk kurs hemen
        açılır; sonraki adımlar tamamladıkça açılır.
      </p>
      <div className="mt-3">
        <CareerPathBuyButton
          pathSlug={path.slug}
          pathProduct={purchaseState.pathProduct!}
          isLoggedIn={purchaseState.isLoggedIn}
          customer={purchaseState.customer}
          stepCount={path.totalSteps}
          layout="inline"
        />
      </div>
    </div>
  );
}
