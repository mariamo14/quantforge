---
title: Graphs for Quant Interviews
minutes: 12
---

## When to reach for a graph

A **graph** is nodes (vertices) plus edges (pairwise connections). Edges can be **directed** (A→B is not B→A: "USD converts to EUR") or undirected, and **weighted** (each edge carries a number: a cost, a rate, a distance) or not.

The reach-for-it signal: your data is about **relationships, not sequences**. Arrays and lists model order; trees model hierarchy; graphs model "these things are connected to those things, possibly with cycles." Currencies and FX rates, counterparties and exposures, tasks and dependencies, assets and correlations — all graphs. In quant interviews, graphs usually arrive wearing a costume; the skill is recognizing them.

## The one representation you need: adjacency list

For each node, store the list of its outgoing edges. In C++:

```cpp
int n;                                     // number of nodes, ids 0..n-1
vector<vector<pair<int, double>>> adj(n);  // adj[u] = {(v, weight), ...}

adj[u].push_back({v, w});                  // directed edge u -> v, weight w
```

Space is $O(N + M)$ for $N$ nodes and $M$ edges, and iterating a node's neighbors is proportional to its degree. An adjacency **matrix** ($O(N^2)$ space, $O(1)$ edge lookup) only wins for small, dense graphs — for FX with ~30 currencies it's fine, but default to the list.

## BFS: fewest hops

Breadth-first search explores in expanding rings from a source, so the first time you reach a node is via a **minimum-edge-count** path. Use it whenever edges are unweighted (or all equal weight): fewest intermediaries, fewest conversions, degrees of separation.

```cpp
vector<int> dist(n, -1);
queue<int> q;
dist[src] = 0; q.push(src);
while (!q.empty()) {
    int u = q.front(); q.pop();
    for (auto [v, w] : adj[u])
        if (dist[v] == -1) { dist[v] = dist[u] + 1; q.push(v); }
}
```

The queue is the whole trick: nodes are processed in the order discovered, so distances come out sorted. $O(N + M)$.

## DFS: reachability, cycles, ordering

Depth-first search dives down one path before backtracking — recursion (or an explicit stack) instead of a queue. It answers "can I get there at all?", finds connected components, detects **cycles** (in a directed graph: you revisit a node currently on the recursion stack), and produces topological orderings for dependency chains. Same $O(N + M)$.

```cpp
// colors: 0 = unvisited, 1 = in progress, 2 = done
bool hasCycle(int u, vector<int>& color) {
    color[u] = 1;
    for (auto [v, w] : adj[u]) {
        if (color[v] == 1) return true;            // back edge -> cycle
        if (color[v] == 0 && hasCycle(v, color)) return true;
    }
    color[u] = 2;
    return false;
}
```

## Shortest paths in 60 seconds

Weighted edges, cheapest total path — two algorithms cover the interview space:

- **Dijkstra** — requires **non-negative weights**. Greedy: repeatedly settle the unvisited node with smallest tentative distance, using a priority queue (`priority_queue` of `(dist, node)`, min-heap via negation or `greater<>`). Relax each outgoing edge of the settled node. $O(M \log N)$. Fast; your default.
- **Bellman-Ford** — relax *every* edge, and repeat $N-1$ times. Slower at $O(NM)$, but it **handles negative weights**, and it gives you a detector for free: if an $N$-th round of relaxation still improves some distance, the graph contains a **negative cycle** — a loop whose weights sum below zero, around which "distance" decreases forever.

Non-negative weights → Dijkstra. Negative weights, or you *care about* negative cycles → Bellman-Ford. That last clause is about to matter.

## THE quant trick: multiply → add via logs

Shortest-path algorithms sum edge weights. Many finance problems **multiply**: converting USD→EUR→JPY multiplies exchange rates; compounding returns multiplies growth factors. The bridge is the logarithm, since $\log(ab) = \log a + \log b$.

**Currency arbitrage.** Build a directed graph: nodes are currencies, edge $u \to v$ carries the exchange rate $r_{uv}$ (units of $v$ per unit of $u$). An arbitrage is a cycle whose rate product exceeds 1 — you loop USD → EUR → JPY → USD and come home with more than you started:

$$r_1 \cdot r_2 \cdots r_k > 1$$

Take logs and negate, defining edge weights $w = -\log r$:

$$\log r_1 + \cdots + \log r_k > 0 \iff \sum_i (-\log r_i) < 0$$

So **a rate-product-greater-than-1 cycle is exactly a negative cycle under $w = -\log r$** — and negative-cycle detection is precisely what Bellman-Ford does, in $O(NM)$. A multiplicative trading question just became a stock graph algorithm. This is the setup for the Currency Arbitrage problem coming next; the same log transform converts "maximize product of conversion rates along a path" into a shortest-path problem.

Two other places graphs surface on quant desks, one line each: **settlement chains** — obligations between counterparties form a directed graph, and netting or unwinding them is cycle-finding and flow; **correlation networks** — threshold a correlation matrix into edges between assets, and clusters/components reveal market structure.

## Complexity cheat sheet

| Algorithm | Solves | Constraint | Time | Space |
|---|---|---|---|---|
| BFS | fewest edges from source | unweighted | $O(N + M)$ | $O(N)$ |
| DFS | reachability, cycle detection, topo order | — | $O(N + M)$ | $O(N)$ |
| Dijkstra | cheapest path from source | weights $\ge 0$ | $O(M \log N)$ | $O(N)$ |
| Bellman-Ford | cheapest path; negative-cycle detection | none (no neg. cycle for finite dists) | $O(NM)$ | $O(N)$ |

($N$ = nodes, $M$ = edges; adjacency list assumed.)

## Interview checkpoints

- Default representation: adjacency list, `vector<vector<pair<int,double>>>`; $O(N+M)$ space.
- BFS + queue = fewest hops on unweighted graphs; DFS = reachability, cycle detection, topological order.
- Dijkstra needs non-negative weights ($O(M \log N)$ with a priority queue); Bellman-Ford is $O(NM)$ but handles negatives and detects negative cycles.
- Multiplicative → additive: with $w = -\log r$, a cycle with rate product $> 1$ becomes a negative cycle — currency arbitrage is Bellman-Ford.
- Say the complexity unprompted; it's expected.
