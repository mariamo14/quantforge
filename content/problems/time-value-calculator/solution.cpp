#include <cmath>
#include <cstdio>
#include <cstring>

int main() {
    int q;
    std::scanf("%d", &q);
    while (q-- > 0) {
        char op[3];
        double amount, r;
        int n;
        std::scanf("%2s %lf %lf %d", op, &amount, &r, &n);

        double factor = std::pow(1.0 + r, n);
        double result = std::strcmp(op, "FV") == 0 ? amount * factor : amount / factor;
        std::printf("%.2f\n", result);
    }
    return 0;
}
