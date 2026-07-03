#include <cmath>
#include <cstdio>

// N(x) = 0.5 * (1 + erf(x / sqrt(2)))
// d1 = (ln(S/K) + (r + sigma^2/2) T) / (sigma sqrt(T)),  d2 = d1 - sigma sqrt(T)
// C  = S N(d1) - K e^{-rT} N(d2)
// P  = K e^{-rT} N(-d2) - S N(-d1)

int main() {
    int q;
    std::scanf("%d", &q);
    while (q-- > 0) {
        double S, K, r, sigma, T;
        std::scanf("%lf %lf %lf %lf %lf", &S, &K, &r, &sigma, &T);
        // TODO
        // std::printf("%.4f %.4f %.4f %.4f\n", call, put, deltaCall, deltaPut);
    }
    return 0;
}
