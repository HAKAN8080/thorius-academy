"use client";

import Link from "next/link";
import { EnrollButton } from "@/components/enrollment/enroll-button";
import { BuyButton } from "@/components/course/buy-button";
import { Button } from "@/components/ui/button";
import { isFreeCourseProduct, isPurchasableCourseProduct } from "@/lib/course/course-product-utils";
import type { CheckoutCustomer } from "@/lib/course/checkout-url";
import type { CourseProduct } from "@/types/course-product";

interface CoursePurchaseCtaProps {
  courseId: number;
  courseSlug: string;
  courseTitle: string;
  courseImage?: string | null;
  courseCategory?: string | null;
  instructorName?: string | null;
  isLoggedIn: boolean;
  isAlreadyEnrolled: boolean;
  courseProduct: CourseProduct | null;
  customer: CheckoutCustomer | null;
  isFreeYoutubeCourse?: boolean;
}

export function CoursePurchaseCta({
  courseId,
  courseSlug,
  courseTitle,
  courseImage,
  courseCategory,
  instructorName,
  isLoggedIn,
  isAlreadyEnrolled,
  courseProduct,
  customer,
  isFreeYoutubeCourse = false,
}: CoursePurchaseCtaProps) {
  if (isAlreadyEnrolled) {
    return (
      <EnrollButton
        courseId={courseId}
        courseSlug={courseSlug}
        courseTitle={courseTitle}
        courseImage={courseImage}
        courseCategory={courseCategory}
        instructorName={instructorName}
        isLoggedIn={isLoggedIn}
        isAlreadyEnrolled={true}
      />
    );
  }

  if (courseProduct && isPurchasableCourseProduct(courseProduct)) {
    return (
      <BuyButton
        wcProductId={courseProduct.wc_product_id}
        priceNormal={courseProduct.price_normal}
        priceSale={courseProduct.price_sale}
        courseSlug={courseSlug}
        isLoggedIn={isLoggedIn}
        customer={customer}
      />
    );
  }

  if (courseProduct && isFreeCourseProduct(courseProduct)) {
    return (
      <EnrollButton
        courseId={courseId}
        courseSlug={courseSlug}
        courseTitle={courseTitle}
        courseImage={courseImage}
        courseCategory={courseCategory}
        instructorName={instructorName}
        isLoggedIn={isLoggedIn}
        isAlreadyEnrolled={false}
      />
    );
  }

  if (isFreeYoutubeCourse) {
    return (
      <EnrollButton
        courseId={courseId}
        courseSlug={courseSlug}
        courseTitle={courseTitle}
        courseImage={courseImage}
        courseCategory={courseCategory}
        instructorName={instructorName}
        isLoggedIn={isLoggedIn}
        isAlreadyEnrolled={false}
      />
    );
  }

  return (
    <div className="rounded-xl border border-primary-100 bg-primary-50/80 p-4 text-center">
      <p className="text-sm font-medium text-primary-900">
        Bu kurs şu an satın alınamıyor
      </p>
      <p className="mt-1 text-xs text-primary-600">
        Fiyat bilgisi güncelleniyor olabilir. Destek ekibimiz size yardımcı
        olur.
      </p>
      <Button asChild variant="outline" size="sm" className="mt-3">
        <Link href="/iletisim">İletişime geçin</Link>
      </Button>
    </div>
  );
}
