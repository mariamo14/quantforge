#include <cmath>
#include <cstdio>
#include <vector>

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
        e.from--;
        e.to--;
        e.weight = -std::log(rate);
    }

    // dist[] = 0 everywhere == virtual source with 0-weight edges to all nodes:
    // covers every component without an explicit extra node.
    std::vector<double> dist(n, 0.0);
    for (int round = 0; round < n - 1; round++) {
        bool changed = false;
        for (const Edge& e : edges) {
            if (dist[e.from] + e.weight < dist[e.to] - 1e-12) {
                dist[e.to] = dist[e.from] + e.weight;
                changed = true;
            }
        }
        if (!changed) {
            break;
        }
    }

    bool arbitrage = false;
    for (const Edge& e : edges) {
        if (dist[e.from] + e.weight < dist[e.to] - 1e-9) {
            arbitrage = true;
            break;
        }
    }

    std::puts(arbitrage ? "ARBITRAGE" : "OK");
    return 0;
}
