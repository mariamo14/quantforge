#include <algorithm>
#include <cmath>
#include <cstdio>

int main() {
    int q;
    std::scanf("%d", &q);
    while (q-- > 0) {
        double mu1, s1, mu2, s2, rho;
        std::scanf("%lf %lf %lf %lf %lf", &mu1, &s1, &mu2, &s2, &rho);

        double cov = rho * s1 * s2;
        double w = (s2 * s2 - cov) / (s1 * s1 + s2 * s2 - 2.0 * cov);
        double muP = w * mu1 + (1.0 - w) * mu2;
        double variance = w * w * s1 * s1 + (1.0 - w) * (1.0 - w) * s2 * s2
                          + 2.0 * w * (1.0 - w) * cov;
        // rho = -1 can land a hair below zero in floating point
        double sigmaP = std::sqrt(std::max(variance, 0.0));

        std::printf("%.6f %.6f %.6f\n", w, muP, sigmaP);
    }
    return 0;
}
