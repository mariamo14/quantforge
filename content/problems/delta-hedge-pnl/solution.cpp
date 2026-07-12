#include <algorithm>
#include <cmath>
#include <cstdio>
#include <vector>

namespace {

double normCdf(double x) {
    return 0.5 * (1.0 + std::erf(x / std::sqrt(2.0)));
}

double bsCall(double S, double K, double r, double sigma, double T) {
    double volSqrtT = sigma * std::sqrt(T);
    double d1 = (std::log(S / K) + (r + 0.5 * sigma * sigma) * T) / volSqrtT;
    return S * normCdf(d1) - K * std::exp(-r * T) * normCdf(d1 - volSqrtT);
}

double bsDelta(double S, double K, double r, double sigma, double T) {
    double volSqrtT = sigma * std::sqrt(T);
    return normCdf((std::log(S / K) + (r + 0.5 * sigma * sigma) * T) / volSqrtT);
}

}  // namespace

int main() {
    double S0, K, r, sigma, T;
    int n;
    std::scanf("%lf %lf %lf %lf %lf %d", &S0, &K, &r, &sigma, &T, &n);

    double dt = T / n;
    double growth = std::exp(r * dt);

    double premium = bsCall(S0, K, r, sigma, T);
    double delta = bsDelta(S0, K, r, sigma, T);
    double cash = premium - delta * S0;

    double terminal = 0.0;
    for (int i = 1; i <= n; i++) {
        double price;
        std::scanf("%lf", &price);
        cash *= growth;
        if (i < n) {
            double remaining = T - i * dt;
            double newDelta = bsDelta(price, K, r, sigma, remaining);
            cash -= (newDelta - delta) * price;
            delta = newDelta;
        } else {
            terminal = price;
        }
    }

    double payoff = std::max(terminal - K, 0.0);
    double hedged = cash + delta * terminal - payoff;
    double unhedged = premium * std::exp(r * T) - payoff;

    std::printf("%.4f %.4f\n", hedged, unhedged);
    return 0;
}
