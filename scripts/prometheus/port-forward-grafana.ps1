# Get the base64-encoded password
$base64Password = kubectl get secret -n monitoring prometheus-grafana -o jsonpath="{.data.admin-password}"

# Decode base64 to plain text
$password = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($base64Password))

# Output the password (optional)
Write-Output "Port Forwarding Grafana : "
Write-Output "Password : ${password}"

$PORT = 3555
$port_forward = ($PORT.ToString() + ":80")
kubectl port-forward svc/prometheus-grafana -n monitoring $port_forward
