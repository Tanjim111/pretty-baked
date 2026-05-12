import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useRouter } from "@tanstack/react-router";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { useMemo } from "react";
import { toast } from "sonner";
import { useAuth } from "../hooks/useAuth";
import {
  useGetMyWishlist,
  useProducts,
  useRemoveFromWishlist,
} from "../hooks/useBackend";
import { useCartStore } from "../store/cartStore";
import type { Product } from "../types";

function WishlistProductCard({
  product,
  onRemove,
  onAddToCart,
  removing,
}: {
  product: Product;
  onRemove: () => void;
  onAddToCart: () => void;
  removing: boolean;
}) {
  return (
    <Card
      className="group overflow-hidden border-border hover-lift bg-card h-full flex flex-col"
      data-ocid={`wishlist.product_card.${product.id}`}
    >
      {/* Image */}
      <div className="relative overflow-hidden bg-muted">
        <div className="aspect-square">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-smooth"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "/assets/images/placeholder.svg";
            }}
          />
        </div>

        {/* Remove from wishlist button */}
        <button
          type="button"
          onClick={onRemove}
          disabled={removing}
          aria-label={`Remove ${product.name} from wishlist`}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-card/90 backdrop-blur-sm shadow-sm flex items-center justify-center border border-border hover:bg-destructive hover:border-destructive hover:text-destructive-foreground text-foreground transition-colors disabled:opacity-50"
          data-ocid={`wishlist.remove_button.${product.id}`}
        >
          {removing ? (
            <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <Trash2 size={13} />
          )}
        </button>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.isFeatured && (
            <Badge className="text-[9px] px-1.5 bg-primary text-primary-foreground">
              ⭐ Featured
            </Badge>
          )}
          {!product.isAvailable && (
            <Badge variant="secondary" className="text-[9px] px-1.5">
              Out of Stock
            </Badge>
          )}
        </div>
      </div>

      <CardContent className="p-4 flex flex-col flex-1 gap-2">
        <Link
          to="/shop/$productId"
          params={{ productId: product.id }}
          data-ocid={`wishlist.product_link.${product.id}`}
        >
          <h3 className="font-display text-sm font-bold text-foreground text-center uppercase tracking-wide leading-tight line-clamp-2 hover:text-primary transition-smooth">
            {product.name}
          </h3>
        </Link>

        <p className="text-center font-display font-bold text-primary text-lg">
          ৳{product.price.toLocaleString()}
        </p>

        <Button
          size="sm"
          className="w-full text-xs bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 transition-smooth mt-auto"
          onClick={onAddToCart}
          disabled={!product.isAvailable}
          data-ocid={`wishlist.add_to_cart_button.${product.id}`}
        >
          <ShoppingBag size={12} />
          {product.isAvailable ? "Add to Cart" : "Unavailable"}
        </Button>
      </CardContent>
    </Card>
  );
}

export default function WishlistPage() {
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);

  const { data: wishlistIds = [], isLoading: wishlistLoading } =
    useGetMyWishlist();
  const { data: allProducts = [], isLoading: productsLoading } = useProducts();
  const removeFromWishlist = useRemoveFromWishlist();

  const isLoading = wishlistLoading || productsLoading;

  // Filter products to only those in the wishlist
  const wishlistProducts = useMemo(() => {
    const idSet = new Set(wishlistIds.map(String));
    return allProducts.filter((p) => idSet.has(p.id));
  }, [allProducts, wishlistIds]);

  // Login required — redirect
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div
          className="text-center py-16 px-8 max-w-sm mx-auto"
          data-ocid="wishlist.login_prompt"
        >
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
            <Heart size={28} className="text-primary" />
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">
            Save Your Favourites
          </h2>
          <p className="text-muted-foreground text-sm mb-6">
            Log in to view and manage your wishlist.
          </p>
          <Button
            onClick={() => router.navigate({ to: "/" })}
            className="gap-2 bg-primary hover:bg-primary/90"
            data-ocid="wishlist.login_button"
          >
            Log In to Continue
          </Button>
        </div>
      </div>
    );
  }

  function handleRemove(product: Product) {
    removeFromWishlist.mutate(Number(product.id), {
      onSuccess: () => {
        toast.success(`${product.name} removed from wishlist`);
      },
      onError: () => {
        toast.error("Failed to remove from wishlist");
      },
    });
  }

  function handleAddToCart(product: Product) {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      imageUrl: product.imageUrl,
    });
    toast.success(`${product.name} added to cart!`);
  }

  return (
    <div className="min-h-screen bg-background" data-ocid="wishlist.page">
      {/* Header */}
      <div className="bg-card border-b border-border py-8 sm:py-10">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-2">
            Saved Items
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground flex items-center justify-center gap-3">
            My Wishlist
            {!isLoading && wishlistProducts.length > 0 && (
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-primary text-primary-foreground text-base font-bold">
                {wishlistProducts.length}
              </span>
            )}
          </h1>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto">
            Products you've saved — add them to your cart whenever you're ready.
          </p>
        </div>
      </div>

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {(["a", "b", "c", "d"] as const).map((k) => (
              <div key={k} className="space-y-3">
                <Skeleton className="aspect-square w-full rounded-xl" />
                <Skeleton className="h-4 w-3/4 mx-auto" />
                <Skeleton className="h-4 w-1/3 mx-auto" />
                <Skeleton className="h-8 w-full" />
              </div>
            ))}
          </div>
        ) : wishlistProducts.length === 0 ? (
          <div
            className="text-center py-24 bg-card rounded-2xl border border-border"
            data-ocid="wishlist.empty_state"
          >
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
              <Heart size={36} className="text-primary" />
            </div>
            <h3 className="font-display text-2xl font-bold text-foreground mb-2">
              Your wishlist is empty
            </h3>
            <p className="text-muted-foreground mb-6 max-w-xs mx-auto">
              Browse our menu and tap the heart icon on any product to save it
              here.
            </p>
            <Link to="/shop" data-ocid="wishlist.browse_shop_link">
              <Button className="gap-2 bg-primary hover:bg-primary/90">
                <ShoppingBag size={15} />
                Browse Our Menu
              </Button>
            </Link>
          </div>
        ) : (
          <div
            className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5"
            data-ocid="wishlist.products_list"
          >
            {wishlistProducts.map((product) => (
              <WishlistProductCard
                key={product.id}
                product={product}
                onRemove={() => handleRemove(product)}
                onAddToCart={() => handleAddToCart(product)}
                removing={
                  removeFromWishlist.isPending &&
                  removeFromWishlist.variables === Number(product.id)
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
