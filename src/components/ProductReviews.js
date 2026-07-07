import { useState, useEffect } from 'react';
import { useSession } from '@/lib/SessionContext';
import { Star, UserCircle2 } from 'lucide-react';
import styles from './ProductReviews.module.css';
import Toast from './Toast';

export default function ProductReviews({ product, reviews: initialReviews }) {
  const [session, setSession] = useState(null);
  
  useEffect(() => {
    fetch("/api/user/profile")
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) setSession({ user: data });
      })
      .catch(() => setSession(null));
  }, []);

  const [reviews, setReviews] = useState(initialReviews || []);
  const [filterRating, setFilterRating] = useState(0); // 0 = all
  const [showForm, setShowForm] = useState(false);
  
  const [ratingInput, setRatingInput] = useState(5);
  const [commentInput, setCommentInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const filteredReviews = filterRating === 0 
    ? reviews 
    : reviews.filter(r => r.rating === filterRating);

  const stats = {
    5: reviews.filter(r => r.rating === 5).length,
    4: reviews.filter(r => r.rating === 4).length,
    3: reviews.filter(r => r.rating === 3).length,
    2: reviews.filter(r => r.rating === 2).length,
    1: reviews.filter(r => r.rating === 1).length,
  };

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1) 
    : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!session?.user?.id) {
      window.location.href = "/masuk";
      return;
    }
    
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          userId: session.user.id,
          rating: ratingInput,
          comment: commentInput
        })
      });

      if (res.ok) {
        const data = await res.json();
        // Optimistically add to list
        const newReview = {
          ...data.review,
          user: { name: session.user.name, avatar: session.user.avatar || "" }
        };
        setReviews([newReview, ...reviews]);
        setShowForm(false);
        setCommentInput("");
        setRatingInput(5);
        setToastMessage("Ulasan berhasil dikirim!");
      } else {
        setToastMessage("Gagal mengirim ulasan.");
      }
    } catch (err) {
      setToastMessage("Terjadi kesalahan sistem.");
    }
    setIsSubmitting(false);
  };

  const renderStars = (count) => {
    return Array(5).fill(0).map((_, i) => (
      <Star key={i} size={14} fill={i < count ? "var(--accent)" : "#E2E8F0"} color={i < count ? "var(--accent)" : "#E2E8F0"} />
    ));
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.sectionTitle}>Penilaian Produk</h3>
      
      {/* Overview Box like Shopee */}
      <div className={styles.overviewBox}>
        <div className={styles.scoreSection}>
          <div className={styles.bigScore}>
            <span className={styles.scoreNumber}>{averageRating}</span>
            <span className={styles.scoreOut}> dari 5</span>
          </div>
          <div className={styles.starsWrapper}>
            {renderStars(Math.round(averageRating))}
          </div>
        </div>
        
        <div className={styles.filterSection}>
          <button className={`${styles.filterBtn} ${filterRating === 0 ? styles.active : ''}`} onClick={() => setFilterRating(0)}>
            Semua ({reviews.length})
          </button>
          {[5, 4, 3, 2, 1].map(num => (
            <button key={num} className={`${styles.filterBtn} ${filterRating === num ? styles.active : ''}`} onClick={() => setFilterRating(num)}>
              {num} Bintang ({stats[num]})
            </button>
          ))}
        </div>
      </div>

      <div className={styles.actionsBox}>
        {session ? (
          !showForm ? (
            <button className={styles.writeBtn} onClick={() => setShowForm(true)}>
              Tulis Ulasan
            </button>
          ) : (
            <form className={styles.reviewForm} onSubmit={handleSubmit}>
              <h4>Ulasan Anda</h4>
              <div className={styles.ratingSelect}>
                <span>Beri Rating:</span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star 
                      key={star} 
                      size={24} 
                      fill={star <= ratingInput ? "var(--accent)" : "none"} 
                      color={star <= ratingInput ? "var(--accent)" : "#94A3B8"} 
                      style={{ cursor: 'pointer' }}
                      onClick={() => setRatingInput(star)}
                    />
                  ))}
                </div>
              </div>
              <textarea 
                className={styles.commentInput} 
                placeholder="Bagaimana kualitas produk ini? (Minimal 10 karakter)" 
                value={commentInput}
                onChange={e => setCommentInput(e.target.value)}
                required
                minLength={10}
              />
              <div className={styles.formActions}>
                <button type="button" className={styles.cancelBtn} onClick={() => setShowForm(false)}>Batal</button>
                <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                  {isSubmitting ? "Mengirim..." : "Kirim Ulasan"}
                </button>
              </div>
            </form>
          )
        ) : (
          <div className={styles.loginPrompt}>
            Silakan <a href="/masuk">login</a> untuk memberikan ulasan.
          </div>
        )}
      </div>

      <div className={styles.reviewList}>
        {filteredReviews.length === 0 ? (
          <div className={styles.emptyState}>Belum ada ulasan di kategori ini.</div>
        ) : (
          filteredReviews.map(review => (
            <div key={review.id} className={styles.reviewCard}>
              <div className={styles.userAvatar}>
                {review.user?.avatar ? (
                  <img src={review.user.avatar} alt={review.user.name} />
                ) : (
                  <UserCircle2 size={40} color="#94A3B8" />
                )}
              </div>
              <div className={styles.reviewContent}>
                <div className={styles.userName}>{review.user?.name || "Pengguna"}</div>
                <div className={styles.reviewStars}>
                  {renderStars(review.rating)}
                </div>
                <div className={styles.reviewDate}>
                  {new Date(review.createdAt).toLocaleDateString('id-ID', {
                    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}
                </div>
                <p className={styles.reviewText}>{review.comment}</p>
              </div>
            </div>
          ))
        )}
      </div>
      
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage("")} />}
    </div>
  );
}
