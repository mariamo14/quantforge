#include <algorithm>
#include <cstdio>
#include <vector>

// 1) portfolio return per day: dot(weights, returns[t]);  loss = -return
// 2) sort losses decreasing
// 3) k = floor((1-c) * T);  VaR = losses[k];  ES = mean(losses[0..k-1]) (or losses[0] if k==0)

int main() {
    int a, t;
    double c;
    std::scanf("%d %d %lf", &a, &t, &c);

    std::vector<double> weights(a);
    for (int i = 0; i < a; i++) std::scanf("%lf", &weights[i]);

    // TODO

    // std::printf("%.6f %.6f\n", var, es);
    return 0;
}
