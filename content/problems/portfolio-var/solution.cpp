#include <algorithm>
#include <cstdio>
#include <functional>
#include <vector>

int main() {
    int a, t;
    double c;
    std::scanf("%d %d %lf", &a, &t, &c);

    std::vector<double> weights(a);
    for (int i = 0; i < a; i++) std::scanf("%lf", &weights[i]);

    std::vector<double> losses(t);
    for (int day = 0; day < t; day++) {
        double portfolioReturn = 0.0;
        for (int i = 0; i < a; i++) {
            double r;
            std::scanf("%lf", &r);
            portfolioReturn += weights[i] * r;
        }
        losses[day] = -portfolioReturn;
    }

    std::sort(losses.begin(), losses.end(), std::greater<>());

    int k = (int)((1.0 - c) * t + 1e-9);  // floor, guarding float fuzz (0.05*T etc.)
    double var = losses[k];
    double es;
    if (k == 0) {
        es = losses[0];
    } else {
        double sum = 0.0;
        for (int i = 0; i < k; i++) sum += losses[i];
        es = sum / k;
    }

    std::printf("%.6f %.6f\n", var, es);
    return 0;
}
