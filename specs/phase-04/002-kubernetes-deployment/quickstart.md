# Quickstart: Kubernetes Deployment for Taskly

## Prerequisites

- Docker installed and running
- kubectl installed (v1.25 or higher)
- Helm installed (v3.0 or higher)
- Minikube installed (v1.0 or higher)

## Setup Minikube Cluster

1. **Start Minikube with appropriate resources**:
   ```bash
   minikube start --cpus=4 --memory=8192 --disk-size=20g
   ```

2. **Enable required addons**:
   ```bash
   minikube addons enable ingress
   minikube addons enable metrics-server
   ```

3. **Verify cluster is running**:
   ```bash
   kubectl cluster-info
   kubectl get nodes
   ```

## Prepare Container Images

1. **Build or pull the container images** for frontend, backend, and MCP server:
   ```bash
   # If building locally:
   docker build -t Taskly-frontend:latest -f ./phase-04/frontend/Dockerfile ./phase-04/frontend
   docker build -t Taskly-backend:latest -f ./phase-04/backend/Dockerfile ./phase-04/backend
   docker build -t Taskly-mcp-server:latest -f ./phase-04/mcp_server/Dockerfile ./phase-04/mcp_server
   ```

2. **Load images into Minikube**:
   ```bash
   minikube image load Taskly-frontend:latest
   minikube image load Taskly-backend:latest
   minikube image load Taskly-mcp-server:latest
   ```

## Deploy Using Helm

1. **Navigate to the charts directory**:
   ```bash
   cd ./phase-04/002-kubernetes-deployment/charts
   ```

2. **Install the Helm chart**:
   ```bash
   helm install Taskly ./Taskly --values ./Taskly/values.yaml
   ```

3. **Verify the deployment**:
   ```bash
   kubectl get pods
   kubectl get services
   kubectl get ingress
   ```

## Access the Application

1. **Get the Minikube IP**:
   ```bash
   minikube ip
   ```

2. **Add an entry to your hosts file**:
   ```
   <minikube-ip> Taskly.local
   ```

3. **Access the application**:
   - Frontend: http://Taskly.local
   - Backend API: http://Taskly.local/api

## Useful Commands

- **Check application status**:
  ```bash
  kubectl get pods,svc,ingress
  ```

- **View logs**:
  ```bash
  kubectl logs -l app=frontend
  kubectl logs -l app=backend
  kubectl logs -l app=mcp-server
  ```

- **Scale deployments**:
  ```bash
  kubectl scale deployment frontend-deployment --replicas=3
  ```

- **Update with new image**:
  ```bash
  # After building a new image
  minikube image load Taskly-frontend:latest
  kubectl set image deployment/frontend-deployment frontend-container=Taskly-frontend:latest
  ```

## Troubleshooting

- **If pods are not starting**: Check resource limits and available cluster resources
- **If services are not accessible**: Verify ingress controller is running and DNS configuration
- **If inter-service communication fails**: Check service names and ports match configuration
