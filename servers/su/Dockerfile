# Stage 1: Build the dynamic binary
FROM rust:1.75.0 as builder

# Set the working directory in the container
WORKDIR /usr/src/su

# Install required dependencies for building
RUN apt-get update && apt-get install -y \
    llvm-dev \
    libclang-dev \
    clang \
    librocksdb-dev

# Copy the manifests
COPY Cargo.toml Cargo.lock ./

# This step is to cache your dependencies
RUN mkdir src && \
    echo "fn main() {}" > src/main.rs && \
    cargo build --release && \
    rm -f target/release/deps/su*

# Now copy the actual source code and build the application
COPY src ./src
COPY migrations ./migrations
RUN cargo build --release

# The final output binary will be in /usr/src/su/target/release/su


# Stage 2: Create the runnable image using the binary
FROM scratch as runner

# Set the working directory in the container
WORKDIR /app

# Copy the binary from your local file system to the container
COPY --from=builder /usr/src/su/target/release/su /app/su

# Copy necessary libraries from the builder
COPY --from=builder /lib/x86_64-linux-gnu/ /lib/x86_64-linux-gnu/
COPY --from=builder /lib64/ /lib64/

# Provide instructions for building the binary
# (This will be displayed when someone runs `docker build`)
LABEL build_instructions="To build just the binary, run the following command: docker build --target builder -t su ."

# Run the binary - provide args on execution
ENTRYPOINT [ "/app/su" ]

# Run time command arguments, default is empty
CMD []