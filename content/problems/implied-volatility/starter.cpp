#include <cmath>
#include <cstdio>

// Invert Black-Scholes for sigma. Vega > 0 makes the root unique:
// bisection on [1e-9, 5] until the bracket is < 1e-10 always works.

namespace {

double normCdf(double x) {
    return 0.5 * (1.0 + std::erf(x / std::sqrt(2.0)));
}

double bsCall(double S, double K, double r, double sigma, double T) {
    double volSqrtT = sigma * std::sqrt(T);
    double d1 = (std::log(S / K) + (r + 0.5 * sigma * sigma) * T) / volSqrtT;
    double d2 = d1 - volSqrtT;
    return S * normCdf(d1) - K * std::exp(-r * T) * normCdf(d2);
}

}  // namespace

int main() {
    int q;
    std::scanf("%d", &q);
    while (q-- > 0) {
        double price, S, K, r, T;
        std::scanf("%lf %lf %lf %lf %lf", &price, &S, &K, &r, &T);
        // TODO: root-find sigma such that bsCall(S,K,r,sigma,T) == price
        // std::printf("%.6f\n", sigma);
    }
    return 0;
}
