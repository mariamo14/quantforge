#include <cmath>
#include <cstdio>

// sigma2 starts at r1^2, then sigma2 = lambda*sigma2 + (1-lambda)*r*r.
// Track the running max of annualized vol sqrt(252*sigma2).

int main() {
    double lambda;
    int n;
    std::scanf("%lf %d", &lambda, &n);
    for (int t = 0; t < n; t++) {
        double r;
        std::scanf("%lf", &r);
        // TODO
    }
    // std::printf("%.6f\n%.6f\n", finalVol, peakVol);
    return 0;
}
