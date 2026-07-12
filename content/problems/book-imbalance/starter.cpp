#include <cstdint>
#include <cstdio>

// imbalance = (Vb - Va) / (Vb + Va)
// microprice = (Va*Pb + Vb*Pa) / (Va + Vb)   -- note the cross-weighting!
// Count upward crossings of the threshold (below theta -> at/above theta).

int main() {
    int n;
    double theta;
    std::scanf("%d %lf", &n, &theta);
    for (int i = 0; i < n; i++) {
        std::int64_t pb, vb, pa, va;
        std::scanf("%lld %lld %lld %lld", &pb, &vb, &pa, &va);
        // TODO
    }
    // std::printf("SIGNALS %d\n", signals);
    return 0;
}
