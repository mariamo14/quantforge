#include <cmath>
#include <cstdio>

int main() {
    int q;
    std::scanf("%d", &q);
    while (q-- > 0) {
        double F, c, y;
        int n, m;
        std::scanf("%lf %lf %lf %d %d", &F, &c, &y, &n, &m);

        int periods = n * m;
        double coupon = c * F / m;
        double perRate = y / m;

        double price = 0.0;
        double weightedTime = 0.0;   // sum of (t/m) * CF_t * df_t
        double convexitySum = 0.0;   // sum of t(t+1) CF_t / (1+y/m)^{t+2}

        for (int t = 1; t <= periods; t++) {
            double cashflow = coupon + (t == periods ? F : 0.0);
            double df = std::pow(1.0 + perRate, -t);
            price += cashflow * df;
            weightedTime += (double)t / m * cashflow * df;
            convexitySum += (double)t * (t + 1) * cashflow
                            * std::pow(1.0 + perRate, -(t + 2));
        }

        double macaulay = weightedTime / price;
        double modified = macaulay / (1.0 + perRate);
        double convexity = convexitySum / (price * m * m);

        std::printf("%.4f %.4f %.4f %.4f\n", price, macaulay, modified, convexity);
    }
    return 0;
}
