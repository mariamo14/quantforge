#include <cmath>
#include <cstdio>

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

        double lo = 1e-9, hi = 5.0;
        for (int iter = 0; iter < 200 && hi - lo > 1e-12; iter++) {
            double mid = 0.5 * (lo + hi);
            if (bsCall(S, K, r, mid, T) < price) {
                lo = mid;
            } else {
                hi = mid;
            }
        }
        std::printf("%.6f\n", 0.5 * (lo + hi));
    }
    return 0;
}
