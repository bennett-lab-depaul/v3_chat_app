# TODO: I don't know if this is all right, but the last version was not clean at all and ran very slow...

"""
Pragmatic (semantic) coherence biomarker

Estimate how well a user's current speech stays on topic by measuring the semantic relatedness of each local 
token window to the rest of the utterance. For each user utterance:

    1) Tokenize to words (lowercased, punctuation removed)
    2) Build sliding windows of up to `winsize` tokens (ending at each token)
    3) Embed each window as a weighted MEAN of its word vectors:
        - weights = log-frequency (or freq/1) within the window
        - optionally L2-normalize word vectors before averaging (norm=True)
        - optionally multiply weights by per-token entropy
    4) For each window, calculate GLOBAL COHERENCE = cosine(current_window, mean_of_other_windows_in_this_utterance)
    5) Average window GC for the utterance; average across utterances

The result is a single float; higher = more on-topic.

"""
import numpy  as np
import pandas as pd
import re
from sklearn.metrics.pairwise import cosine_similarity

# ==================================================================== ===================================
# Helpers
# ==================================================================== ===================================
_TOKEN_RE = re.compile(r"[^\w\s]+")

def _tokenize(text: str) -> list[str]:
    return _TOKEN_RE.sub("", (text or "").lower()).strip().split()

# --------------------------------------------------------------------
# Cosine Similarity
# --------------------------------------------------------------------
def _safe_cos(a: np.ndarray, b: np.ndarray) -> float:
    """
    Should do the same thing as the Sklearn function without the overhead from
    one on one comparisons.
    """
    na = np.linalg.norm(a); nb = np.linalg.norm(b)
    if na == 0 or nb == 0: return 0.0
    return float(np.dot(a, b) / (na * nb))

# Sklearn cosine similarity
def _cosine_sklearn(a: np.ndarray, b: np.ndarray) -> float:
    return float(cosine_similarity(a.reshape(1, -1), b.reshape(1, -1))[0, 0])


# --------------------------------------------------------------------
# Build a window embedding as a weighted MEAN of word vectors
# --------------------------------------------------------------------
def _weighted_mean_embed(ids, w, vecs, entropy, norm):
    """
    Turn each window into a semantic embedding. 
        (weighted mean of word vectors, optionally normalized, entropy-weighted).

    All arguments except norm are np.darray; norm is a bool.
    ------------
    ids     => indices of tokens in this window (into vecs rows)
    w       => window-internal weights per token (logfreq / freq / ones)
    vecs    => (V,D) embedding matrix aligned to vectors.index
    entropy => (V,) array; weights are multiplied by entropy[ids]
    norm    => if True, L2-normalize each token vector before averaging

    ------------
    Returns a (D,) vector. If the window has no in-vocab tokens or the
    sum of weights is zero, returns a zero vector. Using a mean (not sum)
    keeps the scale stable across different window lengths.

    """
    # If the window has no in-vocab tokens, returns a zero vector.
    if ids.size == 0: return np.zeros((vecs.shape[1],), dtype=np.float32)

    # Construct the embedding matrix
    w = w.astype(np.float32) * entropy[ids].astype(np.float32)
    M = vecs[ids, :]

    # If True, L2-normalize each token vector before averaging.
    if norm:
        d = np.linalg.norm(M, axis=1); d[d == 0] = 1.0
        M = M / d[:, None]
    
    # If the sum of weights is zero, returns a zero vector.
    s = w.sum()
    if s == 0: return np.zeros((vecs.shape[1],), dtype=np.float32)

    return (w[:, None] * M).sum(axis=0) / s

            
# ====================================================================
# Validation / setup  (returns everything the caller needs)
# ====================================================================
def validation_setup(f_weight, winsize, vectors, entropy):
    # Check f_weight, winsize, vectors
    ok_vectors = isinstance(vectors, pd.DataFrame) #and not vectors.index.has_duplicates
    if f_weight not in {"logfreq", "freq", "none"} : raise ValueError("f_weight must be one of {'logfreq','freq','none'}"  )
    if winsize < 1                                 : raise ValueError("winsize must be >= 1"                               )
    if not ok_vectors                              : raise ValueError("vectors must be a DataFrame with unique token index")

    # Vectors OK; get shape
    V, D = vectors.shape
    vecs = vectors.values.astype(np.float32, copy=False)

    # Check entropy
    entropy_arr = np.asarray(entropy["x"], dtype=np.float32)
    if entropy_arr.shape[0] != V: raise ValueError("entropy length must equal number of vector rows")

    # Token -> row index lookup for vectors
    tok2id = {w: i for i, w in enumerate(vectors.index)}

    return vecs, entropy_arr, D, tok2id


