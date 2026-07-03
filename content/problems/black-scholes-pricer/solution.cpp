#include <cmath>
#include <cstdio>

namespace {

double normCdf(double x) {
    return 0.5 * (1.0 + std::erf(x / std::sqrt(2.0)));
}

}  // namespace

int main() {
    int q;
    std::scanf("%d", &q);
    while (q-- > 0) {
        double S, K, r, sigma, T;
        std::scanf("%lf %lf %lf %lf %lf", &S, &K, &r, &sigma, &T);

        double volSqrtT = sigma * std::sqrt(T);
        double d1 = (std::log(S / K) + (r + 0.5 * sigma * sigma) * T) / volSqrtT;
        double d2 = d1 - volSqrtT;
        double discount = std::exp(-r * T);

        double call = S * normCdf(d1) - K * discount * normCdf(d2);
        double put = K * discount * normCdf(-d2) - S * normCdf(-d1);
        double deltaCall = normCdf(d1);
        double deltaPut = deltaCall - 1.0;

        std::printf("%.4f %.4f %.4f %.4f\n", call, put, deltaCall, deltaPut);
    }
    return 0;
}
