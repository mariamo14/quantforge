#include <cmath>
#include <cstdio>
#include <vector>

int main() {
    double S0, K, r, sigma, T;
    int n;
    std::scanf("%lf %lf %lf %lf %lf %d", &S0, &K, &r, &sigma, &T, &n);

    double drift = (r - 0.5 * sigma * sigma) * T;
    double volSqrtT = sigma * std::sqrt(T);
    double discount = std::exp(-r * T);

    std::vector<double> payoffs(n);
    double sum = 0.0;
    for (int i = 0; i < n; i++) {
        double z;
        std::scanf("%lf", &z);
        double terminal = S0 * std::exp(drift + volSqrtT * z);
        payoffs[i] = terminal > K ? terminal - K : 0.0;
        sum += payoffs[i];
    }

    double mean = sum / n;
    double sumSq = 0.0;
    for (int i = 0; i < n; i++) {
        double dev = payoffs[i] - mean;
        sumSq += dev * dev;
    }
    double sampleStd = std::sqrt(sumSq / (n - 1));

    double price = discount * mean;
    double standardError = discount * sampleStd / std::sqrt((double)n);
    std::printf("%.4f %.4f\n", price, standardError);
    return 0;
}
