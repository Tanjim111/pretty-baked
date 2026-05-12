import List "mo:core/List";
import Time "mo:core/Time";
import ReviewTypes "../types/review";
import CommonTypes "../types/common";

module {
  // Add a new review for a product; returns the assigned ReviewId or an error.
  public func addReview(
    reviews : List.List<ReviewTypes.Review>,
    nextReviewId : { var value : Nat },
    caller : Principal,
    input : ReviewTypes.ReviewInput,
  ) : ReviewTypes.AddReviewResult {
    if (input.rating < 1 or input.rating > 5) {
      return #err("Rating must be between 1 and 5");
    };
    if (input.reviewerName.size() == 0) {
      return #err("Reviewer name cannot be empty");
    };
    let id = nextReviewId.value;
    nextReviewId.value += 1;
    let review : ReviewTypes.Review = {
      id;
      productId = input.productId;
      reviewerPrincipal = caller;
      reviewerName = input.reviewerName;
      rating = input.rating;
      text = input.text;
      createdAt = Time.now();
    };
    reviews.add(review);
    #ok(id);
  };

  // Return all reviews for the given productId.
  public func getReviewsByProduct(
    reviews : List.List<ReviewTypes.Review>,
    productId : CommonTypes.ProductId,
  ) : [ReviewTypes.Review] {
    reviews.filter(func(r) { r.productId == productId }).toArray();
  };

  // Return the average star rating for the given productId, or null if no reviews.
  public func getAverageRating(
    reviews : List.List<ReviewTypes.Review>,
    productId : CommonTypes.ProductId,
  ) : ?Float {
    let filtered = reviews.filter(func(r) { r.productId == productId });
    let count = filtered.size();
    if (count == 0) {
      return null;
    };
    let total = filtered.foldLeft(0 : Nat, func(acc : Nat, r : ReviewTypes.Review) : Nat { acc + r.rating });
    ?(total.toFloat() / count.toFloat());
  };
};
