import {
  useEffect,
  useState,
  createContext,
  useContext,
} from "react";
import {
  HashRouter,
  Routes,
  Route,
  Link,
  useParams,
  useNavigate,
} from "react-router-dom";
import { Leaf, Heart, Send } from "lucide-react";

const EARTH = {
  cream: "#FAF7F2",
  sand: "#EDE6D6",
  sage: "#A3B18A",
  forest: "#344E41",
  brown: "#8B5E34",
  golden: "#E1B351",
};

const ThemeContext = createContext({ themeMode: "light", toggleTheme: () => {} });

function useSystemPrefersDark() {
  if (typeof window === "undefined") return false;
  return window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function ThemeProvider({ children }) {
  const [themeMode, setThemeMode] = useState(() => {
    const saved = localStorage.getItem("themeMode");
    if (saved === "light" || saved === "dark") return saved;
    return useSystemPrefersDark() ? "dark" : "light";
  });

  useEffect(() => {
    localStorage.setItem("themeMode", themeMode);
    document.documentElement.classList.toggle("dark", themeMode === "dark");
  }, [themeMode]);

  const toggleTheme = () =>
    setThemeMode((m) => (m === "light" ? "dark" : "light"));

  return (
    <ThemeContext.Provider value={{ themeMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

function useTheme() {
  return useContext(ThemeContext);
}

function Header() {
  const { themeMode, toggleTheme } = useTheme();
  const gradient = `linear-gradient(90deg, ${EARTH.forest}, ${EARTH.sage})`;
  return (
    <header className="sticky top-0 z-40 shadow">
      <div style={{ background: gradient }}>
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex items-center justify-between py-5">
            <Link to="/" className="flex items-center gap-2 text-white">
              <div
                className="h-9 w-9 grid place-content-center rounded-full"
                style={{ backgroundColor: EARTH.sand }}
              >
                <Leaf className="h-5 w-5" style={{ color: EARTH.forest }} />
              </div>
              <span className="text-2xl font-semibold tracking-wide">
                My Blog
              </span>
            </Link>
            <nav className="hidden gap-8 md:flex text-white/90">
              <Link className="hover:text-white transition" to="/">
                Home
              </Link>
              <Link className="hover:text-white transition" to="/contact">
                Contact
              </Link>
            </nav>
            <button
              onClick={toggleTheme}
              className="rounded-full px-3 py-1.5 text-sm font-semibold text-white/90 ring-1 ring-white/30 hover:text-white"
            >
              {themeMode === "dark" ? "Light Mode" : "Dark Mode"}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="mt-16 bg-[#344E41]">
      <div className="mx-auto max-w-6xl px-6 py-6 text-center text-sm text-white/90">
        © {new Date().getFullYear()} My Blog
      </div>
    </footer>
  );
}

function LoadingBox({ text = "Loading..." }) {
  return (
    <div className="my-6 rounded-xl bg-white/70 dark:bg-neutral-800/70 p-4 text-center text-sm text-neutral-800 dark:text-neutral-100 shadow">
      {text}
    </div>
  );
}

function ErrorBox({ message = "Something went wrong." }) {
  return (
    <div className="my-6 rounded-xl bg-red-100 dark:bg-red-900/40 p-4 text-sm text-red-800 dark:text-red-100 shadow">
      {message}
    </div>
  );
}

function LikeButton({ initial = 0 }) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(initial);
  const toggle = () => {
    setLiked((v) => !v);
    setCount((c) => (liked ? Math.max(0, c - 1) : c + 1));
  };
  return (
    <button
      onClick={toggle}
      className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow transition
                 bg-[#EDE6D6] text-[#344E41] dark:bg-neutral-700 dark:text-neutral-100"
      aria-pressed={liked}
    >
      <Heart className={`h-5 w-5 ${liked ? "fill-current text-red-500" : ""}`} />
      <span>{count}</span>
    </button>
  );
}

function CommentForm({ onAdd, loading = false }) {
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const disabled =
    name.trim().length === 0 || text.trim().length === 0 || loading;

  return (
    <div className="mt-6">
      <div className="grid gap-3 md:grid-cols-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="rounded-xl border p-3 outline-none focus:ring
                     bg-[#FAF7F2] border-[#A3B18A]
                     dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-100 dark:placeholder-neutral-400"
        />
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Your comment"
          rows={3}
          className="rounded-xl border p-3 outline-none focus:ring md:col-span-2
                     bg-[#FAF7F2] border-[#A3B18A]
                     dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-100 dark:placeholder-neutral-400"
        />
      </div>
      <button
        onClick={() => {
          if (!disabled) {
            onAdd({ name: name.trim(), body: text.trim() });
            setName("");
            setText("");
          }
        }}
        disabled={disabled}
        className={`mt-3 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold shadow
                    ${disabled ? "opacity-50 cursor-not-allowed" : ""}
                    bg-amber-400 text-neutral-900 dark:bg-amber-400 dark:text-neutral-900`}
      >
        <Send className="h-4 w-4" />
        {loading ? "Posting..." : "Submit"}
      </button>
    </div>
  );
}

function BlogPostsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("https://jsonplaceholder.typicode.com/posts")
      .then((res) => {
        if (!res.ok) throw new Error("Network error");
        return res.json();
      })
      .then((data) => {
        setPosts(data.slice(0, 20));
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching posts:", err);
        setError("Failed to load posts. Please try again.");
        setLoading(false);
      });
  }, []);

  return (
    <main className="mx-auto max-w-5xl px-6 py-10 text-neutral-900 dark:text-neutral-100">
      <div className="mb-8 rounded-2xl p-6 shadow bg-[#A3B18A] text-white dark:bg-[#3a5347]">
        <h1 className="text-3xl font-semibold">Latest Posts (API)</h1>
        <p className="mt-1 text-white/90">
          Fetched from jsonplaceholder.typicode.com
        </p>
      </div>

      {loading && <LoadingBox text="Loading posts..." />}
      {error && <ErrorBox message={error} />}

      <div className="grid gap-6">
        {!loading &&
          !error &&
          posts.map((p) => (
            <Link
              to={`/post/${p.id}`}
              key={p.id}
              className="rounded-2xl border p-6 shadow hover:shadow-md transition
                         bg-[#FAF7F2] border-[#EDE6D6]
                         dark:bg-neutral-800 dark:border-neutral-700"
            >
              <h2
                className="text-2xl font-bold dark:text-emerald-200"
                style={{ color: EARTH.forest }}
              >
                {p.title}
              </h2>
              <p className="mt-2 text-[15px] text-neutral-800 dark:text-neutral-200">
                {p.body?.slice(0, 120)}...
              </p>
              <p className="mt-3 text-sm text-[#344E41] dark:text-emerald-300/90">
                Click to read more →
              </p>
            </Link>
          ))}
      </div>
    </main>
  );
}

function IndividualPostPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [user, setUser] = useState(null);
  const [comments, setComments] = useState([]);
  const [postLoading, setPostLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [error, setError] = useState("");
  const [commentPosting, setCommentPosting] = useState(false);

  useEffect(() => {
    setPostLoading(true);
    fetch(`https://jsonplaceholder.typicode.com/posts/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Error fetching post");
        return res.json();
      })
      .then((data) => {
        setPost(data);
        setPostLoading(false);

        if (data.userId) {
          fetch(`https://jsonplaceholder.typicode.com/users/${data.userId}`)
            .then((res) => res.json())
            .then((u) => setUser(u))
            .catch((err) => {
              console.error("User fetch error:", err);
            });
        }
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load post.");
        setPostLoading(false);
      });
  }, [id]);

  useEffect(() => {
    setCommentsLoading(true);
    fetch(`https://jsonplaceholder.typicode.com/posts/${id}/comments`)
      .then((res) => {
        if (!res.ok) throw new Error("Error fetching comments");
        return res.json();
      })
      .then((data) => {
        setComments(data);
        setCommentsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setCommentsLoading(false);
      });
  }, [id]);

  const handleAddComment = async ({ name, body }) => {
    setCommentPosting(true);
    try {
      const res = await fetch(
        `https://jsonplaceholder.typicode.com/posts/${id}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            postId: Number(id),
            name,
            body,
            email: "you@example.com",
          }),
        }
      );
      const newComment = await res.json();
      setComments((prev) => [newComment, ...prev]);
    } catch (err) {
      console.error("Error posting comment:", err);
      alert("Could not post comment (fake API), but your form works.");
    } finally {
      setCommentPosting(false);
    }
  };

  return (
    <main className="mx-auto max-w-3xl px-6 py-10 text-neutral-900 dark:text-neutral-100">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 rounded-full px-4 py-1.5 text-sm font-semibold shadow
                   bg-[#EDE6D6] text-[#344E41] dark:bg-neutral-700 dark:text-neutral-100"
      >
        ← Back
      </button>

      {postLoading && <LoadingBox text="Loading post..." />}
      {error && <ErrorBox message={error} />}

      {!postLoading && post && (
        <article
          className="rounded-2xl border p-8 shadow-md
                     bg-[#FAF7F2] border-[#EDE6D6]
                     dark:bg-neutral-800 dark:border-neutral-700"
        >
          <h1
            className="text-3xl font-bold dark:text-emerald-200"
            style={{ color: EARTH.forest }}
          >
            {post.title}
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-neutral-800 dark:text-neutral-200">
            {post.body}
          </p>

          {/* Author info */}
          <div className="mt-4 text-sm text-[#344E41] dark:text-emerald-300/90">
            <div>
              <span className="font-semibold">Author:</span>{" "}
              {user ? user.name : "Unknown"}
            </div>
            {user && (
              <div>
                <span className="font-semibold">Email:</span> {user.email}
              </div>
            )}
          </div>

          <div className="mt-5">
            <LikeButton initial={6} />
          </div>

          {/* Comments */}
          <section className="mt-8">
            <h2
              className="text-2xl font-bold dark:text-emerald-200"
              style={{ color: EARTH.forest }}
            >
              Comments
            </h2>

            <CommentForm onAdd={handleAddComment} loading={commentPosting} />

            {commentsLoading && <LoadingBox text="Loading comments..." />}

            {!commentsLoading && comments.length === 0 && (
              <p className="mt-4 italic text-[#344E41] dark:text-emerald-300/90">
                No comments yet. Be the first to comment!
              </p>
            )}

            {!commentsLoading && comments.length > 0 && (
              <ul className="mt-6 space-y-2">
                {comments.map((c) => (
                  <li
                    key={c.id || c.body + c.email}
                    className="rounded-xl border p-3
                               bg-[#FAF7F2] border-[#A3B18A]
                               dark:bg-neutral-800 dark:border-neutral-700"
                  >
                    <div className="text-sm font-semibold text-[#344E41] dark:text-emerald-300/90">
                      {c.name}
                    </div>
                    <div className="text-[15px] text-neutral-800 dark:text-neutral-200">
                      {c.body}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </article>
      )}
    </main>
  );
}

function ContactPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-10 text-neutral-900 dark:text-neutral-100">
      <div
        className="rounded-2xl border p-8 shadow-md
                   bg-[#FAF7F2] border-[#EDE6D6]
                   dark:bg-neutral-800 dark:border-neutral-700"
      >
        <h1
          className="text-3xl font-bold dark:text-emerald-200"
          style={{ color: "#344E41" }}
        >
          Contact
        </h1>
        <p className="mt-2 text-[15px] text-neutral-800 dark:text-neutral-200">
          Demo contact form.
        </p>

        <form className="mt-6 grid gap-4">
          <input
            className="rounded-xl border p-3 outline-none focus:ring
                       bg-[#FAF7F2] border-[#A3B18A]
                       dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-100 dark:placeholder-neutral-400"
            placeholder="Name"
          />
          <input
            className="rounded-xl border p-3 outline-none focus:ring
                       bg-[#FAF7F2] border-[#A3B18A]
                       dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-100 dark:placeholder-neutral-400"
            placeholder="Email"
            type="email"
          />
          <textarea
            className="rounded-xl border p-3 outline-none focus:ring
                       bg-[#FAF7F2] border-[#A3B18A]
                       dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-100 dark:placeholder-neutral-400"
            rows={4}
            placeholder="Message"
          />
          <button
            type="button"
            className="rounded-full px-5 py-2.5 text-sm font-semibold shadow
                       bg-amber-400 text-neutral-900 dark:bg-amber-400 dark:text-neutral-900"
          >
            Send
          </button>
        </form>
      </div>
    </main>
  );
}

function AppShell() {
  return (
    <div className="min-h-screen bg-[#EDE6D6] dark:bg-neutral-900 dark:text-neutral-100">
      <Header />
      <Routes>
        <Route path="/" element={<BlogPostsPage />} />
        <Route path="/post/:id" element={<IndividualPostPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      {}
      <HashRouter>
        <AppShell />
      </HashRouter>
    </ThemeProvider>
  );
}
