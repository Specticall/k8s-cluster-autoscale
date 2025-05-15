$values_path = "../k8s/prometheus/values.yaml"
helm upgrade prometheus prometheus-community/kube-prometheus-stack -f $values_path -n monitoring --debug
