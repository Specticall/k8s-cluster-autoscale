$port = 9090
kubectl port-forward svc/prometheus-operated -n monitoring "${port}:9090"
