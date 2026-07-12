#include <algorithm>
#include <cmath>
#include <cstdio>
#include <vector>

// CRR tree: u = exp(sigma*sqrt(dt)), d = 1/u, q = (exp(r dt) - d)/(u - d).
// Fill terminal payoffs, then roll backward taking
// max(exercise, discounted expectation) at every node.

int main() {
    int q;
    std::scanf("%d", &q);
    while (q-- > 0) {
        double S, K, r, sigma, T;
        int n;
        std::scanf("%lf %lf %lf %lf %lf %d", &S, &K, &r, &sigma, &T, &n);
        // TODO
        // std::printf("%.4f\n", price);
    }
    return 0;
}
