#include <cmath>
#include <cstdio>

// phi(x) = exp(-x^2/2) / sqrt(2*pi)   (density — NOT the CDF)
// delta = N(d1); gamma = phi(d1)/(S*sigma*sqrt(T));
// vega = S*phi(d1)*sqrt(T);
// theta = -S*sigma*phi(d1)/(2*sqrt(T)) - r*K*exp(-rT)*N(d2)

int main() {
    int q;
    std::scanf("%d", &q);
    while (q-- > 0) {
        double S, K, r, sigma, T;
        std::scanf("%lf %lf %lf %lf %lf", &S, &K, &r, &sigma, &T);
        // TODO
        // std::printf("%.6f %.6f %.6f %.6f\n", delta, gamma, vega, theta);
    }
    return 0;
}
