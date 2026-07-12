#include <cmath>
#include <cstdio>

namespace {

double normCdf(double x) {
    return 0.5 * (1.0 + std::erf(x / std::sqrt(2.0)));
}

double normPdf(double x) {
    return std::exp(-0.5 * x * x) / std::sqrt(2.0 * M_PI);
}

}  // namespace

int main() {
    int q;
    std::scanf("%d", &q);
    while (q-- > 0) {
        double S, K, r, sigma, T;
        std::scanf("%lf %lf %lf %lf %lf", &S, &K, &r, &sigma, &T);

        double sqrtT = std::sqrt(T);
        double d1 = (std::log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * sqrtT);
        double d2 = d1 - sigma * sqrtT;

        double delta = normCdf(d1);
        double gamma = normPdf(d1) / (S * sigma * sqrtT);
        double vega = S * normPdf(d1) * sqrtT;
        double theta = -S * sigma * normPdf(d1) / (2.0 * sqrtT)
                       - r * K * std::exp(-r * T) * normCdf(d2);

        std::printf("%.6f %.6f %.6f %.6f\n", delta, gamma, vega, theta);
    }
    return 0;
}
