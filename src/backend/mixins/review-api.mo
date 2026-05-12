import List "mo:core/List";
import ReviewLib "../lib/review";
import ReviewTypes "../types/review";
import CommonTypes "../types/common";

mixin (
  reviews : List.List<ReviewTypes.Review>,
  nextReviewId : { var value : Nat },
) {
  // Submit a review for a product. Any caller (logged-in or anonymous) may submit.
  public shared ({ caller }) func addReview(
    productId : CommonTypes.ProductId,
    reviewerName : Text,
    rating : Nat,
    text : Text,
  ) : async ReviewTypes.AddReviewResult {
    ReviewLib.addReview(
      reviews,
      nextReviewId,
      caller,
      { productId; reviewerName; rating; text },
    );
  };

  // Retrieve all reviews for a product.
  public query func getReviewsByProduct(
    productId : CommonTypes.ProductId,
  ) : async [ReviewTypes.Review] {
    ReviewLib.getReviewsByProduct(reviews, productId);
  };

  // Get the average star rating for a product (null when no reviews exist).
  public query func getAverageRating(
    productId : CommonTypes.ProductId,
  ) : async ?Float {
    ReviewLib.getAverageRating(reviews, productId);
  };
};
