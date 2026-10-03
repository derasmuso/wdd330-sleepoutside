// Get all comments for a specific product ID
export function getComments(productId) {
  const comments = localStorage.getItem(`comments_${productId}`);
  return comments ? JSON.parse(comments) : [];
}

// Add a new comment for a product and save it to localStorage
export function addComment(productId, author, text) {
  const comments = getComments(productId);

  const newComment = {
    id: Date.now().toString(),
    author: author.trim() || "Anonymous",
    text: text.trim(),
    date: new Date().toLocaleDateString(),
  };

  comments.push(newComment);
  localStorage.setItem(`comments_${productId}`, JSON.stringify(comments));
  return comments;
}
