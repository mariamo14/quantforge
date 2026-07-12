#include <cmath>
#include <cstdio>

// w* = (s2^2 - rho*s1*s2) / (s1^2 + s2^2 - 2*rho*s1*s2)
// mu_p = w*mu1 + (1-w)*mu2
// var_p = w^2 s1^2 + (1-w)^2 s2^2 + 2 w (1-w) rho s1 s2   (guard tiny negatives)

int main() {
    int q;
    std::scanf("%d", &q);
    while (q-- > 0) {
        double mu1, s1, mu2, s2, rho;
        std::scanf("%lf %lf %lf %lf %lf", &mu1, &s1, &mu2, &s2, &rho);
        // TODO
        // std::printf("%.6f %.6f %.6f\n", w, muP, sigmaP);
    }
    return 0;
}
