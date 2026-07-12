#include <algorithm>
#include <cmath>
#include <cstdio>
#include <vector>

int main() {
    int q;
    std::scanf("%d", &q);
    while (q-- > 0) {
        double S, K, r, sigma, T;
        int n;
        std::scanf("%lf %lf %lf %lf %lf %d", &S, &K, &r, &sigma, &T, &n);

        double dt = T / n;
        double u = std::exp(sigma * std::sqrt(dt));
        double d = 1.0 / u;
        double disc = std::exp(-r * dt);
        double growth = std::exp(r * dt);
        double prob = (growth - d) / (u - d);

        // terminal values V[j] for j up-moves; stock walks up by u^2 per node
        std::vector<double> value(n + 1);
        double u2 = u * u;
        double stock = S * std::pow(d, n);  // lowest terminal node
        for (int j = 0; j <= n; j++) {
            value[j] = std::max(K - stock, 0.0);
            stock *= u2;
        }

        for (int i = n - 1; i >= 0; i--) {
            stock = S * std::pow(d, i);  // lowest node of level i
            for (int j = 0; j <= i; j++) {
                double continuation = disc * (prob * value[j + 1] + (1.0 - prob) * value[j]);
                value[j] = std::max(K - stock, continuation);
                stock *= u2;
            }
        }
        std::printf("%.4f\n", value[0]);
    }
    return 0;
}
