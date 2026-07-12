#include <cmath>
#include <cstdio>
#include <vector>

int main() {
    int n;
    std::scanf("%d", &n);
    std::vector<double> x(n), y(n);
    for (auto& v : x) std::scanf("%lf", &v);
    for (auto& v : y) std::scanf("%lf", &v);

    double xbar = 0.0, ybar = 0.0;
    for (int i = 0; i < n; i++) {
        xbar += x[i];
        ybar += y[i];
    }
    xbar /= n;
    ybar /= n;

    double sxx = 0.0, syy = 0.0, sxy = 0.0;
    for (int i = 0; i < n; i++) {
        double dx = x[i] - xbar;
        double dy = y[i] - ybar;
        sxx += dx * dx;
        syy += dy * dy;
        sxy += dx * dy;
    }

    double beta = sxy / sxx;
    double alpha = ybar - beta * xbar;
    double r2 = (sxy * sxy) / (sxx * syy);

    std::printf("%.6f %.6f %.6f\n", beta, alpha, r2);
    return 0;
}
