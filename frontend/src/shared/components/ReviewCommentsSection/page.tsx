import Link from "next/link";
import { FaStar } from "react-icons/fa";

import { assetUrl } from "@/shared/auth/api";
import styles from "./reviewcomments.module.css";

export type PublicWorkReview = {
  id: string;
  score: number;
  comment: string;
  updatedAt: string;
  author: { username: string; displayName: string; avatarUrl: string | null };
};

function formatReviewDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(value));
}

export function ReviewCommentsSection({ comments }: { comments: PublicWorkReview[] }) {
  return (
    <section aria-labelledby="review-comments-title">
      <div className={styles.heading}>
        <h2 id="review-comments-title">Reviews</h2>
        <span>{comments.length} {comments.length === 1 ? "review" : "reviews"}</span>
      </div>
      {comments.length === 0 ? (
        <p className={styles.empty}>Ainda não há reviews nesta obra.</p>
      ) : (
        <div className={styles.list}>
          {comments.map((review) => (
            <article className={styles.comment} key={review.id}>
              <Link className={styles.avatar} href={`/user/${review.author.username}`} aria-label={`Perfil de ${review.author.displayName}`} style={review.author.avatarUrl ? { backgroundImage: `url("${assetUrl(review.author.avatarUrl)}")` } : undefined}>
                {!review.author.avatarUrl && review.author.displayName.slice(0, 1).toUpperCase()}
              </Link>
              <div className={styles.body}>
                <header>
                  <div><Link href={`/user/${review.author.username}`}>{review.author.displayName}</Link><span>@{review.author.username}</span></div>
                  <div className={styles.score}><FaStar aria-hidden="true" /><strong>{review.score.toFixed(1)}</strong><span>/ 10</span></div>
                </header>
                <p>{review.comment}</p>
                <time dateTime={review.updatedAt}>Publicado em {formatReviewDate(review.updatedAt)}</time>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
