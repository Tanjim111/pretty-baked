import Common "common";

module {
  public type Category = {
    id : Common.CategoryId;
    name : Text;
    description : Text;
    displayOrder : Nat;
    createdAt : Common.Timestamp;
  };

  // Internal product with optional primary image blob + up to 4 additional images
  public type ProductInternal = {
    id : Common.ProductId;
    name : Text;
    description : Text;
    price : Nat; // in BDT paisa
    category : Common.CategoryId;
    ingredients : [Text];
    image : ?Blob;      // primary image (backwards compatible)
    images : [Blob];    // additional gallery images (up to 4)
    createdAt : Common.Timestamp;
  };

  // Shared/public product type for API boundary
  public type Product = {
    id : Common.ProductId;
    name : Text;
    description : Text;
    price : Nat; // in BDT paisa
    category : Common.CategoryId;
    ingredients : [Text];
    image : ?Blob;
    images : [Blob];    // additional gallery images (up to 4)
    createdAt : Common.Timestamp;
  };

  public type ProductInput = {
    name : Text;
    description : Text;
    price : Nat;
    category : Common.CategoryId;
    ingredients : [Text];
    image : ?Blob;
    images : [Blob];    // up to 4 additional gallery images
  };

  public type CategoryInput = {
    name : Text;
    description : Text;
    displayOrder : Nat;
  };
};
