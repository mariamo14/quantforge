#include <cmath>
#include <cstdio>

namespace {

double bondPrice(double F, double c, double y, int n, int m) {
    int periods = n * m;
    double coupon = c * F / m;
    double price = 0.0;
    for (int t = 1; t <= periods; t++) {
        price += (coupon + (t == periods ? F : 0.0)) * std::pow(1.0 + y / m, -t);
    }
    return price;
}

}  // namespace

int main() {
    int q;
    std::scanf("%d", &q);
    while (q-- > 0) {
        double price, F, c;
        int n, m;
        std::scanf("%lf %lf %lf %d %d", &price, &F, &c, &n, &m);

        double lo = 1e-9, hi = 2.0;
        for (int iter = 0; iter < 200 && hi - lo > 1e-12; iter++) {
            double mid = 0.5 * (lo + hi);
            // price decreases in yield: too-high computed price => yield is higher
            if (bondPrice(F, c, mid, n, m) > price) {
                lo = mid;
            } else {
                hi = mid;
            }
        }
        std::printf("%.6f\n", 0.5 * (lo + hi));
    }
    return 0;
}
