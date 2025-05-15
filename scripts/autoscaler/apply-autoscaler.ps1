$path = "../../k8s/autoscaler"
$namespace = "autoscale"
$filenames = Get-ChildItem -Path $path -File | ForEach-Object { $_.Name }

kubectl get namespaces $namespace
if ($? -eq $false) {
  Write-Host "Namespace ${namespace} does not exist, creating one..."
  kubectl create namespace $namespace
}

foreach ($file in $filenames) {
  kubectl apply -f "${path}/${file}" `
  --namespace $namespace
}
