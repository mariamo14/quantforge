#include <cmath>
#include <cstdio>
#include <vector>

// Follow the statement's day loop exactly:
// cash = C(S0,T) - delta0*S0
// each day: cash *= exp(r*dt); rebalance: cash -= (newDelta - oldDelta) * S_i
// at T: cash *= exp(r*dt); cash += delta_last * S_N - max(S_N - K, 0)

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
    // TODO
    return 0;
}
