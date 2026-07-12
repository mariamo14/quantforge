#include <cstdint>
#include <cstdio>

int main() {
    int n;
    double theta;
    std::scanf("%d %lf", &n, &theta);

    int signals = 0;
    bool wasBelow = true;  // update 1 counts if already at/above theta

    for (int i = 0; i < n; i++) {
        std::int64_t pb, vb, pa, va;
        std::scanf("%lld %lld %lld %lld", &pb, &vb, &pa, &va);

        double imbalance = (double)(vb - va) / (double)(vb + va);
        double microprice = ((double)va * pb + (double)vb * pa) / (double)(va + vb);
        std::printf("%.6f %.6f\n", imbalance, microprice);

        bool atOrAbove = imbalance >= theta;
        if (atOrAbove && wasBelow) {
            signals++;
        }
        wasBelow = !atOrAbove;
    }
    std::printf("SIGNALS %d\n", signals);
    return 0;
}
