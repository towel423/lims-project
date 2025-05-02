# Use the official Golang image as the base image
FROM golang:1.22-alpine

# Set the working directory inside the container
WORKDIR /app

# Install CompileDaemon and download mc (MinIO Client)
RUN go install github.com/githubnemo/CompileDaemon@latest && \
  apk update && apk add --no-cache curl && \
  curl -O https://dl.min.io/client/mc/release/linux-amd64/mc && \
  chmod +x mc && \
  mv mc /usr/local/bin/

# Copy go.mod and go.sum files and download dependencies
COPY go.mod go.sum ./
RUN go mod download


# Copy the entire project into the container
COPY . .

RUN go mod tidy

# Expose port 3000 to the outside world
EXPOSE 3000

# Command to run the application with CompileDaemon
CMD ["CompileDaemon", "--build=go build -o main .", "--command=./main"]
