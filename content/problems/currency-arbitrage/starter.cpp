#include <cmath>
#include <cstdio>
#include <vector>

// Weight each edge as -log(rate); arbitrage <=> negative cycle.
// Bellman-Ford: initialize all distances to 0 (equivalent to a virtual
// source), relax all edges N-1 times, then one more pass — any edge that
// still relaxes means ARBITRAGE.

struct Edge {
    int from;
    int to;
    double weight;
};

int main() {
    int n, m;
    std::scanf("%d %d", &n, &m);
    std::vector<Edge> edges(m);
    for (auto& e : edges) {
        double rate;
        std::scanf("%d %d %lf", &e.from, &e.to, &rate);
        e.weight = -std::log(rate);
    }
    // TODO
    return 0;
}
