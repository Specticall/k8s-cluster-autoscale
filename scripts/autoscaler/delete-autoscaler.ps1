1
$path = "../../k8s/autoscaler"
$namespace = "autoscale"
$filenames = Get-ChildItem -Path $path -File | ForEach-Object { $_.Name }

foreach ($file in $filenames) {
  kubectl delete -f "${path}/${file}" `
  --namespace $namespace
}
