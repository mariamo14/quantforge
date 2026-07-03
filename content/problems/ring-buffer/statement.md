Feed handlers pass messages to strategy threads through **fixed-capacity ring buffers**: preallocated, no locks, no allocation on the hot path. When the buffer is full, the producer must decide what to do — here, the policy is **drop the incoming message**.

Implement a ring buffer of sequence numbers with capacity $C$ and process a script of operations.

## Input

The first line contains the capacity $C$ ($1 \le C \le 10^5$) and the number of operations $M$ ($1 \le M \le 2 \cdot 10^5$).

Each of the next $M$ lines is one of:

- `PUSH x` — enqueue integer $x$ ($-10^9 \le x \le 10^9$)
- `POP` — dequeue the oldest element
- `SIZE` — report the current number of elements

## Output

For each operation, print one line:

- `PUSH x` → `OK` if enqueued, `DROP` if the buffer was full
- `POP` → the dequeued value, or `EMPTY` if there was nothing to pop
- `SIZE` → the current element count

## Constraints

Your implementation must be $O(1)$ per operation. A `std::deque` will pass, but the intended solution is a fixed `std::vector` with head/tail indices — write it the way you would for a real SPSC queue (wrap with modulo or a power-of-two mask).