# ==================================================================== ===================================
# Pragmatic GC (user only)
# ==================================================================== ===================================
def pragmatic_gc_mean(
    data      : pd.DataFrame,
    vectors   : pd.DataFrame,  # rows: tokens, cols: dims
    entropy   : pd.DataFrame,  # aligned with vectors.index (same order/length)
    stop_list : pd.DataFrame,
    *,
    norm     : bool = True,
    f_weight : str  = "logfreq",        # "logfreq" | "freq" | "none"
    winsize  : int  = 20,
) -> float:
    """
    Returns a single float: mean global coherence (GC) across all USER rows.
    
    data      : DataFrame with columns ["participants","response"].
    vectors   : DataFrame indexed by tokens (unique), values are embeddings.
    entropy   : Series (index == vectors.index) or ndarray of len == len(vectors).
    stop_list : list of stop words.
    
    """
    # --------------------------------------------------------------------
    # Input validation & initial setup
    # --------------------------------------------------------------------
    vecs, entropy_arr, D, tok2id = validation_setup(f_weight, winsize, vectors, entropy)

    df = data.iloc[:, :2].copy()
    df.columns = ["participants", "response"]

    if stop_list is not None: stop_list = stop_list.iloc[:, 0].tolist()
    stop_set = set(stop_list or [])
    
    # ====================================================================
    # Per-user-row GC (no iterrows; use ndarray of texts)
    # ====================================================================
    user_texts = df.loc[df["participants"] == "user", "response"].to_numpy()
    gc_values: list[float] = []

    for text in user_texts:
        # --------------------------------------------------------------------
        # 1) Tokenize to words (lowercased, punctuation removed)
        # --------------------------------------------------------------------
        # Convert to tokens; skip if none
        tokens = [t for t in _tokenize(text) if t not in stop_set]
        if not tokens: continue

        # --------------------------------------------------------------------
        # 2) Build sliding windows of up to `winsize` tokens (ending at each token)
        # --------------------------------------------------------------------
        # Sliding window embeddings
        W = len(tokens)
        win_emb = np.zeros((W, D), dtype=np.float32)

        for i in range(W):
            a = max(0, i - winsize + 1); b = i + 1
            span = tokens[a:b]

            # Map to vector row ids
            ids = [tok2id[t] for t in span if t in tok2id]
            if not ids: continue

            ids = np.array(ids, dtype=np.int64)
            uniq, cnt = np.unique(ids, return_counts=True)

            if   f_weight == "logfreq": w = np.log10(cnt.astype(np.float32) + 1.0)
            elif f_weight == "freq"   : w = cnt.astype(np.float32)
            else                      : w = np.ones_like(cnt, dtype=np.float32)

            # 3) Embed each window as a weighted MEAN of its word vectors:
            win_emb[i, :] = _weighted_mean_embed(uniq, w, vecs, entropy_arr, norm)

        # --------------------------------------------------------------------
        # 4) For each window, get GLOBAL COHERENCE 
        # --------------------------------------------------------------------
        # If there are fewer than 2 valid windows, skip.
        valid = (np.linalg.norm(win_emb, axis=1) > 0)
        if valid.sum() < 2: continue

        mean_all = win_emb[valid].mean(axis=0)
        idxs     = np.where(valid)[0]
        n_valid  = len(idxs)

        # GC per valid window as cosine with the mean of all OTHER windows
        cos_vals = []
        for j in idxs:
            # Cosine similarity
            other = (mean_all * n_valid - win_emb[j, :]) / (n_valid - 1)
            cos_vals.append(_safe_cos(win_emb[j, :], other))
            
            # Sklearn method
            #cos_vals.append(_cosine_sklearn(win_emb[j, :], other))

        # 5a) Average window GC for the utterance
        if cos_vals: gc_values.append(float(np.mean(cos_vals)))

    # 5b) Average across utterances
    return float(np.mean(gc_values)) if gc_values else 0.0
    
    