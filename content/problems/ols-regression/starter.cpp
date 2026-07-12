#include <cmath>
#include <cstdio>
#include <vector>

// Two passes: (1) means; (2) deviation sums Sxx, Syy, Sxy.
// beta = Sxy/Sxx; alpha = ybar - beta*xbar; r2 = Sxy*Sxy/(Sxx*Syy).

int main() {
    int n;
    std::scanf("%d", &n);
    std::vector<double> x(n), y(n);
    for (auto& v : x) std::scanf("%lf", &v);
    for (auto& v : y) std::scanf("%lf", &v);
    // TODO
    // std::printf("%.6f %.6f %.6f\n", beta, alpha, r2);
    return 0;
}
