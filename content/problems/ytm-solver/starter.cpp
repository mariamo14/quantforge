#include <cmath>
#include <cstdio>

// price(y) is strictly decreasing in y -> bisection on [1e-9, 2].
// Reuse the bond pricing loop from the Bond Price problem as price(y).

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
        // TODO: bisect for the yield, print with %.6f
    }
    return 0;
}
