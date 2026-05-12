import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useSearch } from "@tanstack/react-router";
import {
  AlertCircle,
  CheckCircle,
  Copy,
  Package,
  ShoppingBag,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../hooks/useAuth";
import { useAddOrder, useConfirmPayment } from "../hooks/useBackend";
import { useCartStore } from "../store/cartStore";

interface PendingStripeOrder {
  form: {
    name: string;
    phone: string;
    email: string;
    address: string;
    notes: string;
  };
  items: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    imageUrl: string;
  }[];
  grandTotal: number;
  createdAt: number;
}

type PageState = "loading" | "success" | "error";

export default function CheckoutSuccessPage() {
  const search = useSearch({ strict: false }) as Record<string, string>;
  const paymentIntentId = search.payment_intent as string | undefined;
  const paymentMethodParam = search.payment_method as string | undefined;
  const redirectStatus = search.redirect_status as string | undefined;

  const [pageState, setPageState] = useState<PageState>(
    paymentIntentId ? "loading" : "success",
  );
  const [errorMsg, setErrorMsg] = useState("");
  const [confirmedOrderId, setConfirmedOrderId] = useState<string | undefined>(
    undefined,
  );
  const [copied, setCopied] = useState(false);

  const confirmPaymentMutation = useConfirmPayment();
  const addOrderMutation = useAddOrder();
  const { clearCart } = useCartStore();
  const auth = useAuth();
  const ranRef = useRef(false);

  // Stripe redirects back here with ?payment_intent=...&redirect_status=succeeded
  useEffect(() => {
    if (!paymentIntentId) return;
    if (ranRef.current) return;
    ranRef.current = true;

    if (redirectStatus !== "succeeded") {
      setErrorMsg(
        redirectStatus === "failed"
          ? "Your payment was declined. Please try a different card."
          : "Payment was cancelled. Your cart has been preserved.",
      );
      setPageState("error");
      return;
    }

    async function finalizeStripeOrder() {
      try {
        // Retrieve pending order data saved before Stripe redirect
        const raw = sessionStorage.getItem("pending-stripe-order");
        if (!raw)
          throw new Error("Order data not found. Please contact support.");
        const pending = JSON.parse(raw) as PendingStripeOrder;
        sessionStorage.removeItem("pending-stripe-order");

        const tempId = pending.createdAt.toString();

        // 1. Confirm payment on backend
        await confirmPaymentMutation.mutateAsync({
          orderId: tempId,
          paymentIntentId: paymentIntentId!,
        });

        // 2. Create the order record with stripe payment method
        // Use logged-in user's email first, then form email, to link order to account
        const customerEmail = auth.email ?? (pending.form.email || "guest");
        await addOrderMutation.mutateAsync({
          id: tempId,
          customerId: customerEmail,
          items: pending.items,
          total: pending.grandTotal,
          status: "confirmed",
          createdAt: pending.createdAt,
          customerName: pending.form.name,
          customerPhone: pending.form.phone,
          deliveryAddress: pending.form.address,
          deliveryNote: pending.form.notes || undefined,
          customerPrincipal: null,
          paymentMethod: "stripe",
          stripePaymentIntentId: paymentIntentId!,
          stripePaymentStatus: null,
        });

        // 3. Clear cart after order saved
        clearCart();
        setConfirmedOrderId(tempId);
        setPageState("success");
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Failed to confirm your order.";
        setErrorMsg(msg);
        toast.error(msg);
        setPageState("error");
      }
    }

    void finalizeStripeOrder();
  }, [
    paymentIntentId,
    redirectStatus,
    confirmPaymentMutation.mutateAsync,
    addOrderMutation.mutateAsync,
    clearCart,
    auth.email,
  ]);

  const isStripe = !!paymentIntentId || paymentMethodParam === "stripe";
  const displayOrderId = confirmedOrderId ?? search.orderId;

  function handleCopyOrderId() {
    if (!displayOrderId) return;
    void navigator.clipboard.writeText(displayOrderId).then(() => {
      setCopied(true);
      toast.success("Order ID copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (pageState === "loading") {
    return (
      <div
        className="min-h-[70vh] flex flex-col items-center justify-center gap-6 px-4 py-16"
        data-ocid="checkout_success.loading_state"
      >
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
          <span className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
        <div className="text-center space-y-2">
          <Skeleton className="h-8 w-48 mx-auto" />
          <Skeleton className="h-4 w-64 mx-auto" />
        </div>
        <p className="text-muted-foreground text-sm">
          Confirming your payment…
        </p>
      </div>
    );
  }

  if (pageState === "error") {
    return (
      <div
        className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-16 gap-6"
        data-ocid="checkout_success.error_state"
      >
        <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
          <AlertCircle size={40} className="text-destructive" />
        </div>
        <div className="space-y-2 max-w-md">
          <h1 className="font-display text-3xl font-bold text-foreground">
            Payment Unsuccessful
          </h1>
          <p className="text-muted-foreground text-base leading-relaxed">
            {errorMsg || "Your payment could not be processed."}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 mt-2">
          <Link to="/cart">
            <Button
              className="bg-primary text-primary-foreground gap-2"
              data-ocid="checkout_success.retry_button"
            >
              <ShoppingBag size={16} />
              Return to Cart
            </Button>
          </Link>
          <Link to="/shop">
            <Button
              variant="outline"
              className="gap-2 border-primary/30 hover:bg-primary/10 hover:text-primary"
              data-ocid="checkout_success.shop_button"
            >
              Browse Products
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-16 gap-6"
      data-ocid="checkout_success.page"
    >
      {/* Icon */}
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center animate-fade-in">
        <CheckCircle size={40} className="text-primary" />
      </div>

      {/* Heading */}
      <div className="space-y-2 max-w-md">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground">
          Order Confirmed!
        </h1>
        <p className="text-muted-foreground text-base leading-relaxed">
          Thank you for shopping with Pretty Baked. Your delicious order is on
          its way!
        </p>
      </div>

      {/* Order ID — prominent copyable reference */}
      {displayOrderId && (
        <div
          className="bg-card border-2 border-primary/30 rounded-2xl px-7 py-5 text-center space-y-2 shadow-elevated w-full max-w-sm"
          data-ocid="checkout_success.order_id_card"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Your Order ID
          </p>
          <div className="flex items-center justify-center gap-2">
            <p
              className="font-display font-bold text-primary text-2xl sm:text-3xl tracking-wider"
              data-ocid="checkout_success.order_id"
            >
              {displayOrderId}
            </p>
            <button
              type="button"
              onClick={handleCopyOrderId}
              aria-label="Copy order ID"
              data-ocid="checkout_success.copy_order_id_button"
              className="p-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-colors duration-200 shrink-0"
            >
              {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            Save this ID to track or reference your order
          </p>
          <div className="pt-1 border-t border-border/60">
            {!isStripe && (
              <p className="text-muted-foreground text-xs flex items-center justify-center gap-1">
                Payment: Cash on Delivery
              </p>
            )}
            {isStripe && (
              <p className="text-muted-foreground text-xs flex items-center justify-center gap-1">
                <CheckCircle size={11} className="text-primary" />
                Payment: Card — Confirmed
              </p>
            )}
          </div>
        </div>
      )}

      {/* What's next */}
      <div className="bg-muted/40 rounded-xl px-6 py-5 max-w-sm text-left space-y-3 border border-border">
        <p className="font-display font-semibold text-foreground text-sm uppercase tracking-wider">
          What happens next?
        </p>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <Package size={15} className="mt-0.5 text-primary shrink-0" />
            Our team will confirm your order shortly.
          </li>
          <li className="flex items-start gap-2">
            <Package size={15} className="mt-0.5 text-primary shrink-0" />
            We'll prepare your freshly baked items with love.
          </li>
          <li className="flex items-start gap-2">
            <Package size={15} className="mt-0.5 text-primary shrink-0" />
            Your order will be delivered to your address.
          </li>
        </ul>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-3 mt-2">
        <Link to="/my-orders">
          <Button
            variant="default"
            className="bg-primary text-primary-foreground gap-2"
            data-ocid="checkout_success.my_orders_button"
          >
            <Package size={16} />
            View My Orders
          </Button>
        </Link>
        <Link to="/shop">
          <Button
            variant="outline"
            className="gap-2 border-primary/30 hover:bg-primary/10 hover:text-primary"
            data-ocid="checkout_success.shop_button"
          >
            <ShoppingBag size={16} />
            Continue Shopping
          </Button>
        </Link>
      </div>
    </div>
  );
}
