import { useEffect, useMemo, useState } from "react";
import "./MoviesList.css";

export type MoviesListProps = {
  endpoint?: string;
  limit?: number;
  className?: string;
  heading?: string;
};

type Movie = {
  id: string;
  title: string;
  year?: number;
  rating?: number;
  posterUrl?: string;
};

type WhoaMovie = {
  movie?: string;
  year?: number;
  poster?: string;
};

const DEFAULT_ENDPOINT = "https://whoa.onrender.com/whoas/random";

function normalizeMovie(movie: WhoaMovie, fallbackId: string): Movie | null {
  const title = movie.movie;
  if (!title) {
    return null;
  }

  return {
    id: `${title}-${movie.year ?? fallbackId}`,
    title,
    year: movie.year,
    posterUrl: movie.poster,
  };
}

export function MoviesList({
  endpoint = DEFAULT_ENDPOINT,
  limit = 12,
  className,
  heading = "Movies",
}: MoviesListProps) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestUrl = useMemo(() => {
    try {
      const url = new URL(endpoint);
      if (!url.searchParams.has("results")) {
        url.searchParams.set("results", String(limit));
      }
      return url.toString();
    } catch {
      return null;
    }
  }, [endpoint, limit]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadMovies() {
      if (!requestUrl) {
        setError("Movies endpoint is invalid.");
        setMovies([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(requestUrl, { signal: controller.signal });
        if (!response.ok) {
          throw new Error("Movies request failed.");
        }

        const payload = (await response.json()) as WhoaMovie[];
        const rawMovies = Array.isArray(payload) ? payload : [];
        const normalized = rawMovies
          .map((movie, index) => normalizeMovie(movie, `${index}`))
          .filter((movie): movie is Movie => Boolean(movie));

        setMovies(normalized.slice(0, limit));
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }
        setError("Unable to load movies right now.");
      } finally {
        setIsLoading(false);
      }
    }

    loadMovies();
    return () => controller.abort();
  }, [limit, requestUrl]);

  const ratingLabel = useMemo(() => {
    return movies.reduce<Record<string, string>>((labels, movie) => {
      labels[movie.id] =
        typeof movie.rating === "number" ? movie.rating.toFixed(1) : "—";
      return labels;
    }, {});
  }, [movies]);

  return (
    <section className={["movies-list", className].filter(Boolean).join(" ")}>
      <div className="movies-header">
        <h2>{heading}</h2>
        <span className="movies-count">{movies.length} results</span>
      </div>

      {isLoading && <p className="movies-state">Loading movies...</p>}
      {error && <p className="movies-state movies-state--error">{error}</p>}

      {!isLoading && !error && (
        <div className="movies-grid">
          {movies.map((movie) => (
            <article className="movie-card" key={movie.id}>
              {movie.posterUrl ? (
                <img
                  className="movie-poster"
                  src={movie.posterUrl}
                  alt={`${movie.title} poster`}
                  loading="lazy"
                />
              ) : (
                <div className="movie-poster movie-poster--placeholder">
                  No image
                </div>
              )}
              <div className="movie-meta">
                <h3 className="movie-title">{movie.title}</h3>
                <p className="movie-subtitle">{movie.year ?? "Year n/a"}</p>
                <span className="movie-rating">Rating: {ratingLabel[movie.id]}</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
