#include <cmath>
#include <cstdio>
#include <vector>

// S_T = S0 * exp((r - sigma^2/2) T + sigma sqrt(T) Z)
// price = e^{-rT} * mean(max(S_T - K, 0))
// SE    = e^{-rT} * sampleStd(payoffs) / sqrt(N)

int main() {
    double S0, K, r, sigma, T;
    int n;
    std::scanf("%lf %lf %lf %lf %lf %d", &S0, &K, &r, &sigma, &T, &n);
    for (int i = 0; i < n; i++) {
        double z;
        std::scanf("%lf", &z);
        // TODO
    }
    // std::printf("%.4f %.4f\n", price, standardError);
    return 0;
}
