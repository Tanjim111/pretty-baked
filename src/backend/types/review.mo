import CommonTypes "common";

module {
  public type ReviewId = Nat;

  public type Review = {
    id : ReviewId;
    productId : CommonTypes.ProductId;
    reviewerPrincipal : Principal;
    reviewerName : Text;
    rating : Nat;        // 1–5
    text : Text;
    createdAt : CommonTypes.Timestamp;
  };

  public type ReviewInput = {
    productId : CommonTypes.ProductId;
    reviewerName : Text;
    rating : Nat;
    text : Text;
  };

  public type AddReviewResult = {
    #ok : ReviewId;
    #err : Text;
  };
};
